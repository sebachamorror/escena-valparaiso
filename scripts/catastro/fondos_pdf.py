#!/usr/bin/env python3
"""
Extrae los proyectos de la Región de Valparaíso desde las nóminas PDF de seleccionados de
Fondos de Cultura (fondosdecultura.cl) y genera lotes de `financiamiento` para el catastro.

Requiere PyMuPDF (`pip install pymupdf`); es la única dependencia externa del catastro y
solo la usa este script. Respeta el sitio: una descarga por PDF, con caché local.

Uso:
  python3 scripts/catastro/fondos_pdf.py                 # procesa catastro/fuentes/fondos_pdf.json
  python3 scripts/catastro/fondos_pdf.py --ingerir       # además ingiere los lotes generados
  python3 scripts/catastro/fondos_pdf.py --solo 2026     # filtra por año
  python3 scripts/catastro/fondos_pdf.py --filas         # imprime las filas (revisión manual)
  python3 scripts/catastro/fondos_pdf.py --entidades     # además crea personas/organizaciones responsables
                                                         # (solo desde fondos de artes escénicas y PAOCC)

Manifiesto (catastro/fuentes/fondos_pdf.json): lista de
  {"url": ..., "fondo": "Fondo de Artes Escénicas", "anio": 2026, "titulo": ..., "notas": ...}

Cada fila regional se convierte en un registro de financiamiento con folio, modalidad (línea),
título, responsable y monto. La comuna NO viene en las nóminas: queda null. No se crean
compañías automáticamente (el nombre del responsable puede ser persona, municipio o
universidad); eso se hace a mano leyendo las filas (`--filas`).
"""
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lib  # noqa: E402

MANIFEST = lib.CATASTRO / "fuentes" / "fondos_pdf.json"
CACHE = Path.home() / ".cache" / "quinta-escena" / "fondos"
UA = "Mozilla/5.0 (compatible; QuintaEscena-catastro/1.0; +https://escena-valparaiso.vercel.app)"

ORG_WORDS = re.compile(r"\b(fundaci[oó]n|corporaci[oó]n|compa[ñn][ií]a|c[ií]a\.?|colectivo|colectiva|agrupaci[oó]n|"
                       r"asociaci[oó]n|centro|ong|teatro|cooperativa|club|escuela|universidad|municipalidad|"
                       r"ilustre|limitada|ltda|spa|e\.i\.r\.l|eirl|sociedad|organizaci[oó]n|junta|sindicato|"
                       r"comunidad|instituto|circo|titeres|t[ií]teres|producciones|productora|ensamble|"
                       r"orquesta|ballet|coro|grupo|taller|red|festival|comit[eé]|liceo|colegio|gobierno)\b",
                       re.I)


# Palabras que indican artes escénicas (para filtrar Fondart Regional/Nacional, que abarcan todas las áreas).
PERF_WORDS = re.compile(r"teatr|t[ií]tere|marionet|circo|circense|danza|coreogr|esc[eé]nic|clown|payas|performance|"
                        r"dramaturg|\b[oó]pera\b|narraci[oó]n oral|cuentacuento|\bmim[oa]\b|butoh|musical|lambe|"
                        r"malabar|acrob|improvisaci[oó]n|mon[oó]logo|\bobra\b|montaje|\bactor|actriz|actuaci[oó]n|"
                        r"varieté|variete|juglar|comedia|cabaret|bufón|bufon", re.I)


def is_performing(fondo, row):
    if "Escénicas" in fondo or "PAOCC" in fondo:
        return True
    text = " ".join(x for x in (row.get("titulo"), row.get("modalidad"), row.get("responsable")) if x)
    return bool(PERF_WORDS.search(text))


def download(url):
    CACHE.mkdir(parents=True, exist_ok=True)
    name = re.sub(r"[^A-Za-z0-9._-]", "_", url.split("/")[-1])
    path = CACHE / name
    if path.exists() and path.stat().st_size > 0:
        return path
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        path.write_bytes(r.read())
    time.sleep(1.0)
    return path


