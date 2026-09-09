#!/usr/bin/env python3
"""
Genera los informes Markdown del catastro en catastro/informes/.

Uso: python3 scripts/catastro/informes.py

Archivos: informe-general.md, informe-por-provincia.md, informe-por-comuna.md,
informe-companias.md, informe-espacios.md, informe-cartelera.md, informe-festivales.md,
informe-personas.md, informe-financiamiento.md. El informe estratégico (brief §16) se
redacta a mano en informe-estrategico.md a partir de estos.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lib  # noqa: E402
import estadisticas  # noqa: E402


def cell(v):
    s = lib.csv_value(v)
    return s.replace("|", "\\|").replace("\n", " ")


def table(headers, rows):
    out = ["| " + " | ".join(headers) + " |", "|" + "---|" * len(headers)]
    for r in rows:
        out.append("| " + " | ".join(cell(x) for x in r) + " |")
    return "\n".join(out) if rows else "_Sin registros._"


def name(data, col, rid):
    rec = lib.find_by_id(data[col], rid) if rid else None
    return (rec.get(lib.NAME_FIELD.get(col) or "id") if rec else None) or lib.NOT_FOUND


def src_quality(rec, sidx):
    return lib.best_quality(rec, sidx)


def src_list(rec, sidx, n=2):
    out = []
    for sid in (rec.get("fuentes") or [])[:n]:
        s = sidx.get(sid)
        if s:
            out.append(f"[{s.get('calidad')}] {s.get('publicador') or ''}: {s.get('url') or s.get('titulo')}")
    return " · ".join(out) if out else lib.NOT_FOUND


def active(items):
    return [r for r in items if r.get("estado") not in ("DUPLICADO", "DESCARTADO")]


def write(name_, text):
    lib.INFORMES.mkdir(parents=True, exist_ok=True)
    (lib.INFORMES / name_).write_text(text.strip() + "\n", encoding="utf-8")


def general(data, st):
    L = [f"# Informe general — Catastro del ecosistema teatral de la Región de Valparaíso",
         f"\nGenerado: {st['generado']}. Fase 1 (descubrimiento) en curso. "
         f"**Todas las cifras son DATO ENCONTRADO**: cuentan registros con fuente en el catastro y no "
         f"describen el universo real. Ninguna es una ESTIMACIÓN.\n",
         "## Totales", table(["Colección", "Registros"], [(k, v) for k, v in st["totales"].items()]),
         "\n## Estados por colección",
         table(["Colección"] + list(lib.STATES),
               [(c,) + tuple(st["estados"][c].get(s, 0) for s in lib.STATES) for c in lib.COLLECTIONS]),
         "\n## Compañías por provincia",
         table(["Provincia", "Compañías", "%"],
               [(lib.province_name(p), n, f"{100*n/max(1, st['totales']['companias']):.0f}%")
                for p, n in st["companias_por_provincia"].items()]),
         "\n## Comunas con más actividad registrada (top 15)",
         table(["Comuna", "Provincia", "Compañías", "Espacios", "Funciones", "Festivales", "Obras"],
               [(v["comuna"], lib.province_name(v["provincia"]), v["companias"], v["espacios"],
                 v["funciones"], v["festivales"], v["obras"])
                for k, v in list(st["actividad_por_comuna"].items())[:15]]),
         "\n## Vacíos de información",
         f"- Comunas sin ningún registro: **{len(st['comunas_sin_registros'])}** de 38 → "
         + (", ".join(lib.commune_name(s) for s in st["comunas_sin_registros"]) or "ninguna"),
         f"- Comunas sin compañías registradas: {len(st['comunas_sin_companias'])} → "
         + (", ".join(lib.commune_name(s) for s in st["comunas_sin_companias"]) or "ninguna"),
         f"- Comunas sin espacios registrados: {len(st['comunas_sin_espacios'])} → "
         + (", ".join(lib.commune_name(s) for s in st["comunas_sin_espacios"]) or "ninguna"),
         f"- Compañías sin año de creación: {st['companias_sin_anio_creacion']}",
         "\n## Concentración territorial (compañías)",
         f"- Total: {st['concentracion_companias']['total']} en {st['concentracion_companias']['comunas_con_companias']} "
         f"de {st['concentracion_companias']['comunas_totales']} comunas.",
         (f"- Comuna con más compañías: {lib.commune_name(st['concentracion_companias']['top1']['comuna'])} "
          f"({st['concentracion_companias']['top1']['n']}, {100*st['concentracion_companias']['top1']['share']:.0f}%). "
          f"Las tres primeras concentran {100*st['concentracion_companias']['top3_share']:.0f}%."
          if st["concentracion_companias"]["top1"] else "- Sin datos."),
         "\n## Compañías más activas (funciones×2 + obras + festivales + espacios)",
         table(["Id", "Compañía", "Comuna", "Funciones", "Obras", "Festivales", "Espacios"],
               [(a["id"], a["nombre"], lib.commune_name(a["comuna"]), a["funciones"], a["obras"], a["festivales"], a["espacios"])
                for a in st["companias_mas_activas"][:15]]),
         "\n## Espacios con mayor programación registrada",
         table(["Id", "Espacio", "Comuna", "Funciones", "Compañías"],
               [(v["id"], v["nombre"], lib.commune_name(v["comuna"]), v["funciones"], v["companias"])
                for v in st["espacios_mayor_programacion"][:15]]),
         "\n## Compañías que circulan fuera de su comuna",
         table(["Id", "Compañía", "Sede", "Comunas de trabajo", "Regiones"],
               [(c["id"], c["nombre"], lib.commune_name(c["sede"]),
                 [lib.commune_name(x) for x in c["comunas_trabajo"]], c["regiones"])
                for c in st["companias_que_circulan"][:25]]),
         "\n## Compañías emergentes (creadas en los últimos cinco años, según fuente)",
         table(["Id", "Compañía", "Comuna", "Año"],
               [(c["id"], c["nombre"], lib.commune_name(c["comuna"]), c["anio"]) for c in st["companias_emergentes"]]),
         "\n## Compañías con mayor trayectoria (año de creación con fuente)",
         table(["Id", "Compañía", "Comuna", "Año"],
               [(c["id"], c["nombre"], lib.commune_name(c["comuna"]), c["anio"]) for c in st["companias_mayor_trayectoria"][:15]]),
         "\n## Fuentes",
         table(["Calidad", "Descripción", "Fuentes"],
               [(q, lib.QUALITY_LABELS[q], st["fuentes_por_calidad"].get(q, 0)) for q in lib.QUALITIES]),
         "\nPublicadores más productivos (registros respaldados):",
         table(["Publicador", "Registros"], [(f["publicador"], f["registros_respaldados"]) for f in st["fuentes_mas_productivas"][:15]]),
         ]
    if "consultas" in st:
        L += ["\n## Cola de consultas",
              f"- Total {st['consultas']['total']}: {st['consultas']['por_estado']}",
              "- Por capa: " + ", ".join(f"capa {k}: {v}" for k, v in st["consultas"]["por_capa"].items())]
    L += ["\n## Cómo leer este informe",
          "- Un registro `DESCUBIERTO` existe en al menos una fuente pero no se ha cruzado; `PARCIAL` tiene comuna y "
          "fuente de calidad A–D con algún dato adicional; `VERIFICADO` fue revisado en Fase 2.",
          "- Las cifras por comuna dependen de cuántas consultas se han corrido en esa comuna: una comuna con cero "
          "registros puede tener teatro no descubierto aún. Ver `informe-por-comuna.md` para el avance de consultas.",
          "- Datos y fuentes: `catastro/datos/*.json` y `catastro/datos/csv/*.csv`."]
    write("informe-general.md", "\n".join(L))


def by_province(data, st, sidx):
    L = ["# Informe por provincia", f"\nGenerado: {st['generado']}. Cifras = DATO ENCONTRADO.\n"]
    provs = sorted(lib.provinces().values(), key=lambda p: p["sort"])
    for p in provs:
        slug = p["slug"]
        comps = [c for c in active(data["companias"]) if lib.province_of(c.get("comuna")) == slug]
        esps = [v for v in active(data["espacios"]) if lib.province_of(v.get("comuna")) == slug]
        fess = [f for f in active(data["festivales"]) if lib.province_of(f.get("comuna")) == slug]
        funs = [f for f in active(data["funciones"]) if lib.province_of(f.get("comuna")) == slug]
        communes = [s for s, c in lib.communes().items() if not s.startswith("__") and c["province"] == slug]
        L += [f"## {p['name']}",
              f"- Compañías: {len(comps)} · Espacios: {len(esps)} · Festivales: {len(fess)} · Funciones: {len(funs)}",
              "- Comunas: " + ", ".join(f"{lib.commune_name(s)} ({st['actividad_por_comuna'][s]['total']})" for s in communes),
              "\n### Compañías",
              table(["Id", "Compañía", "Comuna", "Tipo", "Estado"],
                    [(c["id"], c["nombre"], lib.commune_name(c.get("comuna")), c.get("tipo"), c["estado"])
                     for c in sorted(comps, key=lambda x: (x.get("comuna") or "", x["nombre"]))]),
              "\n### Espacios",
              table(["Id", "Espacio", "Comuna", "Tipo", "Administración", "Estado"],
                    [(v["id"], v["nombre"], lib.commune_name(v.get("comuna")), v.get("tipo_espacio"),
                      v.get("administracion"), v["estado"]) for v in sorted(esps, key=lambda x: (x.get("comuna") or "", x["nombre"]))]),
              "\n### Festivales",
              table(["Id", "Festival", "Comuna", "Organización", "Estado"],
                    [(f["id"], f["nombre"], lib.commune_name(f.get("comuna")), f.get("organizacion"), f["estado"]) for f in fess]),
              ""]
    write("informe-por-provincia.md", "\n".join(L))


def by_commune(data, st, sidx):
    qpath = lib.DATOS / "consultas.json"
    qs = json.loads(qpath.read_text(encoding="utf-8")) if qpath.exists() else []
    L = ["# Informe por comuna", f"\nGenerado: {st['generado']}. Cifras = DATO ENCONTRADO. "
         "Se listan las 38 comunas, incluidas las que aún no tienen registros, con el avance de consultas.\n"]
    provs = sorted(lib.provinces().values(), key=lambda p: p["sort"])
    for p in provs:
        L.append(f"# {p['name']}\n")
        communes = [s for s, c in lib.communes().items() if not s.startswith("__") and c["province"] == p["slug"]]
        for s in communes:
            a = st["actividad_por_comuna"][s]
            qq = [q for q in qs if q.get("comuna") == s]
            done = sum(1 for q in qq if q["estado"] != "pendiente")
            comps = [c for c in active(data["companias"]) if c.get("comuna") == s]
            esps = [v for v in active(data["espacios"]) if v.get("comuna") == s]
            fess = [f for f in active(data["festivales"]) if f.get("comuna") == s]
            funs = [f for f in active(data["funciones"]) if f.get("comuna") == s]
            visiting = sorted({name(data, "companias", f.get("compania")) for f in funs if f.get("compania")
                               and (lib.find_by_id(data["companias"], f["compania"]) or {}).get("comuna") != s})
            L += [f"## {a['comuna']}",
                  f"- Compañías {a['companias']} · Espacios {a['espacios']} · Festivales {a['festivales']} · "
                  f"Funciones {a['funciones']} · Consultas por comuna hechas {done}/{len(qq)}"]
            if a["total"] == 0:
                L.append("- **Sin registros aún.** No significa que no exista teatro: faltan consultas o fuentes locales.")
            if comps:
                L.append("- Compañías: " + "; ".join(f"{c['nombre']} ({c['id']}, {c['estado']})" for c in comps))
            if esps:
                L.append("- Espacios: " + "; ".join(f"{v['nombre']} ({v['id']}, {v.get('tipo_espacio') or 's/t'})" for v in esps))
            if fess:
                L.append("- Festivales: " + "; ".join(f"{f['nombre']} ({f['id']})" for f in fess))
            if visiting:
                L.append("- Compañías de otras comunas que han funcionado aquí: " + "; ".join(visiting))
            L.append("")
    write("informe-por-comuna.md", "\n".join(L))


def companies(data, st, sidx):
    rows = []
    for c in sorted(active(data["companias"]), key=lambda x: (x.get("comuna") or "zz", x["nombre"])):
        rows.append((c["id"], c["nombre"], lib.commune_name(c.get("comuna")), c.get("tipo"), c.get("disciplinas"),
                     c.get("anio_creacion"), c.get("director"), len(c.get("obras") or []),
                     st["funciones_por_compania"].get(c["id"], 0),
                     "sí" if (c.get("instagram") or c.get("facebook") or c.get("web")) else "no",
                     c["estado"], src_quality(c, sidx), src_list(c, sidx, 1)))
    dup = [c for c in data["companias"] if c.get("estado") == "DUPLICADO"]
    L = ["# Informe de compañías", f"\nGenerado: {st['generado']}. {len(rows)} compañías activas en el catastro "
         f"(+{len(dup)} marcadas duplicadas). Cifras = DATO ENCONTRADO.\n",
         table(["Id", "Compañía", "Comuna", "Tipo", "Disciplinas", "Año", "Director/a", "Obras", "Funciones",
                "Web/redes", "Estado", "Fuente", "Fuente principal"], rows),
         "\n## Por tipo", table(["Tipo", "Compañías"], list(st["companias_por_tipo"].items())),
         "\n## Por disciplina", table(["Disciplina", "Compañías"], list(st["companias_por_disciplina"].items())),
         "\n## Contradicciones registradas",
         table(["Id", "Compañía", "Campo", "Valor existente", "Valor nuevo"],
               [(c["id"], c["nombre"], x["campo"], x["valor_existente"], x["valor_nuevo"])
                for c in data["companias"] for x in (c.get("contradicciones") or [])])]
    write("informe-companias.md", "\n".join(L))


def venues(data, st, sidx):
    rows = []
    fpv = {v["id"]: v["funciones"] for v in st["espacios_mayor_programacion"]}
    for v in sorted(active(data["espacios"]), key=lambda x: (x.get("comuna") or "zz", x["nombre"])):
        rows.append((v["id"], v["nombre"], lib.commune_name(v.get("comuna")), v.get("tipo_espacio"), v.get("administracion"),
                     v.get("direccion"), v.get("capacidad"), len(v.get("companias") or []), fpv.get(v["id"], 0),
                     v["estado"], src_quality(v, sidx), src_list(v, sidx, 1)))
    L = ["# Informe de espacios", f"\nGenerado: {st['generado']}. {len(rows)} espacios. Cifras = DATO ENCONTRADO.\n",
         table(["Id", "Espacio", "Comuna", "Tipo", "Administración", "Dirección", "Capacidad", "Compañías", "Funciones",
                "Estado", "Fuente", "Fuente principal"], rows),
         "\n## Por tipo", table(["Tipo", "Espacios"], list(st["espacios_por_tipo"].items()))]
    write("informe-espacios.md", "\n".join(L))


def billboard(data, st, sidx):
    rows = []
    for f in sorted(active(data["funciones"]), key=lambda x: (x.get("fecha") or "", x["id"]), reverse=True):
        rows.append((f.get("fecha"), f.get("hora"), name(data, "obras", f.get("obra")), name(data, "companias", f.get("compania")),
                     name(data, "espacios", f.get("espacio")), lib.commune_name(f.get("comuna")),
                     name(data, "festivales", f.get("festival")) if f.get("festival") else "",
                     f.get("tipo_funcion"), f.get("precio"), f["estado"], src_list(f, sidx, 1)))
    L = ["# Informe de cartelera (funciones registradas)", f"\nGenerado: {st['generado']}. {len(rows)} funciones. "
         "Cada fila es una función con fuente; no es una cartelera completa.\n",
         table(["Fecha", "Hora", "Obra", "Compañía", "Espacio", "Comuna", "Festival", "Tipo", "Precio", "Estado", "Fuente"], rows),
         "\n## Funciones por año", table(["Año", "Funciones"], list(st["funciones_por_anio"].items())),
         "\n## Funciones por tipo", table(["Tipo", "Funciones"], list(st["funciones_por_tipo"].items())),
         "\n## Obras registradas",
         table(["Id", "Obra", "Compañía", "Director/a", "Dramaturgo/a", "Estreno", "Género", "Público", "Estado"],
               [(o["id"], o["nombre"], name(data, "companias", o.get("compania")), o.get("director"), o.get("dramaturgo"),
                 o.get("anio_estreno"), o.get("genero"), o.get("publico"), o["estado"])
                for o in sorted(active(data["obras"]), key=lambda x: x["nombre"])])]
    write("informe-cartelera.md", "\n".join(L))


def festivals(data, st, sidx):
    rows = [(f["id"], f["nombre"], lib.commune_name(f.get("comuna")), f.get("anio_creacion"), f.get("periodicidad"),
             f.get("organizacion"), f.get("numero_versiones"), f.get("fechas"),
             [name(data, "companias", c) for c in (f.get("companias") or [])], f["estado"], src_list(f, sidx, 1))
            for f in sorted(active(data["festivales"]), key=lambda x: (x.get("comuna") or "zz", x["nombre"]))]
    write("informe-festivales.md", "\n".join([
        "# Informe de festivales", f"\nGenerado: {st['generado']}. {len(rows)} festivales. Cifras = DATO ENCONTRADO.\n",
        table(["Id", "Festival", "Comuna", "Creación", "Periodicidad", "Organización", "Versiones", "Fechas",
               "Compañías participantes", "Estado", "Fuente"], rows)]))


def people(data, st, sidx):
    rows = [(p["id"], p["nombre"], p.get("roles"), [name(data, "companias", c) for c in (p.get("companias") or [])],
             lib.commune_name(p.get("comuna")), len(p.get("obras_dirigidas") or []), p["estado"], src_list(p, sidx, 1))
            for p in sorted(active(data["personas"]), key=lambda x: x["nombre"])]
    write("informe-personas.md", "\n".join([
        "# Informe de personas (directores/as y agentes)",
        f"\nGenerado: {st['generado']}. {len(rows)} personas. Solo nombres y roles profesionales publicados.\n",
        table(["Id", "Nombre", "Roles", "Compañías", "Comuna", "Obras dirigidas", "Estado", "Fuente"], rows),
        "\n## Por rol", table(["Rol", "Personas"], list(st["personas_por_rol"].items()))]))


def funding(data, st, sidx):
    rows = [(f["id"], f.get("proyecto"), f.get("organizacion"), f.get("fondo"), f.get("linea"), f.get("anio"),
             f.get("monto"), lib.commune_name(f.get("comuna")), f.get("disciplina"),
             name(data, "companias", f.get("compania")) if f.get("compania") else "", f.get("folio"), f["estado"], src_list(f, sidx, 1))
            for f in sorted(active(data["financiamiento"]), key=lambda x: (str(x.get("anio") or ""), x.get("proyecto") or ""), reverse=True)]
    write("informe-financiamiento.md", "\n".join([
        "# Informe de financiamiento", f"\nGenerado: {st['generado']}. {len(rows)} proyectos. Cifras = DATO ENCONTRADO.\n",
        table(["Id", "Proyecto", "Organización/persona", "Fondo", "Línea", "Año", "Monto", "Comuna", "Disciplina",
               "Compañía", "Folio", "Estado", "Fuente"], rows)]))


def main():
    data = lib.load_all()
    st = estadisticas.compute(data)
    lib.INFORMES.mkdir(parents=True, exist_ok=True)
    (lib.INFORMES / "estadisticas.json").write_text(json.dumps(st, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    sidx = lib.sources_index(data)
    general(data, st)
    by_province(data, st, sidx)
    by_commune(data, st, sidx)
    companies(data, st, sidx)
    venues(data, st, sidx)
    billboard(data, st, sidx)
    festivals(data, st, sidx)
    people(data, st, sidx)
    funding(data, st, sidx)
    print("Informes generados en", lib.INFORMES.relative_to(lib.ROOT))
    return 0


if __name__ == "__main__":
    sys.exit(main())
