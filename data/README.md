# data/

Datos versionados de QUINTA ESCENA. Un archivo JSON por entidad, validado contra `schemas/`.

| Carpeta | Contenido | Estado |
|---|---|---|
| `territories/` | Región, 8 provincias, 38 comunas (fuente BCN) | verificado; faltan CUT y centroides |
| `schemas/` | JSON Schema por entidad y vocabularios | listo |
| `quinta-escena-podcast/` | Serie, 7 episodios, La Posta | planificado |
| `artists/` | 7 protagonistas de la serie | pendiente de validación con cada persona |
| `companies/` | 6 agrupaciones vinculadas | pendiente |
| `works/` | 4 obras citadas | pendiente |
| `venues/`, `events/`, `calls/`, `editorial/`, `archive/` | vacías: se llenan con las investigaciones 1–6 | — |
| `research_queue.json` | Cola de investigación | activa |

Reglas: sin datos personales sensibles; cada registro con `sources[]` y `verification`; `published` solo con `verificado` y score ≥ 70. Validar con `python3 scripts/validar_datos.py`.
