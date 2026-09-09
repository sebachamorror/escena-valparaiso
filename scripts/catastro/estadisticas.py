#!/usr/bin/env python3
"""
Estadísticas del catastro (brief §14). Todo valor es DATO ENCONTRADO en el catastro:
cuenta registros con fuente, no estima el universo real.

Uso:
  python3 scripts/catastro/estadisticas.py            # imprime resumen y escribe informes/estadisticas.json
  python3 scripts/catastro/estadisticas.py --json     # solo JSON por stdout
"""
import datetime
import json
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lib  # noqa: E402


def active(items):
    return [r for r in items if r.get("estado") not in ("DUPLICADO", "DESCARTADO")]


def compute(data=None):
    data = data or lib.load_all()
    A = {c: active(data[c]) for c in lib.COLLECTIONS}
    year = datetime.date.today().year
    comp_by_id = {c["id"]: c for c in data["companias"]}
    venue_by_id = {v["id"]: v for v in data["espacios"]}
    fes_by_id = {f["id"]: f for f in data["festivales"]}
    st = {
        "generado": lib.today(),
        "nota": "Todos los valores son DATO ENCONTRADO (registros con fuente en el catastro). "
                "No son estimaciones del universo real ni extrapolaciones.",
    }
    st["totales"] = {c: len(A[c]) for c in lib.COLLECTIONS}
    st["totales"]["fuentes"] = len(data["fuentes"])
    st["estados"] = {c: dict(Counter(r.get("estado") for r in data[c])) for c in lib.COLLECTIONS}

    def by_commune(col, key=lambda r: r.get("comuna")):
        return dict(Counter(key(r) or "sin-comuna" for r in A[col]).most_common())

    def by_province(col, key=lambda r: r.get("comuna")):
        return dict(Counter(lib.province_of(key(r)) or "sin-provincia" for r in A[col]).most_common())

    for col in ("companias", "espacios", "funciones", "festivales", "personas", "financiamiento"):
        st[f"{col}_por_provincia"] = by_province(col)
        st[f"{col}_por_comuna"] = by_commune(col)
    obra_key = lambda r: (comp_by_id.get(r.get("compania") or "") or {}).get("comuna")  # noqa: E731
    st["obras_por_provincia"] = by_province("obras", obra_key)
    st["obras_por_comuna"] = by_commune("obras", obra_key)

    all_communes = [s for s in lib.communes() if not s.startswith("__")]
    st["comunas_sin_companias"] = [s for s in all_communes if s not in st["companias_por_comuna"]]
    st["comunas_sin_espacios"] = [s for s in all_communes if s not in st["espacios_por_comuna"]]
    st["comunas_sin_registros"] = [
        s for s in all_communes
        if s not in st["companias_por_comuna"] and s not in st["espacios_por_comuna"]
        and s not in st["funciones_por_comuna"] and s not in st["festivales_por_comuna"]
    ]
    act = {}
    for s in all_communes:
        act[s] = {
            "comuna": lib.commune_name(s), "provincia": lib.province_of(s),
            "companias": st["companias_por_comuna"].get(s, 0),
            "espacios": st["espacios_por_comuna"].get(s, 0),
            "funciones": st["funciones_por_comuna"].get(s, 0),
            "festivales": st["festivales_por_comuna"].get(s, 0),
            "obras": st["obras_por_comuna"].get(s, 0),
        }
        act[s]["total"] = sum(v for k, v in act[s].items() if isinstance(v, int))
    st["actividad_por_comuna"] = dict(sorted(act.items(), key=lambda kv: (-kv[1]["total"], kv[0])))

    # Actividad por compañía
    func_by_comp = Counter(f.get("compania") for f in A["funciones"] if f.get("compania"))
    activity = []
    for c in A["companias"]:
        n_f = func_by_comp.get(c["id"], 0)
        n_o = len(c.get("obras") or [])
        n_fes = len(c.get("festivales") or [])
        n_esp = len(c.get("espacios") or [])
        activity.append({"id": c["id"], "nombre": c["nombre"], "comuna": c.get("comuna"),
                         "funciones": n_f, "obras": n_o, "festivales": n_fes, "espacios": n_esp,
                         "puntaje": n_f * 2 + n_o + n_fes + n_esp})
    activity.sort(key=lambda x: (-x["puntaje"], x["nombre"]))
    st["companias_mas_activas"] = activity[:30]
    st["funciones_por_compania"] = {a["id"]: a["funciones"] for a in activity if a["funciones"]}

    # Espacios
    func_by_venue = Counter(f.get("espacio") for f in A["funciones"] if f.get("espacio"))
    venues = []
    for v in A["espacios"]:
        venues.append({"id": v["id"], "nombre": v["nombre"], "comuna": v.get("comuna"),
                       "funciones": func_by_venue.get(v["id"], 0),
                       "companias": len(v.get("companias") or []),
                       "puntaje": func_by_venue.get(v["id"], 0) * 2 + len(v.get("companias") or [])})
    venues.sort(key=lambda x: (-x["puntaje"], x["nombre"]))
    st["espacios_mayor_programacion"] = venues[:30]

    # Circulación
    circ = []
    for c in A["companias"]:
        sede = c.get("comuna")
        trabajo = [x for x in (c.get("comunas_trabajo") or []) if x != sede]
        regs = c.get("regiones_circulacion") or []
        if trabajo or regs:
            circ.append({"id": c["id"], "nombre": c["nombre"], "sede": sede,
                         "comunas_trabajo": trabajo, "regiones": regs})
    circ.sort(key=lambda x: (-len(x["comunas_trabajo"]), -len(x["regiones"]), x["nombre"]))
    st["companias_que_circulan"] = circ

    # Concentración
    total = len(A["companias"])
    cc = [(k, v) for k, v in st["companias_por_comuna"].items() if k != "sin-comuna"]
    st["concentracion_companias"] = {
        "total": total,
        "top1": {"comuna": cc[0][0], "n": cc[0][1], "share": round(cc[0][1] / total, 3)} if cc and total else None,
        "top3_share": round(sum(v for _, v in cc[:3]) / total, 3) if cc and total else None,
        "comunas_con_companias": len(cc), "comunas_totales": len(all_communes),
    }

    # Trayectoria
    with_year = [c for c in A["companias"] if isinstance(c.get("anio_creacion"), int)]
    st["companias_emergentes"] = sorted(
        [{"id": c["id"], "nombre": c["nombre"], "comuna": c.get("comuna"), "anio": c["anio_creacion"]}
         for c in with_year if c["anio_creacion"] >= year - 5], key=lambda x: (-x["anio"], x["nombre"]))
    st["companias_mayor_trayectoria"] = sorted(
        [{"id": c["id"], "nombre": c["nombre"], "comuna": c.get("comuna"), "anio": c["anio_creacion"]}
         for c in with_year], key=lambda x: (x["anio"], x["nombre"]))[:25]
    st["companias_sin_anio_creacion"] = total - len(with_year)

    # Fuentes
    st["fuentes_por_calidad"] = dict(sorted(Counter(s.get("calidad") for s in data["fuentes"]).items()))
    refs = Counter()
    for col in lib.COLLECTIONS:
        for r in A[col]:
            for f in r.get("fuentes") or []:
                refs[f] += 1
    sidx = lib.sources_index(data)
    by_pub = Counter()
    for sid, n in refs.items():
        by_pub[(sidx.get(sid) or {}).get("publicador") or "sin publicador"] += n
    st["fuentes_mas_productivas"] = [{"publicador": p, "registros_respaldados": n} for p, n in by_pub.most_common(25)]
    st["fuentes_por_capa"] = dict(sorted(Counter(str(s.get("capa")) for s in data["fuentes"]).items()))

    st["personas_por_rol"] = dict(Counter(rol for p in A["personas"] for rol in (p.get("roles") or [])).most_common())
    st["companias_por_tipo"] = dict(Counter(c.get("tipo") or "sin tipo" for c in A["companias"]).most_common())
    st["companias_por_disciplina"] = dict(Counter(d for c in A["companias"] for d in (c.get("disciplinas") or [])).most_common())
    st["espacios_por_tipo"] = dict(Counter(v.get("tipo_espacio") or "sin tipo" for v in A["espacios"]).most_common())
    st["funciones_por_tipo"] = dict(Counter(f.get("tipo_funcion") or "sin tipo" for f in A["funciones"]).most_common())
    st["funciones_por_anio"] = dict(sorted(Counter((f.get("fecha") or "")[:4] or "sin fecha" for f in A["funciones"]).items()))
    n_esp = len(A["espacios"])
    st["relacion_companias_espacios"] = {
        "companias_con_espacio_registrado": sum(1 for c in A["companias"] if c.get("espacios")),
        "espacios_con_companias_registradas": sum(1 for v in A["espacios"] if v.get("companias")),
        "companias_por_espacio": round(total / n_esp, 2) if n_esp else None,
    }
    st["festivales_participantes"] = sorted(
        [{"id": f["id"], "nombre": f["nombre"], "comuna": f.get("comuna"), "companias": len(f.get("companias") or [])}
         for f in A["festivales"]], key=lambda x: (-x["companias"], x["nombre"]))[:20]

    qpath = lib.DATOS / "consultas.json"
    if qpath.exists():
        qs = json.loads(qpath.read_text(encoding="utf-8"))
        st["consultas"] = {"total": len(qs), "por_estado": dict(Counter(q["estado"] for q in qs)),
                           "por_capa": {str(k): v for k, v in sorted(Counter(q["capa"] for q in qs).items())}}
    _ = fes_by_id, venue_by_id
    return st


def main(argv):
    st = compute()
    lib.INFORMES.mkdir(parents=True, exist_ok=True)
    (lib.INFORMES / "estadisticas.json").write_text(json.dumps(st, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    if "--json" in argv:
        print(json.dumps(st, ensure_ascii=False, indent=1))
        return 0
    print("Totales:", json.dumps(st["totales"], ensure_ascii=False))
    print("Por provincia (compañías):", json.dumps(st["companias_por_provincia"], ensure_ascii=False))
    top = list(st["actividad_por_comuna"].items())[:8]
    print("Comunas con más actividad:", ", ".join(f"{k} ({v['total']})" for k, v in top))
    print("Comunas sin registros:", len(st["comunas_sin_registros"]), st["comunas_sin_registros"])
    print("Fuentes por calidad:", st["fuentes_por_calidad"])
    if "consultas" in st:
        print("Consultas:", st["consultas"]["por_estado"])
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
