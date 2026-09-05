# Arquitectura propuesta

Estado: **propuesta para revisión conceptual** (Ciclo 2). No se implementa hasta que el usuario la apruebe.

## 1. Decisiones de stack

| Capa | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|
| Framework | **Next.js 15, App Router, TypeScript, React 19** | URLs reales, SEO nativo (metadata, sitemap, OG), SSG + ISR para fichas, SSR para búsquedas, despliegue directo en Vercel que el usuario ya usa. El equipo ya escribe React. | Astro (excelente para contenido, pero las fichas dinámicas con revalidación y el panel de administración son más naturales en Next). SPA sin build (lo que tiene Aplauzo: sin SEO). |
| Base de datos | **Supabase: Postgres + PostGIS + Auth + Storage + RLS**, proyecto propio | Patrón de moderación ya probado en Aplauzo; PostGIS para consultas territoriales; Storage para imágenes con metadatos en tabla propia. | Base de datos en archivos (no escala a 1.000 registros con relaciones). CMS headless externo (más infraestructura; se reevalúa en Fase 8 si la editorial lo exige). |
| Estilos | **CSS Modules + tokens en variables CSS** (`--ink`, `--paper`, `--display`, `--text`, `--mono`, espaciado, radios) | Control fino de la estética editorial; mismo método de tokens que Aplauzo pero modular; sin framework que imponga apariencia. | Tailwind (válido; se descarta para mantener CSS legible por diseño editorial). |
| Mapa regional | **SVG con d3-geo + geometría oficial de comunas** para explorar región, provincia y comuna | Sin proveedor externo de tiles, estética controlada, rápido en móvil, accesible por teclado. | Solo tiles (poco editorial para el nivel región). |
| Mapa de detalle | **MapLibre GL JS o Leaflet con OpenStreetMap** en fichas con dirección verificada | Calles reales para llegar a un espacio. | Google Maps (licencia y coste). |
| Búsqueda | **Postgres full-text (`unaccent` + configuración `spanish`)** vía función RPC, más índice ligero en cliente para sugerencias instantáneas | Sin servicio externo; agrupación por tipo y filtros en SQL. | Algolia/Meilisearch (se reevalúa si supera ~10.000 registros). |
| Contenido editorial | Markdown en base de datos (`body_md`), editable desde el panel; importable desde `.md` | Editores no técnicos; versionable por exportación. | MDX en repositorio (obliga a deploy por artículo). |
| Panel de administración | **Ruta `/admin` en la propia app** con roles `admin`, `editor`, `verificador` | Un solo despliegue; RLS protege; mismo modelo de datos. | Directus/Payload (más infraestructura). |
| Analítica | **Plausible** (o Umami autoalojado) con eventos personalizados; GA4 opcional si el fondo lo pide | Sin cookies, ligero, eventos por territorio y clics externos. | Solo GA4. |
| Imágenes | `next/image` + Supabase Storage + tabla `media` con autor, licencia, crédito, fuente | Optimización automática y metadatos obligatorios. | |
| Validación de datos | JSON Schema (`data/schemas/`) + `zod` en la app + `scripts/validar_datos.py` | Un esquema, tres usos: formularios, importación, base de datos. | |
| Pruebas | Vitest (unidad), Playwright (e2e móvil y escritorio), axe (accesibilidad) | | |

## 2. Estructura de carpetas