def parse_amount(s):
    digits = re.sub(r"[^\d]", "", s or "")
    return int(digits) if digits else None


def header_map(cells):
    m = {}
    for i, c in enumerate(cells):
        n = lib.normalize(c)
        if not n:
            continue
        if "region" in n:
            m["region"] = i
        elif "folio" in n:
            m["folio"] = i
        elif "modalidad" in n or "linea" in n or "submodalidad" in n:
            m["modalidad"] = i
        elif "titulo" in n:
            m["titulo"] = i
        elif "responsable" in n:
            m["responsable"] = i
        elif "monto" in n:
            m["monto"] = i
        elif n in ("n", "no", "nº"):
            m["n"] = i
    return m if {"folio", "titulo", "responsable"} <= set(m) else None


def positional_map(cells):
    n = len(cells)
    if n >= 7:
        return {"n": 0, "region": 1, "folio": 2, "modalidad": 3, "titulo": 4, "responsable": 5, "monto": 6}
    if n == 6:
        return {"n": 0, "region": 1, "folio": 2, "titulo": 3, "responsable": 4, "monto": 5}
    return None


def extract_rows(pdf_path):
    import fitz  # PyMuPDF
    doc = fitz.open(pdf_path)
    rows, current_map = [], None
    for page in doc:
        for table in page.find_tables():
            for raw in table.extract():
                cells = [(c or "").replace("\n", " ").strip() for c in raw]
                cells = [re.sub(r"\s+", " ", c) for c in cells]
                hm = header_map(cells)
                if hm:
                    current_map = hm
                    continue
                m = current_map or positional_map(cells)
                if not m or len(cells) <= max(m.values()):
                    continue
                folio = cells[m["folio"]]
                if not re.match(r"^\d{5,7}$", folio):
                    continue
                region = cells[m["region"]] if "region" in m else ""
                if not re.search(r"valpara", region, re.I):
                    continue
                rows.append({
                    "folio": folio,
                    "modalidad": cells[m["modalidad"]] if "modalidad" in m else None,
                    "titulo": cells[m["titulo"]],
                    "responsable": cells[m["responsable"]],
                    "monto": parse_amount(cells[m["monto"]]) if "monto" in m else None,
                    "pagina": page.number + 1,
                })
    return rows


def is_org(name):
    return bool(ORG_WORDS.search(name or ""))


MUNI_WORDS = re.compile(r"municipalidad|municipal\b|universidad|ministerio|gobierno|servicio nacional|liceo|colegio|"
                        r"escuela b[aá]sica|corporaci[oó]n municipal", re.I)
LOWER = {"de", "del", "la", "las", "los", "y", "e", "da", "di", "van", "von"}


def clean_name(name):
    """Normaliza nombres de la nómina: mayúsculas sostenidas -> Tipo Título; tokens repetidos seguidos."""
    toks = re.sub(r"\s+", " ", name or "").strip().split(" ")
    out = []
    for t in toks:
        if out and lib.normalize(t) == lib.normalize(out[-1]):
            continue
        out.append(t)
    if name.isupper():
        out = [t.lower() if t.lower() in LOWER else t.capitalize() for t in out]
    return " ".join(out)


