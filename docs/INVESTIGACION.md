# Investigación

Cómo se encuentran, documentan y verifican las entidades de ESCENA VALPARAÍSO. Las skills en `.claude/skills/` aplican esta metodología por tipo.

## 1. Regla fundamental

Se investiga para **documentar lo que existe**, no para llenar campos. Si no hay información: `null` o `[NO ENCONTRADO]`. Nunca se afirma que una compañía está activa solo porque existe una página antigua: se buscan **señales recientes de actividad** (últimos 12 meses): función, publicación, convocatoria adjudicada, prensa, programación en un espacio.

## 2. Niveles de fuente

| Nivel | Tipo | Ejemplos | Peso |
|---|---|---|---|
| 1 | Oficiales e institucionales | sitio web y redes oficiales de la compañía o artista; municipalidades; centros culturales y teatros; universidades; Ministerio de las Culturas y Seremi de Valparaíso; SIGPA; Fondos de Cultura (resultados); Registro de organizaciones Ley 19.862; Catálogo de Compañías de Teatro Tradicional de Títeres Región de Valparaíso (Servicio Nacional del Patrimonio Cultural, 2025); Gobierno Regional (7% FNDR) | Alto |
| 2 | Periodísticas y académicas | El Mercurio de Valparaíso, El Observador (Quillota), El Proa (San Antonio), Diario El Trabajo (San Felipe), El Andino (Los Andes), La Estrella, medios nacionales, revistas especializadas, publicaciones universitarias | Medio |
| 3 | Secundarias | directorios, agregadores, redes de terceros, carteleras comerciales, bases externas | Bajo; nunca única fuente |

No confiar únicamente en una red social. Una red social oficial cuenta como nivel 1 para existencia y actividad, pero no para trayectoria, premios o fondos.

## 3. Metodología por compañía (15 pasos)

1. Buscar el nombre (variantes, con y sin "Compañía", "Cía.", "Teatro").
2. Verificar territorio (comuna de sede; distinguir sede de lugar de funciones).
3. Confirmar disciplina(s) con vocabulario controlado.
4. Confirmar que está activa (señal reciente).
5. Encontrar fuente primaria.
6. Encontrar fuente secundaria.
7. Localizar sitio web.
8. Localizar redes oficiales.
9. Identificar integrantes solo si están publicados.
10. Identificar obras (título, año, autoría, dirección).
11. Identificar festivales.
12. Identificar fondos (con folio y año cuando la fuente lo da).
13. Identificar espacios donde trabaja o presenta.
14. Identificar relación territorial (origen, comunas de circulación).
15. Guardar todas las fuentes con URL y fecha de consulta.

## 4. Score de confianza

| Rango | Significado | Criterio |
|---|---|---|
| 90–100 | Confirmación oficial reciente | Fuente nivel 1 con actividad en los últimos 12 meses, o validación directa de la entidad |
| 70–89 | Confirmado por fuentes institucionales y secundarias | Al menos una nivel 1 y una nivel 2, actividad en 24 meses |
| 50–69 | Información parcial | Una sola fuente confiable, o fuentes con más de 24 meses |
| 0–49 | Insuficiente | Solo nivel 3, o contradicciones, o sin fuente |

**Umbral de publicación: 70**, y además `verification_status = verificado`. Entre 50 y 69 la ficha existe solo en el panel como borrador. Bajo 50 permanece en la cola.

## 5. Cola de investigación

`data/research_queue.json` (y tabla `research_tasks`):

```json
{ "target": "Compañía X", "target_type": "company", "territory": "san-antonio", "province": "san-antonio",
  "status": "pending", "priority": "high", "origin": "documento-proyecto", "notes": "...", "added_at": "2026-09-05" }
```

Estados: `pending`, `in_progress`, `done`, `discarded`. Prioridad: `high` (protagonistas y provincias sin registros), `medium`, `low`. Origen: `documento-proyecto`, `participacion-ciudadana`, `catalogo-oficial`, `prensa`, `investigacion-territorial`.

## 6. Formatos de importación

**JSON** (uno por entidad, validado con `data/schemas/`):
```json
{ "name": "", "type": "company", "discipline": [], "commune": "", "province": "", "website": "", "social": {}, "sources": [] }
```
**CSV** (lotes): columnas `slug,name,type,disciplines,commune,website,instagram,status,source_url,source_title,accessed_at,confidence_score,notes`. Una fila por entidad; fuentes adicionales en filas `entity_sources.csv`.
**Markdown** (editorial y trayectorias): frontmatter YAML con los campos del esquema `post`, cuerpo en Markdown.

