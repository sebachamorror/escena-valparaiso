#!/usr/bin/env python3
"""
Cola de consultas de búsqueda del catastro (catastro/datos/consultas.json).

Uso:
  python3 scripts/catastro/consultas.py generar          # crea/actualiza la cola (no borra hechas)
  python3 scripts/catastro/consultas.py siguiente [N] [--capa K] [--comuna slug]
  python3 scripts/catastro/consultas.py hecha Q-0012 [--resumen "..."] [--sin-resultados]
  python3 scripts/catastro/consultas.py agregar "texto" --capa 12 [--comuna slug]
  python3 scripts/catastro/consultas.py resumen

Capas (brief §20): 1 institucional · 2 directorios · 3 carteleras · 4 festivales · 5 fondos
  · 6 sitios de compañías · 7 redes · 8 prensa · 9 por comuna · 10 búsqueda inversa
  · 11 cruce de datos · 12 organizaciones nuevas.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lib  # noqa: E402

PATH = lib.DATOS / "consultas.json"

SEED = [
    # Capa 1: institucional
    (1, None, "Red Cultura catastro infraestructura cultural Región de Valparaíso espacios culturales"),
    (1, None, "Directorio Nacional de Espacios Culturales Región de Valparaíso teatro sala"),
    (1, None, "Puntos de Cultura Comunitaria Región de Valparaíso teatro"),
    (1, None, "Seremi de las Culturas Valparaíso compañías de teatro regional"),
    (1, None, "Catálogo Compañías de Teatro Tradicional de Títeres Región de Valparaíso Servicio Nacional del Patrimonio 2025"),
    (1, None, "SIGPA cultores artes escénicas Región de Valparaíso teatro títeres"),
    (1, None, "Observatorio Cultural artes escénicas Región de Valparaíso informe"),
    (1, None, "Gobierno Regional de Valparaíso 7% FNDR cultura proyectos teatro adjudicados"),
    (1, None, "PAOCC Programa de Apoyo a Organizaciones Culturales Colaboradoras Región de Valparaíso teatro"),
    (1, None, "Registro Ley 19.862 organizaciones culturales Región de Valparaíso teatro"),
    (1, None, "Universidad de Valparaíso carrera de teatro compañía egresados"),
    (1, None, "Universidad de Playa Ancha teatro compañía estudiantes"),
    (1, None, "PUCV Pontificia Universidad Católica de Valparaíso teatro compañía universitaria"),
    (1, None, "Duoc UC Viña del Mar actuación egresados compañía"),
    (1, None, "Escuela de Teatro Imagen Valparaíso"),
    # Capa 2: directorios
    (2, None, "Puerto Escena Valparaíso teatro"),
    (2, None, "Valpocultura cartelera teatro"),
    (2, None, "directorio compañías de teatro Región de Valparaíso"),
    (2, None, "catálogo artes escénicas Valparaíso compañías 2025"),
    (2, None, "Red de Salas de Teatro Valparaíso"),
    (2, None, "Asamblea Titiritera ATTICH V Región compañías"),
    (2, None, "Fundación TeatroMuseo del Títere y el Payaso programación compañías"),
    # Capa 3: carteleras
    (3, None, "cartelera teatro Valparaíso Viña del Mar septiembre 2026"),
    (3, None, "cartelera teatro Valparaíso 2025"),
    (3, None, "Parque Cultural de Valparaíso programación teatro 2025 2026"),
    (3, None, "Teatro Municipal de Valparaíso programación obras"),
    (3, None, "Teatro Municipal de Viña del Mar programación teatro"),
    (3, None, "Teatro Condell Valparaíso programación"),
    (3, None, "Sala Negra Universidad de Valparaíso programación teatro"),
    (3, None, "Centro de Extensión Duoc UC Viña del Mar teatro"),
    (3, None, "Teatro Municipal de Quilpué programación"),
    (3, None, "Teatro Pompeya Villa Alemana programación"),
    (3, None, "Teatro Municipal Limache programación"),
    (3, None, "Centro Cultural San Antonio programación teatro"),
    (3, None, "Teatro Municipal San Felipe programación"),
    (3, None, "Centro Cultural Los Andes programación teatro"),
    (3, None, "Casa de la Cultura La Ligua programación"),
    (3, None, "Teatro Quillota programación obras"),
    (3, None, "ticketplus teatro Valparaíso"),
    (3, None, "passline teatro Viña del Mar"),
    # Capa 4: festivales
    (4, None, "festival de teatro Región de Valparaíso 2025"),
    (4, None, "festival de teatro Región de Valparaíso 2024"),
    (4, None, "Festival Ventolera Valparaíso compañías"),
    (4, None, "Festival Caleta de Títeres Valparaíso compañías"),
    (4, None, "Festival Teatro Container Valparaíso compañías"),
    (4, None, "Puerto a Puerta Valparaíso festival compañías"),
    (4, None, "Festival Litoral Teatral San Antonio compañías"),
    (4, None, "Festival Valle del Liwa Petorca teatro"),
    (4, None, "Festival Internacional de Teatro Viña del Mar"),
    (4, None, "festival de títeres Región de Valparaíso"),
    (4, None, "festival teatro callejero Valparaíso"),
    (4, None, "festival teatro Aconcagua San Felipe Los Andes"),
    (4, None, "festival teatro familiar Quilpué Villa Alemana"),
    (4, None, "Encuentro de Teatro Porteño Independiente compañías"),
    (4, None, "festival de artes escénicas Quillota"),
    (4, None, "festival teatro escolar Región de Valparaíso"),
    # Capa 5: fondos
    (5, None, "Fondart Regional Valparaíso artes escénicas resultados 2025 seleccionados"),
    (5, None, "Fondart Regional Valparaíso artes escénicas resultados 2024 seleccionados"),
    (5, None, "Fondart Regional Valparaíso teatro resultados 2023 seleccionados"),
    (5, None, "Fondos de Cultura 2026 resultados Región de Valparaíso teatro"),
    (5, None, "datos.gob.cl fondos de cultura proyectos seleccionados dataset"),
    (5, None, "Fondart Nacional teatro Valparaíso compañía adjudicada"),
    (5, None, "subvención municipal cultura Valparaíso teatro compañía adjudicada"),
    (5, None, "fondo concursable cultura Viña del Mar teatro adjudicados"),
    (5, None, "Gobierno Regional Valparaíso cultura FNDR 2025 resultados artes escénicas"),
    (5, None, "Valparaíso Creativo compañías de teatro"),
    # Capa 8: prensa
    (8, None, "El Mercurio de Valparaíso compañía de teatro estreno"),
    (8, None, "El Martutino teatro compañía estreno Valparaíso"),
    (8, None, "El Observador Quillota teatro compañía"),
    (8, None, "Diario El Trabajo San Felipe teatro compañía"),
    (8, None, "El Andino Los Andes teatro compañía"),
    (8, None, "Proa San Antonio teatro compañía"),
    (8, None, "El Epicentro Valparaíso teatro compañía"),
    (8, None, "Soy Valparaíso teatro compañía estreno"),
    (8, None, "La Estrella Valparaíso teatro obra"),
    (8, None, "diario Quilpué Villa Alemana teatro compañía"),
    (8, None, "diario La Ligua Petorca teatro compañía"),
    # Capa 6/7: sitios y redes (búsquedas por categoría)
    (7, None, "instagram compañía de teatro Valparaíso"),
    (7, None, "instagram teatro Viña del Mar compañía"),
    (7, None, "instagram títeres Valparaíso compañía"),
    (7, None, "facebook compañía de teatro Quilpué"),
    (7, None, "youtube compañía de teatro Valparaíso obra completa"),
    (6, None, "teatro comunitario Región de Valparaíso"),
    (6, None, "teatro callejero Valparaíso compañía"),
    (6, None, "teatro infantil Valparaíso compañía"),
    (6, None, "teatro itinerante Región de Valparaíso"),
    (6, None, "circo teatro Valparaíso compañía"),
    (6, None, "performance colectivo Valparaíso artes escénicas"),
    (6, None, "productora teatral Valparaíso"),
    (6, None, "Lambe Lambe Valparaíso"),
    (6, None, "narración oral Valparaíso compañía"),
    (6, None, "clown Valparaíso compañía"),
    (6, None, "teatro universitario Valparaíso compañía"),
    (6, None, "marionetas Valparaíso compañía"),
    (6, None, "danza teatro Valparaíso compañía"),
]

COMMUNE_TERMS = [
    '"compañía de teatro" "{c}"',
    'teatro "{c}" obra compañía',
    '"obra de teatro" "{c}" 2025',
    'festival teatro "{c}"',
    '"artes escénicas" "{c}"',
    'cartelera cultural "{c}" teatro',
    'sala teatro centro cultural "{c}"',
    'títeres "{c}" compañía',
]
# Comunas con nombres ambiguos: se añade el país.
AMBIGUOUS = {"la-cruz", "nogales", "santa-maria", "hijuelas", "cabildo", "catemu", "rinconada",
             "san-esteban", "calle-larga", "el-tabo", "el-quisco", "papudo", "zapallar", "petorca",
             "quintero", "cartagena", "algarrobo", "santo-domingo", "panquehue", "olmue", "limache",
             "casablanca", "la-calera"}


def load():
    if PATH.exists():
        return json.loads(PATH.read_text(encoding="utf-8"))
    return []


def save(qs):
    lib.DATOS.mkdir(parents=True, exist_ok=True)
    PATH.write_text(json.dumps(qs, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def add(qs, texto, capa, comuna=None):
    for q in qs:
        if lib.normalize(q["texto"]) == lib.normalize(texto):
            return q
    n = max([int(q["id"].split("-")[1]) for q in qs] + [0]) + 1
    q = {"id": f"Q-{n:04d}", "texto": texto, "capa": capa, "comuna": comuna, "estado": "pendiente",
         "fecha": None, "resumen": None}
    qs.append(q)
    return q


def generate(qs):
    for capa, comuna, texto in SEED:
        add(qs, texto, capa, comuna)
    for slug, c in lib.communes().items():
        if slug.startswith("__"):
            continue
        name = c["name"]
        for t in COMMUNE_TERMS:
            texto = t.format(c=name)
            if slug in AMBIGUOUS:
                texto += " Chile"
            add(qs, texto, 9, slug)
    return qs


def main(argv):
    if not argv:
        print(__doc__)
        return 1
    cmd = argv[0]
    qs = load()
    if cmd == "generar":
        generate(qs)
        save(qs)
        print(f"Cola: {len(qs)} consultas ({sum(q['estado']=='pendiente' for q in qs)} pendientes)")
    elif cmd == "siguiente":
        n = int(argv[1]) if len(argv) > 1 and argv[1].isdigit() else 10
        capa = int(argv[argv.index("--capa") + 1]) if "--capa" in argv else None
        comuna = argv[argv.index("--comuna") + 1] if "--comuna" in argv else None
        out = [q for q in qs if q["estado"] == "pendiente"
               and (capa is None or q["capa"] == capa) and (comuna is None or q["comuna"] == comuna)]
        for q in out[:n]:
            print(f"{q['id']}\tcapa {q['capa']}\t{q['comuna'] or '-'}\t{q['texto']}")
    elif cmd == "hecha":
        qid = argv[1]
        resumen = argv[argv.index("--resumen") + 1] if "--resumen" in argv else None
        for q in qs:
            if q["id"] == qid:
                q["estado"] = "sin_resultados" if "--sin-resultados" in argv else "hecha"
                q["fecha"] = lib.today()
                if resumen:
                    q["resumen"] = resumen
        save(qs)
    elif cmd == "agregar":
        texto = argv[1]
        capa = int(argv[argv.index("--capa") + 1]) if "--capa" in argv else 12
        comuna = argv[argv.index("--comuna") + 1] if "--comuna" in argv else None
        q = add(qs, texto, capa, comuna)
        save(qs)
        print(q["id"])
    elif cmd == "resumen":
        by = {}
        for q in qs:
            by.setdefault(q["capa"], {"pendiente": 0, "hecha": 0, "sin_resultados": 0})
            by[q["capa"]][q["estado"]] = by[q["capa"]].get(q["estado"], 0) + 1
        for capa in sorted(by):
            print(f"capa {capa:2d}: {by[capa]}")
        pend_com = {}
        for q in qs:
            if q["capa"] == 9:
                pend_com.setdefault(q["comuna"], [0, 0])
                pend_com[q["comuna"]][0 if q["estado"] == "pendiente" else 1] += 1
        done = [c for c, v in pend_com.items() if v[0] == 0]
        print(f"comunas con capa 9 completa: {len(done)}/{len(pend_com)}")
    else:
        print(__doc__)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
