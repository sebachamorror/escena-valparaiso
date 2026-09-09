#!/usr/bin/env python3
"""
Biblioteca común del catastro del ecosistema teatral de la Región de Valparaíso.

Solo biblioteca estándar. Los datos viven en catastro/datos/<coleccion>.json
(listas de registros). Los nombres de campo siguen el brief del catastro
(catastro/BRIEF.md): id, estado, fecha_ultima_verificacion, fuentes, etc.

Colecciones y prefijos de identificador:
  companias COMP · obras OBR · funciones FUN · espacios ESP · personas PER
  festivales FES · financiamiento FIN · fuentes FUE

Estados: DESCUBIERTO, VERIFICADO, PARCIAL, DUPLICADO, DESCARTADO.
Calidad de fuente: A institucional/oficial · B sitio oficial de compañía/teatro/festival
  · C medio confiable · D red social oficial · E directorio secundario · F no verificado.
"""
import datetime
import difflib
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CATASTRO = ROOT / "catastro"
DATOS = CATASTRO / "datos"
LOTES = CATASTRO / "lotes"
INFORMES = CATASTRO / "informes"
COMUNAS_JSON = ROOT / "data" / "territories" / "comunas.json"

PREFIXES = {
    "companias": "COMP", "obras": "OBR", "funciones": "FUN", "espacios": "ESP",
    "personas": "PER", "festivales": "FES", "financiamiento": "FIN", "fuentes": "FUE",
}
COLLECTIONS = [c for c in PREFIXES if c != "fuentes"]
STATES = ("DESCUBIERTO", "VERIFICADO", "PARCIAL", "DUPLICADO", "DESCARTADO")
QUALITIES = ("A", "B", "C", "D", "E", "F")
QUALITY_LABELS = {
    "A": "fuente institucional/oficial",
    "B": "sitio oficial de compañía, teatro o festival",
    "C": "medio de comunicación confiable",
    "D": "red social oficial",
    "E": "directorio secundario",
    "F": "dato no verificado",
}
NOT_FOUND = "NO ENCONTRADO"

# Campos comunes al final de todo registro (excepto fuentes).
COMMON_TAIL = ["fuentes", "estado", "fecha_descubrimiento", "fecha_ultima_verificacion",
               "duplicado_de", "contradicciones", "notas"]

FIELDS = {
    "companias": ["id", "nombre", "nombre_oficial", "nombre_artistico", "alias", "comuna", "provincia",
                  "localidad", "region", "anio_creacion", "director", "integrantes", "tipo", "disciplinas",
                  "descripcion", "obras", "espacios", "comunas_trabajo", "regiones_circulacion",
                  "festivales", "fondos", "instagram", "facebook", "youtube", "tiktok", "spotify",
                  "vimeo", "linkedin", "web", "correo", "telefono"] + COMMON_TAIL,
    "obras": ["id", "nombre", "compania", "director", "dramaturgo", "anio_estreno", "genero", "publico",
              "duracion", "comunas", "espacios", "festivales", "descripcion"] + COMMON_TAIL,
    "funciones": ["id", "obra", "compania", "fecha", "fecha_fin", "hora", "comuna", "espacio", "festival",
                  "tipo_funcion", "precio", "numero_funciones", "descripcion"] + COMMON_TAIL,
    "espacios": ["id", "nombre", "alias", "comuna", "provincia", "localidad", "direccion", "tipo_espacio",
                 "capacidad", "administracion", "programacion_teatral", "companias", "web", "instagram",
                 "facebook", "correo", "telefono", "lat", "lng", "descripcion"] + COMMON_TAIL,
    "personas": ["id", "nombre", "roles", "companias", "comuna", "provincia", "obras_dirigidas",
                 "formacion", "trayectoria", "instagram", "web"] + COMMON_TAIL,
    "festivales": ["id", "nombre", "alias", "comuna", "provincia", "anio_creacion", "periodicidad",
                   "organizacion", "espacios", "companias", "obras", "numero_versiones", "fechas",
                   "web", "instagram", "facebook", "descripcion"] + COMMON_TAIL,
    "financiamiento": ["id", "proyecto", "organizacion", "persona", "fondo", "linea", "monto", "anio",
                       "comuna", "provincia", "disciplina", "descripcion", "resultado", "folio",
                       "compania"] + COMMON_TAIL,
    "fuentes": ["id", "url", "titulo", "publicador", "tipo", "calidad", "fecha_consulta", "capa",
                "consulta", "notas"],
}