def build_batch(entry, rows, source_key, entities=False):
    fondo = entry["fondo"]
    anio = entry["anio"]
    batch = {"capa": 5, "consulta": entry.get("consulta"), "resumen": f"{fondo} {anio}: {len(rows)} proyectos de la Región de Valparaíso",
             "fuentes": [{"clave": source_key, "url": entry["url"], "titulo": entry["titulo"],
                          "publicador": "Ministerio de las Culturas, las Artes y el Patrimonio — Fondos Cultura",
                          "tipo": "institucional", "calidad": "A", "notas": entry.get("notas")}],
             "companias": [], "personas": [], "financiamiento": []}
    perf_fund = "Escénicas" in fondo or "PAOCC" in fondo
    for r in rows:
        if not is_performing(fondo, r):
            continue
        resp = r["responsable"]
        # Entidades: solo desde fondos de artes escénicas (los responsables son del sector).
        if entities and perf_fund and resp and not re.match(r"no aplica", resp, re.I):
            desc = f"«{r['titulo']}» ({fondo} {anio}, {r['modalidad'] or entry.get('linea') or 'línea única'})"
            if is_org(resp):
                if not MUNI_WORDS.search(resp):
                    batch["companias"].append({
                        "nombre": clean_name(resp), "tipo": "organización de artes escénicas (según nómina de fondos)",
                        "fuentes": [source_key],
                        "notas": f"Responsable del proyecto {desc}. Comuna no indicada en la nómina (solo región)."})
                    r = dict(r, compania=clean_name(resp))
            else:
                batch["personas"].append({
                    "nombre": clean_name(resp), "roles": ["Responsable de proyecto (Fondos Cultura)"],
                    "fuentes": [source_key],
                    "notas": f"Responsable del proyecto {desc}. Comuna no indicada en la nómina (solo región)."})
        disciplina = "artes escénicas" if ("Escénicas" in fondo or "PAOCC" in fondo) \
            else "artes escénicas (palabra clave en el título; por confirmar)"
        rec = {"proyecto": r["titulo"], "fondo": fondo, "linea": r["modalidad"] or entry.get("linea"),
               "anio": anio, "folio": r["folio"], "monto": r["monto"], "resultado": "seleccionado",
               "disciplina": disciplina, "fuentes": [source_key],
               "notas": f"Responsable según nómina: {resp}. Página {r['pagina']} del PDF. Comuna no indicada en la nómina (solo región)."}
        if is_org(resp):
            rec["organizacion"] = clean_name(resp)
        else:
            rec["persona"] = clean_name(resp)
        if r.get("compania"):
            rec["compania"] = r["compania"]
        batch["financiamiento"].append(rec)
    return batch


def main(argv):
    if not MANIFEST.exists():
        print("Falta el manifiesto", MANIFEST)
        return 1
    entries = json.loads(MANIFEST.read_text(encoding="utf-8"))
    only = argv[argv.index("--solo") + 1] if "--solo" in argv else None
    show = "--filas" in argv
    lotes = []
    for e in entries:
        if only and str(e["anio"]) != only and only not in e["url"]:
            continue
        try:
            path = download(e["url"])
            rows = extract_rows(path)
        except Exception as ex:  # noqa: BLE001
            print(f"ERROR {e['url']}: {ex}")
            continue
        slug = re.sub(r"[^a-z0-9]+", "-", lib.normalize(f"{e['fondo']} {e.get('etiqueta', '')}")).strip("-")
        key = f"pdf-{e['anio']}-{slug}"
        batch = build_batch(e, rows, key, entities="--entidades" in argv)
        lib.LOTES.mkdir(parents=True, exist_ok=True)
        out = lib.LOTES / f"fondos-{e['anio']}-{slug}.json"
        out.write_text(json.dumps(batch, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        lotes.append(out)
        print(f"{e['anio']} {e['fondo']} {e.get('etiqueta', '')}: {len(rows)} filas -> {out.name}")
        if show:
            for r in rows:
                if is_performing(e["fondo"], r):
                    print(f"   [{r['folio']}] {r['modalidad'] or '-'} | {r['titulo']} | {r['responsable']} | {r['monto']}")
    if "--ingerir" in argv and lotes:
        import agregar
        data = lib.load_all()
        for p in lotes:
            agregar.ingest_batch(data, json.loads(p.read_text(encoding="utf-8")))
        lib.save_all(data)
        print(json.dumps(agregar.REPORT["nuevos"], ensure_ascii=False), "fuentes nuevas:", agregar.REPORT["fuentes_nuevas"])
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