```
escena-valparaiso/
├── CLAUDE.md
├── README.md
├── docs/
├── .claude/skills/
├── data/
│   ├── territories/            region.json · provincias.json · comunas.json
│   ├── schemas/                *.schema.json · vocabularios.json
│   ├── de-cuento-en-cuento/    serie.json · episodios.json · posta.json
│   ├── companies/ artists/ works/ venues/ events/ calls/ editorial/ archive/
│   └── research_queue.json
├── scripts/
│   ├── validar_datos.py        valida JSON contra esquemas y reglas de fuente
│   └── importar.py             (Fase 3) JSON/CSV/MD → Supabase
├── supabase/
│   ├── migrations/             SQL versionado
│   └── seed/                   carga inicial desde data/
├── src/
│   ├── app/                    rutas (App Router)
│   │   ├── (site)/             layout público
│   │   │   ├── page.tsx                      INICIO
│   │   │   ├── buscar/
│   │   │   ├── mapa/
│   │   │   ├── cartelera/
│   │   │   ├── companias/[slug]/
│   │   │   ├── artistas/[slug]/
│   │   │   ├── obras/[slug]/
│   │   │   ├── espacios/[slug]/
│   │   │   ├── territorios/[slug]/           provincia o comuna
│   │   │   ├── convocatorias/[slug]/
│   │   │   ├── editorial/[slug]/
│   │   │   ├── oficios/[slug]/
│   │   │   ├── formacion/[slug]/
│   │   │   ├── archivo/[slug]/
│   │   │   ├── de-cuento-en-cuento/          portada · episodios/[n] · la-posta · protagonistas
│   │   │   └── participa/                    ¿A quién deberíamos conocer en tu territorio?
│   │   ├── admin/              panel (protegido)
│   │   ├── api/                revalidación, búsqueda, sitemap dinámico
│   │   ├── sitemap.ts · robots.ts · opengraph-image.tsx
│   ├── components/
│   │   ├── ui/                 botones, chips, campos, tarjetas base
│   │   ├── layout/             Masthead, Footer, Breadcrumbs, SectionHead
│   │   ├── map/                RegionMap, ProvinceMap, DetailMap, MapLayers
│   │   ├── search/             SearchBox, SearchResults, Filters
│   │   ├── cards/              CompanyCard, ArtistCard, WorkCard, EventCard, VenueCard, CallCard, PostCard, EpisodeCard
│   │   ├── entity/             Ficha* (cabecera, metadatos, fuentes, "sigue explorando")
│   │   ├── dcc/                PostaTimeline, EpisodePlayer, ObjectGrid, MoliereStrip
│   │   ├── participate/        ProposalForm
│   │   └── verification/       SourceList, VerificationBadge
│   ├── lib/
│   │   ├── supabase/           clientes server/browser, tipos generados
│   │   ├── queries/            consultas por entidad
│   │   ├── search/             normalización, agrupación
│   │   ├── geo/                proyección, centroides, utilidades
│   │   ├── seo/                metadata y JSON-LD por tipo
│   │   ├── analytics/          eventos
│   │   └── schemas/            zod derivado de data/schemas
│   ├── styles/                 tokens.css · globals.css · tipografía
│   └── content/                textos de interfaz (es-CL)
├── public/
│   ├── geo/                    comunas.topo.json · provincias.topo.json (fuente oficial)
│   └── brand/
└── tests/
```

## 3. Navegación principal

```
ESCENA VALPARAÍSO
│
├── CARTELERA            /cartelera            hoy · semana · mes · comuna · provincia · disciplina · público
├── COMPAÑÍAS            /companias            listado + ficha
├── ARTISTAS             /artistas             listado + ficha
├── OBRAS                /obras                listado + ficha
├── TERRITORIOS          /territorios          8 provincias · 38 comunas
├── CONVOCATORIAS        /convocatorias        abiertas · próximas · cerradas · archivadas
├── EDITORIAL            /editorial            entrevistas, críticas, columnas, investigaciones...
├── OFICIOS              /oficios              17 oficios escénicos
├── FORMACIÓN            /formacion            talleres, escuelas, cursos, recursos
├── ARCHIVO              /archivo              memoria
└── DE CUENTO EN CUENTO  /de-cuento-en-cuento  serie original
     + transversales: /buscar · /mapa · /espacios · /participa
```

En móvil: barra superior con logotipo, buscar y menú. Menú a pantalla completa con las 11 secciones más "Mapa" y "Participa". Las secciones más usadas (Cartelera, Mapa, Buscar, De Cuento en Cuento) tienen acceso directo desde la portada.

## 4. Portada

Orden de bloques, con aire entre ellos (no veinte módulos):

1. **Hero** editorial con una fotografía y una frase.
2. **Buscador**.
3. **Qué está pasando** (cartelera próxima, 6 eventos).
4. **Conoce a quienes lo hacen** (compañías y artistas destacados, 6 fichas).
5. **Explora por territorio** (mapa regional reducido + 8 provincias).
6. **De Cuento en Cuento** (episodio actual + La Posta).
7. **Editorial** (3 publicaciones).
8. **Convocatorias abiertas** (3).
9. **Mapa** (acceso al mapa completo).
10. **Footer** con participación y créditos.

La portada orienta: *qué ver · a quién conocer · dónde ocurre · qué leer · qué oportunidades existen.*

## 5. Componentes

### Reutilizables desde Aplauzo (reescritos en TypeScript, misma idea)