# Campos de lista (se unen, no se sobreescriben).
LIST_FIELDS = {
    "companias": {"alias", "integrantes", "disciplinas", "obras", "espacios", "comunas_trabajo",
                  "regiones_circulacion", "festivales", "fondos"},
    "obras": {"comunas", "espacios", "festivales"},
    "funciones": set(),
    "espacios": {"alias", "companias"},
    "personas": {"roles", "companias", "obras_dirigidas"},
    "festivales": {"alias", "espacios", "companias", "obras", "fechas"},
    "financiamiento": set(),
}

# Campos de referencia: campo -> colección destino (valor: nombre o id, o lista de ellos).
REFS = {
    "companias": {"obras": "obras", "espacios": "espacios", "festivales": "festivales",
                  "fondos": "financiamiento"},
    "obras": {"compania": "companias", "espacios": "espacios", "festivales": "festivales"},
    "funciones": {"obra": "obras", "compania": "companias", "espacio": "espacios",
                  "festival": "festivales"},
    "espacios": {"companias": "companias"},
    "personas": {"companias": "companias", "obras_dirigidas": "obras"},
    "festivales": {"espacios": "espacios", "companias": "companias", "obras": "obras"},
    "financiamiento": {"compania": "companias"},
}

# Campos de comuna (se resuelven a slug de data/territories/comunas.json).
COMMUNE_FIELDS = {
    "companias": {"comuna": False, "comunas_trabajo": True},
    "obras": {"comunas": True},
    "funciones": {"comuna": False},
    "espacios": {"comuna": False},
    "personas": {"comuna": False},
    "festivales": {"comuna": False},
    "financiamiento": {"comuna": False},
}

NAME_FIELD = {c: "nombre" for c in COLLECTIONS}
NAME_FIELD["financiamiento"] = "proyecto"
NAME_FIELD["funciones"] = None  # las funciones se identifican por obra+fecha+espacio


# ---------------------------------------------------------------- utilidades

def today():
    return datetime.date.today().isoformat()


def strip_accents(s):
    return "".join(ch for ch in unicodedata.normalize("NFKD", s) if not unicodedata.combining(ch))


