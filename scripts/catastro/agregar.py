#!/usr/bin/env python3
"""
Ingesta un lote de descubrimientos al catastro, deduplicando y registrando fuentes.

Uso:
  python3 scripts/catastro/agregar.py catastro/lotes/2026-09-08-capa1-fondart.json [más lotes...]
  python3 scripts/catastro/agregar.py --dry-run lote.json     (no guarda)

Formato del lote (JSON):
{
  "capa": 1,
  "consulta": "Q-0003",                      # id de consulta o texto libre (opcional)
  "fuentes": [
    {"clave": "f1", "url": "...", "titulo": "...", "publicador": "...", "tipo": "institucional",
     "calidad": "A", "notas": null}
  ],
  "companias": [
    {"nombre": "...", "comuna": "Villa Alemana", "tipo": "compañía de teatro", "fuentes": ["f1"],
     "obras": ["Título de la obra"], "espacios": ["Teatro Municipal X"], "director": "Nombre", ...}
  ],
  "espacios": [...], "obras": [...], "funciones": [...], "personas": [...],
  "festivales": [...], "financiamiento": [...]
}

Reglas:
- Las fuentes se deduplican por URL normalizada (o por título+publicador si no hay URL).
- Los registros se fusionan por nombre normalizado (o alias). Campos escalares vacíos se
  completan; si difieren, se anota en `contradicciones` sin sobreescribir. Las listas se unen.
- Las referencias por nombre (obra -> compañía, función -> espacio, etc.) se resuelven a ids;
  si el destino no existe se crea un registro mínimo DESCUBIERTO con las mismas fuentes
  (búsqueda inversa: ESPACIO -> PROGRAMACIÓN -> OBRA -> COMPAÑÍA).
- `director` de compañías y `director`/`dramaturgo` de obras generan/actualizan personas.
- Nunca se inventan campos: lo que no viene en el lote queda en null.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lib  # noqa: E402

REPORT = {"nuevos": {}, "actualizados": {}, "fuentes_nuevas": 0, "avisos": []}


def warn(msg):
    REPORT["avisos"].append(msg)


def ingest_source(data, src, capa, consulta):
    """Devuelve id de fuente (existente o nueva)."""
    items = data["fuentes"]
    url = lib.normalize_url(src.get("url"))
    title = (src.get("titulo") or "").strip()
    if not url and not title:
        raise ValueError(f"Fuente sin url ni titulo: {src}")
    for it in items:
        if url and lib.normalize_url(it.get("url")) == url:
            if not it.get("titulo") and title:
                it["titulo"] = title
            return it["id"]
        if not url and not it.get("url") and lib.normalize(it.get("titulo")) == lib.normalize(title) \
                and lib.normalize(it.get("publicador")) == lib.normalize(src.get("publicador")):
            return it["id"]
    q = (src.get("calidad") or "F").upper()
    if q not in lib.QUALITIES:
        warn(f"Calidad desconocida '{q}' en fuente {title or url}; se registra F")
        q = "F"
    rec = {
        "id": lib.next_id("fuentes", items),
        "url": src.get("url"),
        "titulo": title or None,
        "publicador": src.get("publicador"),
        "tipo": src.get("tipo"),
        "calidad": q,
        "fecha_consulta": src.get("fecha_consulta") or lib.today(),
        "capa": capa,
        "consulta": consulta,
        "notas": src.get("notas"),
    }
    items.append(rec)
    REPORT["fuentes_nuevas"] += 1
    return rec["id"]


def merge_scalar(rec, field, value, source_ids):
    if value is None or value == "" or value == lib.NOT_FOUND:
        return
    cur = rec.get(field)
    if cur is None or cur == "" or cur == lib.NOT_FOUND:
        rec[field] = value
        return
    if lib.normalize(cur) == lib.normalize(value):
        return
    if isinstance(cur, (int, float)) and isinstance(value, (int, float)) and cur == value:
        return
    for c in rec.get("contradicciones", []):
        if c.get("campo") == field and lib.normalize(c.get("valor_nuevo")) == lib.normalize(value):
            return
    rec.setdefault("contradicciones", []).append({
        "campo": field, "valor_existente": cur, "valor_nuevo": value,
        "fuentes": source_ids, "fecha": lib.today(),
    })


def merge_list(rec, field, values):
    cur = rec.get(field) or []
    seen = {lib.normalize(str(v)) for v in cur}
    for v in values or []:
        if v is None:
            continue
        k = lib.normalize(str(v))
        if k and k not in seen:
            cur.append(v)
            seen.add(k)
    rec[field] = cur


def upsert(data, col, payload, source_ids, created_from=None):
    """Crea o fusiona un registro. `payload` ya tiene comunas y refs resueltas. Devuelve el registro."""
    items = data[col]
    nf = lib.NAME_FIELD.get(col)
    rec = None
    if payload.get("id") and lib.is_id(payload["id"], col):
        rec = lib.find_by_id(items, payload["id"])
    if rec is None and nf:
        rec = lib.find_by_name(items, col, payload.get(nf))
        if rec is None and payload.get("alias"):
            for a in payload["alias"]:
                rec = lib.find_by_name(items, col, a)
                if rec:
                    break
    if rec is None and col == "funciones":
        rec = find_function(items, payload)
    is_new = rec is None
    if is_new:
        rec = lib.empty_record(col)
        rec["id"] = lib.next_id(col, items)
        if created_from:
            rec["notas"] = f"Creado por referencia desde {created_from}."
        items.append(rec)
    list_fields = lib.LIST_FIELDS.get(col, set())
    for field in lib.FIELDS[col]:
        if field in ("id", "fuentes", "estado", "fecha_descubrimiento", "fecha_ultima_verificacion",
                     "contradicciones", "duplicado_de"):
            continue
        if field not in payload:
            continue
        value = payload[field]
        if field in list_fields:
            merge_list(rec, field, value if isinstance(value, list) else [value])
        elif field == "notas":
            if value and (rec.get("notas") or "") != value:
                rec["notas"] = ((rec.get("notas") or "") + " " + value).strip()
        else:
            merge_scalar(rec, field, value, source_ids)
    merge_list(rec, "fuentes", source_ids)
    if payload.get("estado") in ("VERIFICADO", "DESCARTADO"):
        rec["estado"] = payload["estado"]
    rec["fecha_ultima_verificacion"] = lib.today()
    bucket = REPORT["nuevos"] if is_new else REPORT["actualizados"]
    bucket[col] = bucket.get(col, 0) + 1
    return rec


def find_function(items, payload):
    for it in items:
        if it.get("obra") == payload.get("obra") and it.get("fecha") == payload.get("fecha") \
                and (it.get("espacio") == payload.get("espacio") or it.get("comuna") == payload.get("comuna")):
            return it
    return None


def resolve_ref(data, target_col, value, source_ids, origin_id, commune_hint=None):
    """Nombre/dict/id -> id en la colección destino, creando un registro mínimo si no existe."""
    if value is None or value == "" or value == lib.NOT_FOUND:
        return None
    if isinstance(value, str) and lib.is_id(value, target_col):
        return value if lib.find_by_id(data[target_col], value) else None
    payload = dict(value) if isinstance(value, dict) else {lib.NAME_FIELD[target_col]: value}
    payload = prepare(data, target_col, payload, source_ids, origin_id)
    if commune_hint and "comuna" in lib.FIELDS[target_col] and not payload.get("comuna"):
        payload["comuna"] = commune_hint
    rec = upsert(data, target_col, payload, source_ids, created_from=origin_id)
    return rec["id"]


def prepare(data, col, payload, source_ids, origin_id=None):
    """Resuelve comunas, provincia y referencias del payload (sin crear el registro propio)."""
    p = dict(payload)
    p.pop("fuentes", None)
    for field, is_list in lib.COMMUNE_FIELDS.get(col, {}).items():
        if field not in p or p[field] is None:
            continue
        if is_list:
            out = []
            for v in p[field] or []:
                s = lib.resolve_commune(v)
                if s:
                    out.append(s)
                else:
                    warn(f"{col}: comuna no reconocida '{v}' (se conserva en notas)")
                    p["notas"] = ((p.get("notas") or "") + f" Comuna no resuelta: {v}.").strip()
            p[field] = out
        else:
            s = lib.resolve_commune(p[field])
            if s is None:
                warn(f"{col}: comuna no reconocida '{p[field]}' (queda null; se anota)")
                p["notas"] = ((p.get("notas") or "") + f" Comuna no resuelta: {p[field]}.").strip()
                p[field] = None
            else:
                p[field] = s
    if "provincia" in lib.FIELDS[col] and p.get("comuna"):
        p["provincia"] = lib.province_of(p["comuna"])
    return p


def resolve_refs(data, col, rec, payload, source_ids):
    """Resuelve referencias a otras colecciones y enlaza en ambos sentidos cuando corresponde."""
    hint = rec.get("comuna") if col in ("companias", "espacios", "festivales") else None
    for field, target in lib.REFS[col].items():
        if field not in payload or payload[field] is None:
            continue
        raw = payload[field]
        if field in lib.LIST_FIELDS.get(col, set()):
            ids = []
            for v in (raw if isinstance(raw, list) else [raw]):
                rid = resolve_ref(data, target, v, source_ids, rec["id"],
                                  commune_hint=hint if target in ("obras",) else None)
                if rid:
                    ids.append(rid)
            merge_list(rec, field, ids)
            for rid in ids:
                backlink(data, col, rec["id"], target, rid)
        else:
            rid = resolve_ref(data, target, raw, source_ids, rec["id"])
            rec[field] = rid
            if rid:
                backlink(data, col, rec["id"], target, rid)


BACKLINKS = {
    ("obras", "companias"): "obras",
    ("companias", "obras"): "compania",
    ("funciones", "obras"): None,
    ("espacios", "companias"): "espacios",
    ("companias", "espacios"): "companias",
    ("festivales", "companias"): "festivales",
    ("companias", "festivales"): "companias",
    ("financiamiento", "companias"): "fondos",
    ("personas", "companias"): None,
}


def backlink(data, from_col, from_id, to_col, to_id):
    """Enlace inverso: p. ej. una obra que apunta a una compañía se agrega a compania.obras."""
    field = BACKLINKS.get((from_col, to_col))
    if not field:
        return
    target = lib.find_by_id(data[to_col], to_id)
    if not target:
        return
    if field in lib.LIST_FIELDS.get(to_col, set()):
        merge_list(target, field, [from_id])
    elif target.get(field) is None:
        target[field] = from_id


def link_person(data, name, role, company_id, source_ids, commune=None, work_id=None):
    if not name or name == lib.NOT_FOUND:
        return
    payload = {"nombre": name, "roles": [role], "companias": [company_id] if company_id else [],
               "comuna": commune, "obras_dirigidas": [work_id] if (work_id and role == "Director/a") else []}
    payload = prepare(data, "personas", payload, source_ids)
    upsert(data, "personas", payload, source_ids)


def propagate_functions(data, rec):
    """Una función suma comuna de trabajo y espacio a la compañía, y comuna a la obra."""
    comp = lib.find_by_id(data["companias"], rec.get("compania")) if rec.get("compania") else None
    obra = lib.find_by_id(data["obras"], rec.get("obra")) if rec.get("obra") else None
    if comp:
        if rec.get("comuna"):
            merge_list(comp, "comunas_trabajo", [rec["comuna"]])
        if rec.get("espacio"):
            merge_list(comp, "espacios", [rec["espacio"]])
            esp = lib.find_by_id(data["espacios"], rec["espacio"])
            if esp:
                merge_list(esp, "companias", [comp["id"]])
        if rec.get("festival"):
            merge_list(comp, "festivales", [rec["festival"]])
            fes = lib.find_by_id(data["festivales"], rec["festival"])
            if fes:
                merge_list(fes, "companias", [comp["id"]])
    if obra:
        if rec.get("comuna"):
            merge_list(obra, "comunas", [rec["comuna"]])
        if rec.get("espacio"):
            merge_list(obra, "espacios", [rec["espacio"]])
        if rec.get("festival"):
            merge_list(obra, "festivales", [rec["festival"]])
        if comp and not obra.get("compania"):
            obra["compania"] = comp["id"]
            merge_list(comp, "obras", [obra["id"]])


def ingest_batch(data, batch):
    capa = batch.get("capa")
    consulta = batch.get("consulta")
    keys = {}
    for src in batch.get("fuentes", []):
        sid = ingest_source(data, src, capa, consulta)
        keys[src.get("clave") or sid] = sid
    order = ["espacios", "festivales", "companias", "obras", "funciones", "personas", "financiamiento"]
    for col in order:
        for payload in batch.get(col, []):
            src_ids = []
            for k in payload.get("fuentes", []):
                if k in keys:
                    src_ids.append(keys[k])
                elif lib.is_id(k, "fuentes"):
                    src_ids.append(k)
                else:
                    warn(f"{col} '{payload.get(lib.NAME_FIELD.get(col) or 'obra')}': clave de fuente desconocida '{k}'")
            if not src_ids:
                warn(f"{col} '{payload.get(lib.NAME_FIELD.get(col) or 'obra')}': sin fuentes; se registra con calidad F")
            prepared = prepare(data, col, payload, src_ids)
            for field in lib.REFS[col]:
                prepared.pop(field, None)
            rec = upsert(data, col, prepared, src_ids)
            resolve_refs(data, col, rec, payload, src_ids)
            if col == "companias":
                link_person(data, payload.get("director"), "Director/a", rec["id"], src_ids, rec.get("comuna"))
            if col == "obras":
                comp_id = rec.get("compania")
                comp = lib.find_by_id(data["companias"], comp_id) if comp_id else None
                link_person(data, payload.get("director"), "Director/a", comp_id, src_ids,
                            comp.get("comuna") if comp else None, work_id=rec["id"])
                link_person(data, payload.get("dramaturgo"), "Dramaturgo/a", comp_id, src_ids,
                            comp.get("comuna") if comp else None)
            if col == "funciones":
                propagate_functions(data, rec)
    # Estados automáticos
    sidx = lib.sources_index(data)
    for col in lib.COLLECTIONS:
        for rec in data[col]:
            rec["estado"] = lib.evaluate_state(col, rec, sidx)


def main(argv):
    dry = "--dry-run" in argv
    paths = [a for a in argv if not a.startswith("--")]
    if not paths:
        print(__doc__)
        return 1
    data = lib.load_all()
    for p in paths:
        batch = json.loads(Path(p).read_text(encoding="utf-8"))
        ingest_batch(data, batch)
        # marcar consulta hecha si el lote la referencia
        if batch.get("consulta") and str(batch["consulta"]).startswith("Q-"):
            mark_query(batch["consulta"], batch.get("resumen"))
    if not dry:
        lib.save_all(data)
    print(json.dumps(REPORT, ensure_ascii=False, indent=1))
    totals = {c: len([r for r in data[c] if r.get('estado') != 'DUPLICADO']) for c in lib.PREFIXES}
    print("Totales:", json.dumps(totals, ensure_ascii=False))
    return 0


def mark_query(qid, summary):
    path = lib.DATOS / "consultas.json"
    if not path.exists():
        return
    qs = json.loads(path.read_text(encoding="utf-8"))
    for q in qs:
        if q["id"] == qid:
            q["estado"] = "hecha"
            q["fecha"] = lib.today()
            if summary:
                q["resumen"] = summary
    path.write_text(json.dumps(qs, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
