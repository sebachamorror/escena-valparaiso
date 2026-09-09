#!/usr/bin/env python3
"""
Convierte el catastro (catastro/datos/) al modelo de datos real del sitio
(data/companies, data/venues, data/works, data/events, data/artists),
validado contra data/schemas/.

Regla dura: solo se crea o enriquece una ficha cuando los campos obligatorios
del esquema están cubiertos por un dato real. Nunca se inventa una comuna,
un año o una disciplina para completar un campo requerido; si falta, el
registro se omite y queda documentado igual en catastro/datos/ para seguir
investigándolo.

Dos modos por registro:
- MERGE: si el registro ya existe en data/<col>/ (se detecta por la nota
  "Importado de data/<col>/<slug>.json" que dejó importar_data.py), se
  enriquece de forma aditiva (listas, campos vacíos) sin tocar published,
  verification ni status — esos ya fueron revisados por una persona.
- CREAR: si es un descubrimiento nuevo del catastro, se crea el archivo con
  published=false y verification.status derivado del estado del catastro
  (VERIFICADO -> "verificado"/85; PARCIAL -> "pendiente"/60; DESCUBIERTO ->
  "pendiente"/35), nunca published=true salvo VERIFICADO con score >= 70,
  igual que exige CLAUDE.md.

Uso: python3 scripts/catastro/exportar_a_data.py [--dry-run]
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lib  # noqa: E402

DATA = lib.ROOT / "data"
TODAY = lib.today()

REPORT = {"creados": {}, "actualizados": {}, "omitidos": {}}


def note(col, key, msg):
    REPORT["omitidos"].setdefault(col, []).append(f"{key}: {msg}")


# --------------------------------------------------------------- utilidades

def slugify(name):
    s = unicodedata.normalize("NFKD", name or "")
    s = "".join(c for c in s if not unicodedata.combining(c)).lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return re.sub(r"-+", "-", s) or "sin-nombre"


def unique_slug(base, taken):
    s = base
    i = 2
    while s in taken:
        s = f"{base}-{i}"
        i += 1
    taken.add(s)
    return s


IMPORT_RE_TMPL = r"Importado de data/{col}/([a-z0-9-]+)\.json"


def original_slug(notas, col):
    if not notas:
        return None
    m = re.search(IMPORT_RE_TMPL.format(col=re.escape(col)), notas)
    return m.group(1) if m else None


def load_existing(col):
    out = {}
    d = DATA / col
    d.mkdir(parents=True, exist_ok=True)
    for p in d.glob("*.json"):
        out[p.stem] = json.loads(p.read_text(encoding="utf-8"))
    return out


DRY_RUN = False


def write_json(col, slug, obj):
    if DRY_RUN:
        return
    (DATA / col / f"{slug}.json").write_text(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


QUALITY_LEVEL = {"A": 1, "B": 1, "C": 2, "D": 3, "E": 3, "F": 3}
SOURCE_TYPES = {"oficial", "institucional", "prensa", "academico", "red-social",
                "directorio", "testimonio", "documento-proyecto", "otro"}


def build_sources(fuente_ids, fuentes_by_id):
    out = []
    for i, fid in enumerate(fuente_ids or []):
        f = fuentes_by_id.get(fid)
        if not f:
            continue
        title = f.get("titulo") or f.get("publicador")
        publisher = f.get("publicador")
        if not title or not publisher:
            continue  # el esquema exige title y publisher no vacíos; nunca se inventan
        stype = f.get("tipo") if f.get("tipo") in SOURCE_TYPES else "otro"
        out.append({
            "url": f.get("url"),
            "title": title,
            "publisher": publisher,
            "type": stype,
            "level": QUALITY_LEVEL.get(f.get("calidad"), 3),
            "role": "primaria" if i == 0 else "secundaria",
            "accessed_at": f.get("fecha_consulta") or TODAY,
            "archived_url": None,
            "supports": [],
            "notes": f.get("notas"),
        })
    return out


def verification_from_estado(estado, fecha_verificacion=None):
    if estado == "VERIFICADO":
        status, score = "verificado", 85
    elif estado == "PARCIAL":
        status, score = "pendiente", 60
    else:
        status, score = "pendiente", 35
    published = status == "verificado" and score >= 70
    return {
        "status": status, "confidence_score": score,
        "verified_at": (fecha_verificacion or TODAY) if status == "verificado" else None,
        "verified_by": None, "next_review_at": None,
        "note": "Importado del catastro regional del ecosistema teatral (Fase 1: descubrimiento); "
                "pendiente de verificación editorial.",
    }, published


def merge_list(existing, new_items, key=None):
    existing = list(existing or [])
    seen = {(json.dumps(x, sort_keys=True, ensure_ascii=False) if not key else x.get(key))
            for x in existing}
    for it in new_items or []:
        k = json.dumps(it, sort_keys=True, ensure_ascii=False) if not key else it.get(key)
        if k and k not in seen:
            existing.append(it)
            seen.add(k)
    return existing


def merge_sources(existing, new_sources):
    existing = list(existing or [])
    urls = {s.get("url") for s in existing if s.get("url")}
    titles = {(s.get("title"), s.get("publisher")) for s in existing}
    for s in new_sources:
        key = (s.get("url") or None)
        if key and key in urls:
            continue
        if not key and (s.get("title"), s.get("publisher")) in titles:
            continue
        existing.append(s)
        if key:
            urls.add(key)
    return existing


def fill_null(obj, field, value):
    if value not in (None, "", [], {}) and not obj.get(field):
        obj[field] = value


DATE_FULL_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def to_datetime(fecha, hora):
    if not fecha or not DATE_FULL_RE.match(fecha):
        return None, True
    h = hora if hora and re.match(r"^\d{2}:\d{2}$", hora) else "00:00"
    return f"{fecha}T{h}:00-03:00", not bool(hora)


# ------------------------------------------------------------------ carga

def load_catastro():
    return {c: lib.load(c) for c in lib.COLLECTIONS + ["fuentes"]}


def active(items):
    return [r for r in items if r.get("estado") not in ("DUPLICADO", "DESCARTADO")]


DISCIPLINES_VOCAB = {"teatro", "teatro-familiar", "teatro-comunitario", "teatro-fisico",
                      "teatro-experimental", "teatro-universitario", "teatro-callejero",
                      "titeres", "lambe-lambe", "circo", "clown", "narracion-oral", "danza",
                      "performance", "opera", "musica-escenica", "juglaria"}
VENUE_TYPE_MAP = {
    "Teatro": "teatro", "Centro cultural": "centro-cultural", "Sala teatral": "sala",
    "Espacio independiente": "espacio-independiente", "Museo": "museo",
    "Espacio patrimonial": "museo", "Espacio autogestionado": "espacio-independiente",
    "Centro comunitario": "centro-cultural", "Espacio universitario": "escuela",
    "Espacio no convencional": "no-convencional",
}
CRAFT_MAP = {
    "Director/a": "direccion", "Dramaturgo/a": "dramaturgia", "Actor/actriz": "actuacion",
    "Titiritero/a": "titeres", "Narrador/a oral": "narracion-oral", "Gestor/a cultural": "gestion",
    "Productor/a": "produccion", "Coreógrafo/a": "direccion", "Diseñador/a escénico": "escenografia",
    "Técnico/a": "tecnica", "Artista circense": "circo", "Músico/a escénico": "musica-escenica",
    "Mediador/a": "mediacion", "Docente de teatro": "direccion", "Docente de voz escénica": "direccion",
    "Bailarín/a": "direccion", "Arteterapeuta comunitaria": "mediacion", "Investigador/a": "gestion",
}
AUDIENCE_MAP = {"primera infancia": "primera-infancia", "infantil": "infantil",
                "familiar": "familiar", "infantil y familiar": "familiar", "juvenil": "juvenil",
                "adulto": "adulto", "adultos": "adulto", "todo público": "todo-publico",
                "todo publico": "todo-publico"}


def map_disciplines(raw_list):
    return [d for d in (raw_list or []) if d in DISCIPLINES_VOCAB]


def guess_discipline_from_text(*texts, default_teatro=False):
    blob = lib.normalize(" ".join(t for t in texts if t))
    for d in ("titeres", "circo", "danza", "opera", "clown", "narracion-oral", "lambe-lambe",
              "teatro-callejero", "teatro-familiar", "musica-escenica"):
        if d.replace("-", " ") in blob:
            return d
    if "teatro" in blob:
        return "teatro"
    if default_teatro and blob:
        return "teatro"
    return None


# --------------------------------------------------------------- compañías

def convert_companies(cat, fuentes_by_id, existing):
    taken = set(existing.keys())
    for c in active(cat["companias"]):
        comuna = c.get("comuna")
        disciplinas = map_disciplines(c.get("disciplinas"))
        if not disciplinas:
            guessed = guess_discipline_from_text(c.get("tipo"), c["nombre"], c.get("descripcion"))
            if guessed:
                disciplinas = [guessed]
        if not comuna:
            note("companies", c["nombre"], "sin comuna confirmada")
            continue
        if not disciplinas:
            note("companies", c["nombre"], "sin disciplina reconocida en el vocabulario")
            continue
        sources = build_sources(c.get("fuentes"), fuentes_by_id)
        if not sources:
            note("companies", c["nombre"], "sin fuentes con título y publicador")
            continue

        slug = original_slug(c.get("notas"), "companies")
        social = {"instagram": c.get("instagram"), "facebook": c.get("facebook"),
                  "tiktok": c.get("tiktok"), "youtube": c.get("youtube")}
        funding = []
        for fin in active(cat["financiamiento"]):
            if fin.get("compania") == c["id"]:
                fund_name = fin.get("proyecto") or fin.get("fondo")
                org = fin.get("fondo") or fin.get("organizacion")
                if not fund_name or not org:
                    continue
                funding.append({"fund_name": fund_name, "org": org, "year": fin.get("anio"),
                                "folio": fin.get("folio"), "amount_clp": fin.get("monto"),
                                "url": None, "note": fin.get("descripcion"), "source_index": None})
        festivals = []
        for fes in active(cat["festivales"]):
            if c["id"] in (fes.get("companias") or []):
                year = next((int(x[:4]) for x in (fes.get("fechas") or []) if re.match(r"^\d{4}", x)), None)
                festivals.append({"festival_name": fes["nombre"], "year": year,
                                  "place": lib.commune_name(fes.get("comuna")) if fes.get("comuna") else None,
                                  "source_index": None})

        if slug and slug in existing:
            rec = existing[slug]
            fill_null(rec, "legal_name", c.get("nombre_oficial"))
            fill_null(rec, "founded_year", c.get("anio_creacion"))
            fill_null(rec, "website", c.get("web"))
            fill_null(rec, "email", c.get("correo"))
            for k, v in social.items():
                if v and not (rec.get("social") or {}).get(k):
                    rec.setdefault("social", {})[k] = v
            rec["disciplines"] = merge_list(rec.get("disciplines"), disciplinas)
            rec["other_communes"] = merge_list(rec.get("other_communes"),
                                                [x for x in (c.get("comunas_trabajo") or []) if x != rec.get("commune")])
            rec["members_text"] = merge_list(rec.get("members_text"), c.get("integrantes"))
            rec["funding_awards"] = merge_list(rec.get("funding_awards"), funding, key=None)
            rec["festivals"] = merge_list(rec.get("festivals"), festivals, key=None)
            rec["tags"] = merge_list(rec.get("tags"), [])
            rec["sources"] = merge_sources(rec.get("sources"), sources)
            write_json("companies", slug, rec)
            REPORT["actualizados"].setdefault("companies", 0)
            REPORT["actualizados"]["companies"] += 1
            continue

        new_slug = slug or unique_slug(slugify(c["nombre"]), taken)
        taken.add(new_slug)
        verification, published = verification_from_estado(c["estado"], c.get("fecha_ultima_verificacion"))
        rec = {
            "slug": new_slug, "type": "company", "name": c["nombre"],
            "legal_name": c.get("nombre_oficial"), "description_md": c.get("descripcion"),
            "commune": comuna, "other_communes": [x for x in (c.get("comunas_trabajo") or []) if x != comuna],
            "disciplines": disciplinas, "audiences": [], "founded_year": c.get("anio_creacion"),
            "status": "desconocido", "last_activity_at": None,
            "members": [], "members_text": c.get("integrantes") or [],
            "works": [], "venues": [], "place": None,
            "email": c.get("correo"), "contact_authorized": False, "website": c.get("web"),
            "social": social, "trajectory_md": None, "recognitions": [],
            "funding_awards": funding, "festivals": festivals, "media": [], "media_candidates": [],
            "series": [], "tags": [], "sources": sources, "verification": verification,
            "published": published,
        }
        write_json("companies", new_slug, rec)
        REPORT["creados"].setdefault("companies", 0)
        REPORT["creados"]["companies"] += 1


# ----------------------------------------------------------------- espacios

def convert_venues(cat, fuentes_by_id, existing):
    taken = set(existing.keys())
    for v in active(cat["espacios"]):
        comuna = v.get("comuna")
        if not comuna:
            note("venues", v["nombre"], "sin comuna confirmada")
            continue
        sources = build_sources(v.get("fuentes"), fuentes_by_id)
        if not sources:
            note("venues", v["nombre"], "sin fuentes con título y publicador")
            continue
        slug = original_slug(v.get("notas"), "venues")
        venue_type = VENUE_TYPE_MAP.get(v.get("tipo_espacio"), "no-convencional")
        place = {"name": None, "address": v.get("direccion"), "commune": comuna,
                 "lat": v.get("lat"), "lng": v.get("lng"),
                 "precision": "exact" if v.get("lat") and v.get("lng") else "commune_centroid",
                 "geocode_source": None, "geocoded_at": None}
        social = {"instagram": v.get("instagram"), "facebook": v.get("facebook"),
                  "tiktok": None, "youtube": None}

        if slug and slug in existing:
            rec = existing[slug]
            fill_null(rec, "short_name", (v.get("alias") or [None])[0])
            fill_null(rec, "owner", v.get("administracion"))
            fill_null(rec, "capacity", v.get("capacidad"))
            fill_null(rec, "website", v.get("web"))
            fill_null(rec, "contact_public", v.get("correo"))
            for k, val in social.items():
                if val and not (rec.get("social") or {}).get(k):
                    rec.setdefault("social", {})[k] = val
            if not rec.get("place", {}).get("address"):
                rec.setdefault("place", {})["address"] = v.get("direccion")
            rec["sources"] = merge_sources(rec.get("sources"), sources)
            write_json("venues", slug, rec)
            REPORT["actualizados"].setdefault("venues", 0)
            REPORT["actualizados"]["venues"] += 1
            continue

        new_slug = slug or unique_slug(slugify(v["nombre"]), taken)
        taken.add(new_slug)
        verification, published = verification_from_estado(v["estado"], v.get("fecha_ultima_verificacion"))
        rec = {
            "slug": new_slug, "type": "venue", "name": v["nombre"],
            "short_name": (v.get("alias") or [None])[0], "venue_type": venue_type,
            "owner": v.get("administracion"), "place": place, "capacity": v.get("capacidad"),
            "rooms": [], "website": v.get("web"), "contact_public": v.get("correo"), "social": social,
            "disciplines": [], "accessibility": [], "program_url": None, "status": "desconocido",
            "description_md": v.get("descripcion"), "media": [], "sources": sources,
            "verification": verification, "published": published,
        }
        write_json("venues", new_slug, rec)
        REPORT["creados"].setdefault("venues", 0)
        REPORT["creados"]["venues"] += 1


# -------------------------------------------------------------------- obras

def convert_works(cat, fuentes_by_id, existing, company_slug_by_id, company_disciplines_by_id):
    taken = set(existing.keys())
    for o in active(cat["obras"]):
        sources = build_sources(o.get("fuentes"), fuentes_by_id)
        if not sources:
            note("works", o["nombre"], "sin fuentes con título y publicador")
            continue
        company_hint = " ".join(company_disciplines_by_id.get(o.get("compania"), []))
        disc = guess_discipline_from_text(o.get("genero"), o.get("descripcion"), company_hint,
                                          default_teatro=True)
        if not disc:
            note("works", o["nombre"], "sin disciplina reconocible")
            continue
        slug = original_slug(o.get("notas"), "works")
        companies = []
        cid = o.get("compania")
        if cid and cid in company_slug_by_id:
            companies.append(company_slug_by_id[cid])
        audience = AUDIENCE_MAP.get(lib.normalize(o.get("publico") or ""))
        communes = [x for x in (o.get("comunas") or []) if x]

        if slug and slug in existing:
            rec = existing[slug]
            fill_null(rec, "authorship", o.get("dramaturgo"))
            fill_null(rec, "direction", o.get("director"))
            fill_null(rec, "premiere_year", o.get("anio_estreno"))
            fill_null(rec, "synopsis_md", o.get("descripcion"))
            fill_null(rec, "duration_min", o.get("duracion"))
            rec["companies"] = merge_list(rec.get("companies"), companies)
            rec["communes"] = merge_list(rec.get("communes"), communes)
            rec["disciplines"] = merge_list(rec.get("disciplines"), [disc])
            rec["sources"] = merge_sources(rec.get("sources"), sources)
            write_json("works", slug, rec)
            REPORT["actualizados"].setdefault("works", 0)
            REPORT["actualizados"]["works"] += 1
            continue

        new_slug = slug or unique_slug(slugify(o["nombre"]), taken)
        taken.add(new_slug)
        verification, published = verification_from_estado(o["estado"], o.get("fecha_ultima_verificacion"))
        rec = {
            "slug": new_slug, "type": "work", "title": o["nombre"],
            "authorship": o.get("dramaturgo"), "direction": o.get("director"), "companies": companies,
            "credits": [], "disciplines": [disc], "audience": audience,
            "duration_min": o.get("duracion"), "premiere_year": o.get("anio_estreno"),
            "synopsis_md": o.get("descripcion"), "communes": communes, "video_url": None,
            "dossier_url": None, "venues": [], "history_text": [], "media": [], "tags": [],
            "sources": sources, "verification": verification, "published": published,
        }
        write_json("works", new_slug, rec)
        REPORT["creados"].setdefault("works", 0)
        REPORT["creados"]["works"] += 1
        if slug is None:
            existing[new_slug] = rec


# ------------------------------------------------------------------- eventos

def merge_occurrences(existing, new_occs):
    existing = list(existing or [])
    seen = {o.get("starts_at") for o in existing if o.get("starts_at")}
    for o in new_occs:
        if o.get("starts_at") in seen:
            continue
        existing.append(o)
        if o.get("starts_at"):
            seen.add(o["starts_at"])
    return existing


def convert_events(cat, fuentes_by_id, existing, company_slug_by_id, venue_slug_by_id, work_by_id):
    taken = set(existing.keys())

    # Funciones -> kind "funcion"
    for f in active(cat["funciones"]):
        already = original_slug(f.get("notas"), "events")
        if already and already in existing:
            # Esta función viene de un evento que ya existe tal cual en el sitio
            # (importado íntegro al inicio de la sesión); no se duplica ni se toca.
            continue
        sources = build_sources(f.get("fuentes"), fuentes_by_id)
        if not sources:
            note("events", f["id"], "función sin fuentes con título y publicador")
            continue
        starts_at, time_unknown = to_datetime(f.get("fecha"), f.get("hora"))
        if not starts_at:
            note("events", f["id"], "función sin fecha exacta")
            continue
        ends_at, _ = to_datetime(f.get("fecha_fin"), None) if f.get("fecha_fin") else (None, True)
        venue_slug = venue_slug_by_id.get(f.get("espacio"))
        place = None
        if not venue_slug and f.get("comuna"):
            place = {"name": None, "address": None, "commune": f["comuna"],
                     "lat": None, "lng": None, "precision": "commune_centroid",
                     "geocode_source": None, "geocoded_at": None}
        work = work_by_id.get(f.get("obra"))
        title = (work["title"] if work else None) or f.get("descripcion") or "Función"
        company = company_slug_by_id.get(f.get("compania"))
        slug_base = slugify(f"{title}-{f.get('comuna') or ''}-{f['fecha']}")
        new_slug = unique_slug(slug_base, taken)
        verification, published = verification_from_estado(f["estado"], f.get("fecha_ultima_verificacion"))
        rec = {
            "slug": new_slug, "type": "event", "title": title[:120], "kind": "funcion",
            "work": work["slug"] if work else None, "company": company,
            "organizer_text": None, "disciplines": work["disciplines"] if work else [],
            "audience": None, "description_md": f.get("descripcion"),
            "price": f.get("precio"), "is_free": (f.get("tipo_funcion") == "gratuita") or None,
            "booking_url": None, "accessibility": [],
            "occurrences": [{"starts_at": starts_at, "ends_at": ends_at, "time_unknown": time_unknown,
                             "venue": venue_slug, "place": place, "price": f.get("precio"), "note": None}],
            "last_checked_at": f.get("fecha_ultima_verificacion") or TODAY,
            "media": [], "sources": sources, "verification": verification, "published": published,
        }
        write_json("events", new_slug, rec)
        REPORT["creados"].setdefault("events", 0)
        REPORT["creados"]["events"] += 1

    # Festivales -> kind "festival"
    for fes in active(cat["festivales"]):
        sources = build_sources(fes.get("fuentes"), fuentes_by_id)
        if not sources:
            note("events", fes["nombre"], "festival sin fuentes con título y publicador")
            continue
        occs = []
        for entry in fes.get("fechas") or []:
            if "/" in entry:
                a, b = entry.split("/", 1)
                sa, tu = to_datetime(a, None)
                sb, _ = to_datetime(b, None)
                if sa:
                    occs.append({"starts_at": sa, "ends_at": sb, "time_unknown": True,
                                "venue": None, "place": None, "price": None, "note": None})
            elif DATE_FULL_RE.match(entry):
                sa, tu = to_datetime(entry, None)
                occs.append({"starts_at": sa, "ends_at": None, "time_unknown": True,
                            "venue": None, "place": None, "price": None, "note": None})
        if not occs:
            note("events", fes["nombre"], "festival sin fechas exactas (solo año o sin fecha)")
            continue
        slug = original_slug(fes.get("notas"), "events")

        if slug and slug in existing:
            rec = existing[slug]
            fill_null(rec, "organizer_text", fes.get("organizacion"))
            fill_null(rec, "booking_url", fes.get("web"))
            fill_null(rec, "description_md", fes.get("descripcion"))
            rec["occurrences"] = merge_occurrences(rec.get("occurrences"), occs)
            rec["sources"] = merge_sources(rec.get("sources"), sources)
            write_json("events", slug, rec)
            REPORT["actualizados"].setdefault("events", 0)
            REPORT["actualizados"]["events"] += 1
            continue

        new_slug = slug or unique_slug(slugify(fes["nombre"]), taken)
        taken.add(new_slug)
        verification, published = verification_from_estado(fes["estado"], fes.get("fecha_ultima_verificacion"))
        rec = {
            "slug": new_slug, "type": "event", "title": fes["nombre"], "kind": "festival",
            "work": None, "company": None, "organizer_text": fes.get("organizacion"),
            "disciplines": [], "audience": None, "description_md": fes.get("descripcion"),
            "price": None, "is_free": None, "booking_url": fes.get("web"), "accessibility": [],
            "occurrences": occs, "last_checked_at": fes.get("fecha_ultima_verificacion") or TODAY,
            "media": [], "sources": sources, "verification": verification, "published": published,
        }
        write_json("events", new_slug, rec)
        REPORT["creados"].setdefault("events", 0)
        REPORT["creados"]["events"] += 1


# ------------------------------------------------------------------ personas

def convert_artists(cat, fuentes_by_id, existing, company_slug_by_id):
    taken = set(existing.keys())
    for p in active(cat["personas"]):
        if not p.get("comuna"):
            note("artists", p["nombre"], "sin comuna confirmada (queda en el catastro)")
            continue
        crafts = sorted({CRAFT_MAP[r] for r in (p.get("roles") or []) if r in CRAFT_MAP})
        if not crafts:
            note("artists", p["nombre"], "sin oficio reconocible en el vocabulario")
            continue
        sources = build_sources(p.get("fuentes"), fuentes_by_id)
        if not sources:
            note("artists", p["nombre"], "sin fuentes con título y publicador")
            continue
        disciplines = sorted({guess_discipline_from_text(c) or "teatro" for c in crafts}) or ["teatro"]
        slug = original_slug(p.get("notas"), "artists")
        companies = []
        for cid in p.get("companias") or []:
            cslug = company_slug_by_id.get(cid)
            if cslug:
                companies.append({"company": cslug, "role": (p.get("roles") or ["Integrante"])[0],
                                  "from_year": None, "to_year": None})
        companies_text = [c for c in (p.get("companias") or []) if c not in company_slug_by_id]

        if slug and slug in existing:
            rec = existing[slug]
            fill_null(rec, "trajectory_md", p.get("trayectoria"))
            fill_null(rec, "website", p.get("web"))
            if p.get("instagram") and not (rec.get("social") or {}).get("instagram"):
                rec.setdefault("social", {})["instagram"] = p["instagram"]
            rec["crafts"] = merge_list(rec.get("crafts"), crafts)
            rec["disciplines"] = merge_list(rec.get("disciplines"), disciplines)
            rec["companies_text"] = merge_list(rec.get("companies_text"), companies_text)
            rec["sources"] = merge_sources(rec.get("sources"), sources)
            write_json("artists", slug, rec)
            REPORT["actualizados"].setdefault("artists", 0)
            REPORT["actualizados"]["artists"] += 1
            continue

        new_slug = slug or unique_slug(slugify(p["nombre"]), taken)
        taken.add(new_slug)
        verification, published = verification_from_estado(p["estado"], p.get("fecha_ultima_verificacion"))
        rec = {
            "slug": new_slug, "type": "artist", "name": p["nombre"], "artistic_name": None,
            "commune": p["comuna"], "commune_basis": "prensa", "crafts": crafts,
            "disciplines": disciplines, "specialties": [], "bio_md": None,
            "trajectory_md": p.get("trayectoria"), "companies": companies,
            "companies_text": companies_text, "works": [], "works_text": [], "training": [],
            "recognitions": [], "funding_awards": [], "festivals": [],
            "website": p.get("web"), "social": {"instagram": p.get("instagram"), "facebook": None,
                                                  "tiktok": None, "youtube": None},
            "email_public": None, "contact_authorized": False, "media": [], "media_candidates": [],
            "series": [], "episodes": [], "tags": [], "sources": sources,
            "verification": verification, "published": published,
        }
        write_json("artists", new_slug, rec)
        REPORT["creados"].setdefault("artists", 0)
        REPORT["creados"]["artists"] += 1


# ---------------------------------------------------------------------- main

def main(argv):
    global DRY_RUN
    DRY_RUN = "--dry-run" in argv
    events_only = "--events-only" in argv
    cat = load_catastro()
    fuentes_by_id = {f["id"]: f for f in cat["fuentes"]}

    existing_companies = load_existing("companies")
    existing_venues = load_existing("venues")
    existing_works = load_existing("works")
    existing_events = load_existing("events")
    existing_artists = load_existing("artists")

    if not events_only:
        convert_companies(cat, fuentes_by_id, existing_companies)
        convert_venues(cat, fuentes_by_id, existing_venues)

    # id -> slug lookups para referencias cruzadas (tras compañías/espacios)
    company_slug_by_id = {}
    for c in active(cat["companias"]):
        s = original_slug(c.get("notas"), "companies")
        if not s:
            n = slugify(c["nombre"])
            if (DATA / "companies" / f"{n}.json").exists():
                s = n
        if s:
            company_slug_by_id[c["id"]] = s
    venue_slug_by_id = {}
    for v in active(cat["espacios"]):
        s = original_slug(v.get("notas"), "venues")
        if not s:
            n = slugify(v["nombre"])
            if (DATA / "venues" / f"{n}.json").exists():
                s = n
        if s:
            venue_slug_by_id[v["id"]] = s

    company_disciplines_by_id = {}
    for cid, s in company_slug_by_id.items():
        p = DATA / "companies" / f"{s}.json"
        if p.exists():
            company_disciplines_by_id[cid] = json.loads(p.read_text(encoding="utf-8")).get("disciplines", [])

    if not events_only:
        convert_works(cat, fuentes_by_id, existing_works, company_slug_by_id, company_disciplines_by_id)
    work_by_id = {}
    for o in active(cat["obras"]):
        s = original_slug(o.get("notas"), "works")
        if not s:
            n = slugify(o["nombre"])
            if (DATA / "works" / f"{n}.json").exists():
                s = n
        if s and (DATA / "works" / f"{s}.json").exists():
            rec = json.loads((DATA / "works" / f"{s}.json").read_text(encoding="utf-8"))
            work_by_id[o["id"]] = {"slug": s, "title": rec["title"], "disciplines": rec.get("disciplines", [])}

    convert_events(cat, fuentes_by_id, existing_events, company_slug_by_id, venue_slug_by_id, work_by_id)
    if not events_only:
        convert_artists(cat, fuentes_by_id, existing_artists, company_slug_by_id)

    print(json.dumps(REPORT["creados"], ensure_ascii=False, indent=1))
    print(json.dumps(REPORT["actualizados"], ensure_ascii=False, indent=1))
    total_omitidos = {k: len(v) for k, v in REPORT["omitidos"].items()}
    print("omitidos:", json.dumps(total_omitidos, ensure_ascii=False))
    out_path = lib.CATASTRO / "informes" / "export-a-data-omitidos.txt"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as fh:
        for col, items in REPORT["omitidos"].items():
            fh.write(f"## {col} ({len(items)})\n")
            for it in items:
                fh.write(f"- {it}\n")
            fh.write("\n")
    print("Detalle de omitidos:", out_path.relative_to(lib.ROOT))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
