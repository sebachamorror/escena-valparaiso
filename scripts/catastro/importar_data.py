#!/usr/bin/env python3
"""
Siembra el catastro con las fichas ya investigadas en data/ (companies, venues, works, events,
artists), conservando sus fuentes y su estado de verificación. Genera un lote trazable en
catastro/lotes/0000-importacion-data.json y lo ingiere con agregar.py.

Uso: python3 scripts/catastro/importar_data.py
Es idempotente: volver a correrlo fusiona, no duplica.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lib  # noqa: E402
import agregar  # noqa: E402

DATA = lib.ROOT / "data"

QUALITY_BY_TYPE = {"institucional": "A", "oficial": "B", "prensa": "C", "academico": "C",
                   "red-social": "D", "directorio": "E", "otro": "E", "testimonio": "F",
                   "documento-proyecto": "F"}
VENUE_TYPE = {"teatro": "Teatro", "sala": "Sala teatral", "centro-cultural": "Centro cultural",
              "espacio-independiente": "Espacio independiente", "escuela": "Espacio universitario",
              "museo": "Espacio patrimonial", "espacio-publico": "Espacio no convencional",
              "no-convencional": "Espacio no convencional"}
COMPANY_TYPE = [("titeres", "compañía de títeres"), ("lambe-lambe", "compañía de títeres"),
                ("circo", "compañía de circo"), ("clown", "compañía de clown"),
                ("teatro-comunitario", "teatro comunitario"), ("teatro-universitario", "teatro universitario"),
                ("teatro-callejero", "teatro callejero"), ("teatro-familiar", "teatro infantil/familiar"),
                ("performance", "colectivo de performance"), ("danza", "compañía de danza"),
                ("narracion-oral", "narración oral")]
ROLE_BY_CRAFT = {"titeres": "Titiritero/a", "actuacion": "Actor/actriz", "direccion": "Director/a",
                 "dramaturgia": "Dramaturgo/a", "produccion": "Productor/a", "gestion": "Gestor/a cultural",
                 "escenografia": "Diseñador/a escénico", "vestuario": "Diseñador/a escénico",
                 "iluminacion": "Diseñador/a escénico", "tecnica": "Técnico/a", "sonido": "Técnico/a",
                 "circo": "Artista circense", "musica-escenica": "Músico/a escénico",
                 "narracion-oral": "Narrador/a oral", "utileria": "Diseñador/a escénico",
                 "maquillaje": "Diseñador/a escénico", "mediacion": "Mediador/a"}


def load_dir(name):
    out = {}
    for p in sorted((DATA / name).glob("*.json")):
        d = json.loads(p.read_text(encoding="utf-8"))
        out[d["slug"]] = d
    return out


def state_of(rec):
    v = rec.get("verification") or {}
    if v.get("status") == "verificado":
        return "VERIFICADO"
    return None


def sources_of(rec, prefix, batch_sources):
    keys = []
    for i, s in enumerate(rec.get("sources") or []):
        key = f"{prefix}-{i}"
        q = QUALITY_BY_TYPE.get(s.get("type"), "F")
        notes = s.get("notes")
        if s.get("type") == "documento-proyecto":
            notes = ("Documento interno del proyecto Quinta Escena Podcast; no verificable públicamente. "
                     + (notes or "")).strip()
        batch_sources.append({"clave": key, "url": s.get("url"), "titulo": s.get("title"),
                              "publicador": s.get("publisher"), "tipo": s.get("type"), "calidad": q,
                              "fecha_consulta": s.get("accessed_at"), "notas": notes})
        keys.append(key)
    return keys


def director_from_members(members_text):
    for m in members_text or []:
        mm = re.match(r"([^(]+)\((.*)\)", m)
        if mm and re.search(r"direct", mm.group(2), re.I):
            return mm.group(1).strip()
    return None


def company_type(disciplines):
    for d, t in COMPANY_TYPE:
        if d in (disciplines or []):
            return t
    return "compañía de teatro"


def main():
    companies = load_dir("companies")
    venues = load_dir("venues")
    works = load_dir("works")
    events = load_dir("events")
    artists = load_dir("artists")
    note = "Importado de data/{col}/{slug}.json (score {score})."
    batch = {"capa": 0, "consulta": "importacion data/", "fuentes": [], "companias": [], "espacios": [],
             "obras": [], "funciones": [], "festivales": [], "personas": [], "financiamiento": []}

    for slug, v in venues.items():
        place = v.get("place") or {}
        soc = v.get("social") or {}
        rec = {"nombre": v["name"], "alias": [v["short_name"]] if v.get("short_name") else [],
               "comuna": place.get("commune"), "direccion": place.get("address"),
               "tipo_espacio": VENUE_TYPE.get(v.get("venue_type")), "capacidad": v.get("capacity"),
               "administracion": v.get("owner"),
               "programacion_teatral": "sí" if "teatro" in (v.get("disciplines") or []) else None,
               "web": v.get("website"), "instagram": soc.get("instagram"), "facebook": soc.get("facebook"),
               "correo": v.get("contact_public"), "lat": place.get("lat"), "lng": place.get("lng"),
               "descripcion": v.get("description_md"),
               "fuentes": sources_of(v, f"venue-{slug}", batch["fuentes"]),
               "notas": note.format(col="venues", slug=slug, score=(v.get("verification") or {}).get("confidence_score"))}
        if state_of(v):
            rec["estado"] = state_of(v)
        batch["espacios"].append(rec)

    for slug, c in companies.items():
        soc = c.get("social") or {}
        members = list(c.get("members_text") or [])
        for m in c.get("members") or []:
            a = artists.get(m.get("artist"))
            if a:
                members.append(f"{a['name']} ({m.get('role')})")
        fests = []
        for f in c.get("festivals") or []:
            name = re.sub(r"\s*\(.*?\)\s*", "", f.get("festival_name") or "").strip()
            if name:
                fests.append({"nombre": name, "fechas": [str(f["year"])] if f.get("year") else [],
                              "comuna": f.get("place")})
        rec = {"nombre": c["name"], "nombre_oficial": c.get("legal_name"), "comuna": c.get("commune"),
               "comunas_trabajo": c.get("other_communes") or [], "anio_creacion": c.get("founded_year"),
               "director": director_from_members(c.get("members_text")), "integrantes": members,
               "tipo": company_type(c.get("disciplines")), "disciplinas": c.get("disciplines") or [],
               "descripcion": c.get("description_md"),
               "obras": [works[w]["title"] for w in (c.get("works") or []) if w in works],
               "espacios": [venues[v]["name"] for v in (c.get("venues") or []) if v in venues],
               "festivales": fests,
               "instagram": soc.get("instagram"), "facebook": soc.get("facebook"), "youtube": soc.get("youtube"),
               "tiktok": soc.get("tiktok"), "web": c.get("website"), "correo": c.get("email"),
               "fuentes": sources_of(c, f"company-{slug}", batch["fuentes"]),
               "notas": note.format(col="companies", slug=slug, score=(c.get("verification") or {}).get("confidence_score"))}
        if state_of(c):
            rec["estado"] = state_of(c)
        batch["companias"].append(rec)
        for fa in c.get("funding_awards") or []:
            batch["financiamiento"].append({
                "proyecto": fa.get("fund_name"), "organizacion": c["name"], "fondo": fa.get("org"),
                "anio": fa.get("year"), "folio": fa.get("folio"), "monto": fa.get("amount_clp"),
                "comuna": c.get("commune"), "disciplina": (c.get("disciplines") or [None])[0],
                "descripcion": fa.get("note"), "compania": c["name"], "fuentes": rec["fuentes"]})

    for slug, w in works.items():
        comp = companies.get((w.get("companies") or [None])[0])
        rec = {"nombre": w["title"], "compania": comp["name"] if comp else None, "director": w.get("direction"),
               "dramaturgo": w.get("authorship"), "anio_estreno": w.get("premiere_year"),
               "genero": (w.get("disciplines") or [None])[0], "publico": w.get("audience"),
               "duracion": w.get("duration_min"), "comunas": w.get("communes") or [],
               "espacios": [venues[v]["name"] for v in (w.get("venues") or []) if v in venues],
               "descripcion": w.get("synopsis_md"),
               "fuentes": sources_of(w, f"work-{slug}", batch["fuentes"]),
               "notas": note.format(col="works", slug=slug, score=(w.get("verification") or {}).get("confidence_score"))}
        if state_of(w):
            rec["estado"] = state_of(w)
        batch["obras"].append(rec)

    for slug, e in events.items():
        keys = sources_of(e, f"event-{slug}", batch["fuentes"])
        occ = e.get("occurrences") or []
        first = occ[0] if occ else {}
        venue = venues.get(first.get("venue"))
        commune = (venue.get("place") or {}).get("commune") if venue else None
        if e.get("kind") == "festival":
            name = re.sub(r"\s+\d{4}$", "", e["title"])
            rec = {"nombre": name, "comuna": commune, "organizacion": e.get("organizer_text"),
                   "espacios": [venue["name"]] if venue else [],
                   "fechas": [first["starts_at"][:10]] if first.get("starts_at") else [],
                   "web": e.get("booking_url"), "descripcion": e.get("description_md"), "fuentes": keys,
                   "notas": note.format(col="events", slug=slug, score=(e.get("verification") or {}).get("confidence_score"))}
            if state_of(e):
                rec["estado"] = state_of(e)
            batch["festivales"].append(rec)
        else:
            work = works.get(e.get("work"))
            comp = companies.get(e.get("company"))
            for o in occ:
                v = venues.get(o.get("venue"))
                rec = {"obra": work["title"] if work else e["title"], "compania": comp["name"] if comp else None,
                       "fecha": (o.get("starts_at") or "")[:10] or None,
                       "hora": None if o.get("time_unknown") else (o.get("starts_at") or "")[11:16] or None,
                       "comuna": (v.get("place") or {}).get("commune") if v else None,
                       "espacio": v["name"] if v else None,
                       "tipo_funcion": "gratuita" if e.get("is_free") else ("pagada" if e.get("price") else None),
                       "precio": e.get("price") or o.get("price"), "descripcion": e.get("description_md"),
                       "fuentes": keys,
                       "notas": note.format(col="events", slug=slug, score=(e.get("verification") or {}).get("confidence_score"))}
                if state_of(e):
                    rec["estado"] = state_of(e)
                batch["funciones"].append(rec)

    for slug, a in artists.items():
        roles = []
        for cr in a.get("crafts") or []:
            r = ROLE_BY_CRAFT.get(cr)
            if r and r not in roles:
                roles.append(r)
        comps = [companies[c["company"]]["name"] for c in (a.get("companies") or []) if c.get("company") in companies]
        # companies_text trae "Nombre (rol, años)": el nombre va como referencia; el paréntesis, a notas.
        extra_notes = []
        for t in a.get("companies_text") or []:
            name = re.sub(r"\s*\(.*?\)\s*$", "", t).strip()
            if name:
                comps.append(name)
                if name != t.strip():
                    extra_notes.append(t.strip())
        directed = [works[w["work"]]["title"] for w in (a.get("works") or [])
                    if w.get("work") in works and re.search(r"direc", w.get("role") or "", re.I)]
        soc = a.get("social") or {}
        rec = {"nombre": a["name"], "roles": roles, "companias": comps, "comuna": a.get("commune"),
               "obras_dirigidas": directed,
               "formacion": "; ".join(t if isinstance(t, str) else json.dumps(t, ensure_ascii=False) for t in (a.get("training") or [])) or None,
               "trayectoria": a.get("trajectory_md") or a.get("bio_md"),
               "instagram": soc.get("instagram"), "web": a.get("website"),
               "fuentes": sources_of(a, f"artist-{slug}", batch["fuentes"]),
               "notas": (note.format(col="artists", slug=slug, score=(a.get("verification") or {}).get("confidence_score"))
                         + (" Vínculos declarados: " + "; ".join(extra_notes) + "." if extra_notes else ""))}
        if state_of(a):
            rec["estado"] = state_of(a)
        batch["personas"].append(rec)

    lib.LOTES.mkdir(parents=True, exist_ok=True)
    out = lib.LOTES / "0000-importacion-data.json"
    out.write_text(json.dumps(batch, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    data = lib.load_all()
    agregar.ingest_batch(data, batch)
    lib.save_all(data)
    print(json.dumps(agregar.REPORT, ensure_ascii=False, indent=1))
    print("Lote:", out.relative_to(lib.ROOT))
    return 0


if __name__ == "__main__":
    sys.exit(main())