| Origen en Aplauzo | Componente nuevo | Qué cambia |
|---|---|---|
| `Masthead` | `layout/Masthead` | Navegación con enlaces reales, menú móvil accesible, sin login visible para lectores |
| `Footer` | `layout/Footer` | Participa, créditos, política de datos |
| `SectionHero`, `sec-head` | `layout/SectionHead` | Igual patrón |
| `crumb` | `layout/Breadcrumbs` | Con JSON-LD `BreadcrumbList` |
| `SoonNote` | `ui/EmptyState` | Estado vacío con llamada a participar |
| `Avatar` | `ui/Avatar` | Fallback cuando no hay retrato con licencia |
| `DemoTag` | `verification/VerificationBadge` | Muestra estado y fecha de verificación, no "muestra" |
| `SearchOverlay` + `buildSearchIndex` | `search/*` | Resultados agrupados por tipo, filtros, URL `/buscar?q=` |
| `AplauzoMap` | `map/RegionMap` | Geometría de comunas, capas, puntos, zoom, táctil |
| `SUB_FIELDS` + `SubmitModal` | `participate/ProposalForm` | Generado desde esquema JSON; sin login obligatorio para proponer |
| `AdminPanel` + `SubmissionCard` | `admin/*` | Revisión de propuestas, edición de fichas, verificación de fuentes |
| `LoginModal`, `useAuth`, `SA_authError` | `admin/auth` | Solo para el equipo |
| `WorkView` | `entity/FichaObra` | Con relaciones reales |
| `CountryTabs`, chips de filtro | `ui/Chips`, `search/Filters` | |

### Nuevos

`map/ProvinceMap`, `map/DetailMap`, `map/MapLayers`; `entity/FichaCompania`, `FichaArtista`, `FichaEspacio`, `FichaTerritorio`, `FichaConvocatoria`, `FichaOficio`, `FichaFormacion`, `FichaArchivo`; `entity/SigueExplorando`; `verification/SourceList`; `cards/*` (8 tipos); `dcc/PostaTimeline`, `dcc/EpisodePlayer` (YouTube embebido con subtítulos, transcripción, audio), `dcc/ObjectGrid`, `dcc/MoliereStrip`, `dcc/Protagonistas`; `cartelera/Calendar`, `cartelera/EventList`; `ui/ImageWithCredit`; `ui/ExternalLink` (con evento de analítica).

## 6. Flujos principales

**Descubrimiento (circuito De Cuento en Cuento):** episodio → protagonista → ficha → obra/compañía → otras compañías de la comuna → cartelera de la provincia → otro episodio → otra provincia. Cada ficha termina con "Sigue explorando" (otros artistas, compañías, obras, actividades y contenidos de la misma provincia).

**Participación:** `/participa` → formulario (propuesta, comuna, provincia, categoría, nombre, contacto opcional, fuente, autorización) → tabla `contributions` con `status = pending` → revisión en `/admin` → investigación con skill → creación o actualización de entidad con fuentes → publicación.

**Verificación:** toda entidad nace `pendiente` con `confidence_score`; el verificador revisa fuentes, sube el score, marca `verificado`, fija `verified_at` y `next_review_at`. Ver `CRITERIOS_VERIFICACION.md`.

**Publicación e ISR:** al cambiar una entidad verificada, el panel llama a `/api/revalidate` con su ruta y las rutas relacionadas (territorio, listados, sitemap).

## 7. Renderizado y rendimiento

- Fichas y territorios: estáticos con ISR (revalidación bajo demanda).
- Cartelera, búsqueda, convocatorias abiertas: SSR con caché corta.
- Portada: estática, revalidada cada hora y bajo demanda.
- Presupuesto: LCP < 2,5 s en 4G; JS de la portada < 150 kB; fuentes locales (`next/font`) con `font-display: swap`.

## 8. Analítica (eventos)

`page_view`, `search` (consulta, filtros, resultados), `territory_view` (provincia/comuna), `company_view`, `artist_view`, `work_view`, `event_view`, `dcc_episode_view`, `dcc_click_out` (de un episodio a una ficha), `external_click` (sitio web, entradas), `social_click` (red), `map_layer_toggle`, `proposal_submitted`, `call_click`. Con dimensión `territory` en todos. Entradas desde Google se leen desde Search Console.

## 9. Extensibilidad

- `regions` es una tabla: `valparaiso` es la primera. Todo territorio y toda entidad cuelgan de una región. Otra edición de De Cuento en Cuento (`series`) o otra región se agregan sin cambiar el modelo.
- Los vocabularios (disciplinas, tipos de espacio, tipos de convocatoria, oficios) son datos, no código.

## 10. Seguridad y datos

- RLS en todas las tablas; lectura pública solo de lo `verificado` y `published = true`.
- Roles en `profiles.role`; sin correos hardcodeados.
- Storage: bucket público `media` para imágenes publicadas, bucket privado `contributions` para adjuntos de propuestas.
- Ningún dato personal sensible (RUT, dirección particular, teléfono personal) en la base de datos.