`scripts/validar_datos.py` valida los tres antes de importar; `scripts/importar.py` (Fase 3) carga a Supabase resolviendo slugs.

## 7. Dónde buscar, en orden de rendimiento

1. Encargados de cultura municipales (38 comunas): saben quién hace teatro en su comuna.
2. Programación de teatros y centros culturales municipales (San Felipe, Los Andes, Quillota, Quilpué, Villa Alemana, San Antonio, Valparaíso, Viña del Mar): quién funcionó ahí en tres años.
3. Adjudicatarios de Fondos de Cultura en artes escénicas, filtrados por comuna de la región: registro público y confiable.
4. Asamblea Titiritera ATTICH V Región y Fundación TeatroMuseo del Títere y el Payaso.
5. Catálogo de Compañías de Teatro Tradicional de Títeres (2025) y Seremi de las Culturas de Valparaíso.
6. Universidades con carreras escénicas (Universidad de Valparaíso, PUCV, UPLA, Duoc UC) y sus compañías.
7. Departamentos de educación municipal y jardines JUNJI/Integra: el teatro familiar del interior vive de funciones escolares.
8. SIGPA (cultores), Registro Ley 19.862, 7% FNDR del Gobierno Regional.
9. Prensa regional y comunal.
10. Festivales: Valle del Liwa (Petorca), Litoral Teatral (San Antonio), Ventolera y Caleta de Títeres (Valparaíso), Teatro Container, Puerto a Puerta.

## 8. Ética y datos personales

- Solo datos públicos y profesionales. Nada de RUT, direcciones particulares ni teléfonos personales.
- Contacto se publica solo si es público en una fuente oficial de la propia entidad o si la persona lo autorizó.
- Menores: nunca datos identificables.
- Fotografías: solo con licencia o autorización; se registra en `media`.
- Toda persona puede pedir corrección o retiro.
- Se registra la fecha de consulta y, cuando es posible, una copia archivada de la fuente (Wayback Machine).

## 9. Plan de investigaciones

| N.º | Investigación | Salida | Skill |
|---|---|---|---|
| 1 | Todas las compañías de teatro y artes escénicas conocidas de la región: profesionales, independientes, comunitarias, universitarias, infantiles, familiares, títeres, físico, circo, narración oral, experimental, Lambe-Lambe, colectivos, agrupaciones | `data/companies/` | `buscar-companias-teatro` |
| 2 | Artistas escénicos por rol: actores, actrices, directores, dramaturgos, músicos escénicos, técnicos, diseñadores, productores, gestores, titiriteros, payasos, narradores, artistas circenses | `data/artists/` | `buscar-artistas-escenicos` |
| 3 | Espacios escénicos: teatros, salas, centros culturales, museos, independientes, municipales, universitarios | `data/venues/` | `buscar-espacios-escenicos` |
| 4 | Cartelera regional (con fecha verificada y fuente; nunca copiada automáticamente) | `data/events/` | `buscar-cartelera` |
| 5 | Fondos, convocatorias y oportunidades (regionales, Fondos de Cultura, municipios, universidades, festivales, residencias) | `data/calls/` | `buscar-convocatorias` |
| 6 | Historia de las artes escénicas de la región (alimenta Archivo, Editorial, Memoria y De Cuento en Cuento) | `data/archive/`, editorial | `buscar-archivo-teatral` |

Cada investigación produce registros con fuente, score y estado `pendiente`; la verificación es un paso aparte (`verificar-datos`, `auditar-fuente`).

## 10. Skills

| Skill | Qué hace |
|---|---|
| `buscar-companias-teatro` | Encuentra y documenta compañías |
| `buscar-artistas-escenicos` | Encuentra y documenta artistas por oficio |
| `buscar-cartelera` | Levanta funciones con fecha verificada |
| `buscar-festivales` | Documenta festivales y encuentros |
| `buscar-espacios-escenicos` | Documenta espacios |
| `buscar-convocatorias` | Documenta convocatorias con estado |
| `buscar-oficios-escenicos` | Reúne contenido por oficio |
| `buscar-archivo-teatral` | Levanta memoria y archivo |
| `verificar-datos` | Aplica criterios de verificación y score |
| `investigar-territorio` | Investiga una comuna completa |
| `investigar-de-cuento-en-cuento` | Completa datos de la serie desde los documentos del proyecto |
| `auditar-fuente` | Evalúa una fuente: nivel, vigencia, fiabilidad |