def normalize(s):
    """Minúsculas, sin acentos, sin puntuación, espacios colapsados."""
    if s is None:
        return ""
    s = strip_accents(str(s)).lower()
    s = re.sub(r"[^a-z0-9ñ ]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


STOP_TOKENS = {"compania", "cia", "cía", "de", "del", "la", "el", "los", "las", "y", "teatro",
               "teatral", "colectivo", "colectiva", "agrupacion", "grupo", "centro", "cultural",
               "fundacion", "corporacion", "spa", "ltda", "eirl"}


def token_key(s):
    """Clave laxa para detectar duplicados: tokens sin palabras genéricas, ordenados."""
    toks = [t for t in normalize(s).split() if t not in STOP_TOKENS]
    return " ".join(sorted(toks))


def normalize_url(u):
    if not u:
        return None
    u = u.strip()
    u = re.sub(r"[?&](utm_[a-z]+|fbclid|igsh|igshid)=[^&]*", "", u)
    u = re.sub(r"\?$", "", u)
    if u.startswith("http://"):
        u = "https://" + u[7:]
    u = re.sub(r"^https://www\.", "https://", u)
    return u.rstrip("/")


def load(col):
    path = DATOS / f"{col}.json"
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def save(col, items):
    DATOS.mkdir(parents=True, exist_ok=True)
    path = DATOS / f"{col}.json"
    path.write_text(json.dumps(items, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def load_all():
    return {c: load(c) for c in PREFIXES}


def save_all(data):
    for c, items in data.items():
        save(c, items)


def next_id(col, items):
    prefix = PREFIXES[col]
    mx = 0
    for it in items:
        m = re.match(rf"{prefix}-(\d+)$", it.get("id", ""))
        if m:
            mx = max(mx, int(m.group(1)))
    return f"{prefix}-{mx + 1:04d}"


def is_id(value, col=None):
    if not isinstance(value, str):
        return False
    if col:
        return re.match(rf"{PREFIXES[col]}-\d{{4}}$", value) is not None
    return re.match(r"(COMP|OBR|FUN|ESP|PER|FES|FIN|FUE)-\d{4}$", value) is not None


def empty_record(col):
    rec = {}
    for f in FIELDS[col]:
        if f in LIST_FIELDS.get(col, set()) or f in ("fuentes", "contradicciones"):
            rec[f] = []
        else:
            rec[f] = None
    if col != "fuentes":
        rec["estado"] = "DESCUBIERTO"
        rec["fecha_descubrimiento"] = today()
        rec["fecha_ultima_verificacion"] = today()
        if col == "companias":
            rec["region"] = "valparaiso"
    return rec


# --------------------------------------------------------------- territorio

_COMMUNES = None


def communes():
    """{slug: {name, province, lat, lng}} desde data/territories/comunas.json."""
    global _COMMUNES
    if _COMMUNES is None:
        d = json.loads(COMUNAS_JSON.read_text(encoding="utf-8"))
        _COMMUNES = {c["slug"]: c for c in d["communes"]}
        _COMMUNES["__provinces__"] = {p["slug"]: p for p in d["provinces"]}
    return _COMMUNES


def provinces():
    return communes()["__provinces__"]


COMMUNE_ALIASES = {
    "llay llay": "llaillay", "llayllay": "llaillay", "llay-llay": "llaillay",
    "rapa nui": "isla-de-pascua", "isla de pascua": "isla-de-pascua",
    "vina": "vina-del-mar", "vina del mar": "vina-del-mar",
    "valpo": "valparaiso", "valparaiso": "valparaiso",
    "san felipe de aconcagua": "san-felipe", "santa maria": "santa-maria",
    "juan fernandez": "juan-fernandez", "archipielago juan fernandez": "juan-fernandez",
    "la calera": "la-calera", "calera": "la-calera",
    "el quisco": "el-quisco", "el tabo": "el-tabo", "santo domingo": "santo-domingo",
}


def resolve_commune(value):
    """Nombre libre o slug -> slug de comuna, o None si no se reconoce."""
    if value is None:
        return None
    if isinstance(value, str) and value in communes() and not value.startswith("__"):
        return value
    n = normalize(value)
    if n in COMMUNE_ALIASES:
        return COMMUNE_ALIASES[n]
    for slug, c in communes().items():
        if slug.startswith("__"):
            continue
        if n == normalize(c["name"]) or n == slug.replace("-", " "):
            return slug
    return None


def province_of(commune_slug):
    c = communes().get(commune_slug)
    return c["province"] if c else None


def commune_name(slug):
    c = communes().get(slug)
    return c["name"] if c else (slug or NOT_FOUND)


def province_name(slug):
    p = provinces().get(slug)
    return p["name"] if p else (slug or NOT_FOUND)


# ---------------------------------------------------------------- búsqueda

def find_by_name(items, col, name):
    """Coincidencia exacta normalizada por nombre o alias. Devuelve el registro o None."""
    nf = NAME_FIELD.get(col)
    if not nf or not name:
        return None
    n = normalize(name)
    if not n:
        return None
    for it in items:
        if it.get("estado") == "DUPLICADO":
            continue
        cands = [it.get(nf)] + list(it.get("alias") or []) + [it.get("nombre_oficial"),
                                                                it.get("nombre_artistico")]
        if any(c and normalize(c) == n for c in cands):
            return it
    return None


def find_by_id(items, rid):
    for it in items:
        if it.get("id") == rid:
            return it
    return None


def similar_names(a, b):
    return difflib.SequenceMatcher(None, normalize(a), normalize(b)).ratio()


# ------------------------------------------------------------------ estado

def best_quality(record, sources_by_id):
    qs = [sources_by_id[f]["calidad"] for f in record.get("fuentes", []) if f in sources_by_id
          and sources_by_id[f].get("calidad")]
    return min(qs) if qs else "F"


def evaluate_state(col, record, sources_by_id):
    """Asigna DESCUBIERTO o PARCIAL según completitud; respeta estados manuales."""
    if record.get("estado") in ("VERIFICADO", "DUPLICADO", "DESCARTADO"):
        return record["estado"]
    q = best_quality(record, sources_by_id)
    if q not in "ABCD":
        return "DESCUBIERTO"
    if col == "companias":
        rich = any(record.get(f) for f in ("obras", "instagram", "web", "director", "descripcion",
                                            "facebook", "anio_creacion"))
        return "PARCIAL" if record.get("comuna") and rich else "DESCUBIERTO"
    if col == "funciones":
        return "PARCIAL" if record.get("fecha") and record.get("comuna") else "DESCUBIERTO"
    if col == "financiamiento":
        return "PARCIAL" if record.get("anio") and record.get("organizacion") else "DESCUBIERTO"
    if col == "personas":
        return "PARCIAL" if record.get("roles") and record.get("companias") else "DESCUBIERTO"
    return "PARCIAL" if record.get("comuna") else "DESCUBIERTO"


def sources_index(data):
    return {s["id"]: s for s in data.get("fuentes", [])}


def csv_value(v):
    """Valor para CSV: listas unidas con ' | ', None -> NO ENCONTRADO."""
    if v is None or v == [] or v == "":
        return NOT_FOUND
    if isinstance(v, list):
        return " | ".join(csv_value(x) for x in v)
    if isinstance(v, dict):
        return json.dumps(v, ensure_ascii=False)
    return str(v)
