# Auditoría técnica de APLAUZO

**Proyecto auditado:** Aplauzo (aplauzo.art), plataforma de artes escénicas iberoamericanas.
**Fecha:** 5 de septiembre de 2026.
**Objetivo:** decidir qué se reutiliza, qué se rehace y qué no se copia al construir ESCENA VALPARAÍSO.
**Método:** lectura completa del código, sin suposiciones de stack. No se modificó ningún archivo de Aplauzo.

## 1. Qué se inspeccionó

Existen dos copias del proyecto en el workspace del usuario:

| Copia | Ruta | Estado |
|---|---|---|
| Repositorio de producción | `~/Documents/WebAplauzo` | Git, remoto `github.com/sebachamorror/aplauzo1`, desplegado en Vercel como aplauzo.art. Es la versión más reciente (6 de julio de 2026). |
| Workspace de trabajo | `~/Documents/Aplauzo` | Sin Git. Contiene `supabase/schema.sql` y `CONFIGURAR.md`, que **no** están en el repositorio. `app.jsx` está una versión atrás (1.174 líneas frente a 1.299). |

La auditoría toma `WebAplauzo` como fuente canónica del código y el workspace como fuente del esquema de base de datos y la guía de configuración.

Archivos leídos: `index.html`, `src/app.jsx`, `src/map.jsx`, `src/search-auth.jsx`, `src/submit.jsx`, `src/admin.jsx`, `src/supabase.js`, `src/live-data.js`, `src/data.js`, `src/data-sections.js`, `src/data-paises.js` (cabecera), `src/tweaks-panel.jsx` (cabecera), `image-slot.js` (cabecera), `contenido/_generar.py`, `supabase/schema.sql`, `CONFIGURAR.md`, `PROGRESO.md`, `CLAUDE.md` (copia en `Web /Aplauzo/`), historial Git.

## 2. Stack detectado

| Capa | Tecnología | Cómo se cargó | Observación |
|---|---|---|---|
| UI | React 18.3.1 + ReactDOM (UMD) | `<script>` desde unpkg, con SRI | Build de desarrollo, no de producción. |
| JSX | @babel/standalone 7.29.0 | `<script type="text/babel">` | El navegador transpila cada visita. |
| Mapa | d3 v7 + topojson-client v3 | jsDelivr, versión flotante | Atlas `world-atlas@2/countries-110m.json` por `fetch`. |
| Backend | Supabase (Postgres + Auth + Storage) | `@supabase/supabase-js@2` por CDN, versión flotante | Proyecto `vffnesaxdapfancnnyln`, clave anon en el código (correcto por diseño de Supabase; la seguridad está en RLS). |
| Tipografía | Google Fonts | Cormorant Garamond, EB Garamond, Playfair Display, IBM Plex Mono | |
| Imágenes | `image-slot.js` (web component) | Local | Depende de un runtime propietario ("omelette"); en producción es solo lectura. |
| Formularios legacy | FormSubmit | `formsubmit.co/ajax/<correo>` | Solo en `JoinModal`, ya no enlazado desde la UI. |
| Contenido por país | Python 3, stdlib | `contenido/_generar.py` | Genera `src/data-paises.js` y un `.docx` por país. |
| Despliegue | Vercel (estático) desde GitHub | `index.html` como entrada | Sin `vercel.json`, sin cabeceras, sin redirecciones. |

**No existe:** `package.json`, gestor de paquetes, bundler, TypeScript, linter, tests, CI, variables de entorno, `.env`. Lenguaje: JavaScript (JSX) sin tipos, CSS plano, SQL, Python.

## 3. Arquitectura

- **SPA de un solo documento.** `index.html` contiene todo el CSS (líneas 10-713, unos 700 selectores) y carga los scripts en orden estricto: librerías → datos (`data.js`, `data-sections.js`, `data-paises.js`) → `supabase.js` → `live-data.js` → componentes (`tweaks-panel`, `search-auth`, `submit`, `admin`, `map`) → `app.jsx`.
- **Estado global en `window.APLAUZO`.** Un único objeto con todo el contenido. Los componentes leen `const D = window.APLAUZO`.
- **Componentes expuestos en `window`.** Cada archivo hace `Object.assign(window, {...})` o `window.X = X`; no hay módulos ES ni imports.
- **Arranque.** `app.jsx` espera `window.APLAUZO_READY` (promesa de `live-data.js` que fusiona envíos aprobados desde Supabase) con un tope de 4 segundos y luego monta `<App />`.
- **Sin capa de servicios.** Las vistas llaman a Supabase directamente (`window.SB.from(...)`).

## 4. Sistema de componentes

No hay sistema de diseño ni biblioteca; hay funciones React globales con clases CSS por prefijo (`.mast-*`, `.ct-*`, `.wd-*`, `.hub-*`, `.adm-*`, etc.).

Inventario (todos en `app.jsx` salvo indicación):

| Grupo | Componentes |
|---|---|
| Estructura | `Masthead`, `Footer`, `SectionHero`, `CountryTabs`, `HubList` |
| Vistas | `Home`, `CountryView`, `CountryHub`, `WorkView`, `OpinionHome`, `OpinionArticle`, `SpacesHome`, `ShopHome`, `TalleresHome`, `TrabajoHome`, `FondosHome`, `PoliticasHome`, `DirectorioHome`, `LegalHome` + `Scheduler` |
| Utilidades | `Placeholder`, `Slot` (envuelve `<image-slot>`), `DemoTag`, `Avatar` (silueta SVG), `SoonNote` (estado vacío editorial), `visibleCountries()` |
| Búsqueda y sesión (`search-auth.jsx`) | `buildSearchIndex`, `SearchOverlay`, `LoginModal`, `useAuth`, `JoinModal`, `SA_norm`, `SA_authError` |
| Participación (`submit.jsx`, `admin.jsx`) | `SUB_FIELDS` (esquema declarativo de campos por tipo), `SubmitModal`, `PublishButton`, `AdminPanel`, `SubmissionCard`, `MySubmissions` |
| Mapa (`map.jsx`) | `AplauzoMap` |
| Prototipado (`tweaks-panel.jsx`) | `TweaksPanel`, `useTweaks`, `TweakRadio`, `TweakSelect`... |

## 5. Sistema de rutas

- **No hay router ni URLs.** La navegación es un objeto de estado `view` (`{name, engName, workId}`) dentro de `App`; cada vista es una rama condicional.
- La única ruta con hash es `#/admin` (intranet de moderación).
- Consecuencias: recargar devuelve a la portada; no se puede enlazar ni compartir una ficha; el botón "atrás" del navegador no funciona; los buscadores no ven páginas internas.

## 6. Arquitectura de datos

- **Colecciones** (por país, clave en inglés según world-atlas): `IBERO` (22 países), `countries[eng].works`, `opinion`, `spaces`, `talleres`, `jobs`, `funds`, `policies`, `lawyers`, `directory`, `shop`.
- **Registros como objetos planos con strings libres.** Una obra tiene `company: "De David Mamet"`, `venue`, `theater`, `city`, `dates: "28 may – 7 jun 2026 · ju a sá 19:30"`. No hay claves foráneas: obra, compañía, espacio y ciudad no están relacionados; no hay fechas máquina.
- **Flag de contenido de muestra.** `config.showDemoContent` y `filterDemo()` ocultan registros con `demo: true`. 629 registros de 19 países son inventados o "best-effort" sin verificar; solo Chile, 9 espacios, fondos y políticas se consideran reales.
- **Pipeline de contenido.** `contenido/<País>/datos.json` → `_generar.py` → `src/data-paises.js` (con `demo: true` forzado) + `.docx`.
- **Envíos de la comunidad.** Tabla `public.submissions` (`type`, `status`, `country`, `author_id`, `payload jsonb`, `images jsonb`, `admin_note`). Lo aprobado se fusiona en memoria al cargar (`live-data.js`), nunca se edita después.
- **Fuentes.** Ningún registro guarda fuente, URL de origen, fecha de consulta ni estado de verificación. Solo `funds` y `policies` llevan `url`.

## 7. Cómo se implementa el mapa

`AplauzoMap` (`src/map.jsx`, 93 líneas):
1. `fetch` del atlas mundial 110m desde jsDelivr (o `window.__resources.worldAtlas` en la copia offline).
2. `d3.geoMercator().center([-38, -2]).scale(178)` sobre un SVG `viewBox 1100×680`.
3. Un `path` por país con tres clases: `dim` (resto del mundo, sin eventos), `ibero` (clicable), `ibero active` (con obras).
4. Tooltip HTML posicionado con `mousemove`; clic llama `onSelect(engName)`.

Límites: nivel país únicamente; sin zoom, sin capas, sin puntos, sin subdivisiones, sin soporte táctil pensado (el tooltip depende de `mousemove`), sin leyenda dinámica, sin accesibilidad (paths sin `role`, sin navegación por teclado).

## 8. Cómo se implementa el buscador

`buildSearchIndex()` recorre todas las colecciones y produce `{title, subtitle, section, nav}`. `SearchOverlay` normaliza (minúsculas, sin diacríticos vía NFD), separa tokens, exige que todos aparezcan en `title+subtitle+section`, puntúa 2 si el título contiene la consulta completa, corta a 24 resultados y permite teclado (↑ ↓ Enter Esc).

Límites: índice en memoria construido en cada apertura; sin filtros, sin facetas, sin agrupación real por tipo (muestra la sección como etiqueta), sin sinónimos, sin URL de resultados, sin analítica de búsquedas.

## 9. Cómo se crean las fichas

- Solo la **obra** tiene ficha completa (`WorkView`): imagen sticky, disciplina, título, compañía, resumen, `<dl>` de metadatos, descripción en párrafos (`\n\n`), botones a `companyUrl` e Instagram, y "También en <país>".
- Espacios, talleres, perfiles, fondos y leyes se muestran como **tarjetas** sin página propia.
- No existen fichas de compañía, artista ni territorio.
- Los campos se muestran tal como vienen (sin validación de URL, sin formateo de fechas).

## 10. Cómo se cargan las imágenes

Dos mecanismos:
1. **`<image-slot>`** para las fotos de portada/obras: arrastrar una imagen la persiste en `.image-slots.state.json` (1,1 MB) mediante un runtime de prototipado; fuera de ese runtime es solo lectura. No apto para producción.
2. **Supabase Storage** para envíos de la comunidad: bucket público `uploads`, ruta `submissions/{uid}/{uuid}-{nombre}`, hasta 6 archivos (imágenes o PDF), URL pública guardada en `submissions.images`.

No se guarda autor, licencia, crédito ni fecha de ninguna imagen. No hay redimensionado ni formatos modernos. Las personas se muestran con `Avatar` (silueta SVG) por decisión de licencias.

## 11. Cómo se administran categorías

No hay taxonomía central. Las disciplinas son strings libres e inconsistentes ("Teatro", "Teatro familiar", "Comedia", "Actuación", "Clown"). Las opciones de los `select` viven dentro de `SUB_FIELDS` en `submit.jsx`. Las secciones del sitio están en el array `SECTIONS` de `app.jsx`. Los tipos publicables están en `window.APLAUZO_TYPES` (`obra`, `taller`, `espacio`, `trabajo`, `directorio`).

## 12. Cómo se generan URLs

No se generan. Los registros tienen `id` con prefijo (`cl-`, `sp-`, `tl-`, `jb-`, `fd-`...) usados como clave de React y de `<image-slot>`, no como slug público.

## 13. SEO

Inexistente por diseño técnico:
- Un solo `<title>` ("Aplauzo · Cartelera Iberoamericana"); sin `meta description`, Open Graph, Twitter Cards, `canonical`, Schema.org, `sitemap.xml` ni `robots.txt`.
- Todo el HTML se genera en el cliente tras transpilar JSX con Babel; un rastreador recibe `<div id="root"></div>`.
- Sin URLs internas, no hay nada que indexar aunque se renderizara.

## 14. Responsive

- CSS con `clamp()` y dos breakpoints (`max-width: 1000px` y `680px`). Menú colapsa a botón "Índice"; grillas pasan a 1-2 columnas; el detalle de obra se apila.
- Enfoque desktop-first. El mapa escala por `viewBox` pero la interacción es de ratón. Modales con `max-height` y scroll interno. Sin `prefers-reduced-motion`, sin modo oscuro.

## 15. Autenticación y CMS

- **Auth:** Supabase Auth con correo y contraseña (`signUp`, `signInWithPassword`, `onAuthStateChange`). Sin OAuth, sin recuperación de contraseña en la UI.
- **Rol de administrador:** un correo fijo escrito en dos lugares que deben coincidir: `public.is_admin()` en SQL y `APLAUZO_ADMINS` en `supabase.js`.
- **Moderación:** `#/admin` con pestañas pendientes/aprobados/rechazados, aprobar o rechazar con nota. RLS garantiza que solo el admin actualiza y que todo INSERT nace `pending`.
- **No hay CMS** para el contenido semilla: obras, espacios, opinión y demás viven en archivos JS y se editan a mano o por el script Python. Lo aprobado tampoco puede editarse después.

## 16. APIs y servicios externos

unpkg, jsDelivr (d3, topojson, supabase-js, world-atlas), Google Fonts, Supabase, FormSubmit, Vercel, GitHub. Sin claves privadas en el código; sin `.env`.

## 17. Dependencias

| Dependencia | Versión | Fijada | Riesgo |
|---|---|---|---|
| react, react-dom | 18.3.1 | Sí, con SRI | Build de desarrollo en producción (más pesado y con warnings). |
| @babel/standalone | 7.29.0 | Sí, con SRI | Transpilar en el navegador penaliza tiempo de carga y SEO. |
| d3 | `@7` | No | Puede cambiar sin aviso. |
| topojson-client | `@3` | No | Ídem. |
| @supabase/supabase-js | `@2` | No | Ídem; sin SRI. |
| world-atlas | `@2` | No | Ídem. |

## 18. Funcionalidades presentes

Cartelera por país, ficha de obra, hub de país, opinión (22 columnas), espacios, talleres, bolsa de trabajo (ficticia), central de fondos (real), políticas culturales (real), directorio del equipo, centro legal con agendamiento simulado (ficticio), tienda (sin pasarela), búsqueda global, login, publicar contenido con moderación, "mis envíos", intranet de moderación, panel de ajustes visuales.

## 19. Riesgos detectados

1. **Contenido inventado mezclado con real** en el mismo repositorio; depende de un flag global para no publicarse.
2. **Sin URLs ni SEO:** invisible para buscadores y no compartible.
3. **Rendimiento:** Babel + React de desarrollo + 10.810 líneas de datos cargadas en cada visita.
4. **Deriva entre copias:** el workspace y el repositorio difieren; `schema.sql` no está versionado en Git.
5. **Admin por correo hardcodeado** en dos lugares.
6. **Versiones flotantes** de librerías por CDN.
7. **Sin metadatos de imagen** (autor, licencia), contrario a la política que ESCENA VALPARAÍSO exige.
8. **`dangerouslySetInnerHTML`** en titulares y kickers de opinión.
9. **Copias derivadas desactualizadas** (`Aplauzo (offline).html`, `Aplauzo-print.html`).
10. **Sin tests ni tipos:** cualquier refactor es a ciegas.

## 20. Qué se puede reutilizar técnicamente (adaptado, no copiado)

| Pieza | Qué se conserva | Cómo se adapta |
|---|---|---|
| Patrón de moderación en Supabase (`schema.sql`) | Flujo `pending → approved/rejected`, RLS que fuerza `author_id` y `pending`, política de Storage por carpeta de usuario | Se reescribe con entidades tipadas, tabla de contribuciones ciudadanas, roles en tabla y campos de verificación. |
| Esquema declarativo de formularios (`SUB_FIELDS`) | La idea: un esquema por tipo alimenta formulario, vista previa y validación | Se convierte en esquemas JSON compartidos entre formularios, importadores y base de datos (`data/schemas/`). |
| Búsqueda normalizada (`SA_norm`, tokens AND, prioridad al título) | Lógica de normalización sin diacríticos | Pasa a índice construido en build o a Postgres FTS con `unaccent`; resultados agrupados por tipo y con URL. |
| Mapa d3 + topojson | Proyección, `path` por unidad, clases de estado, tooltip | Se cambia el atlas por comunas y provincias de la región, se añade zoom, puntos, capas, soporte táctil y teclado. |
| `SoonNote` y estados vacíos editoriales | Tono: una sección vacía nunca queda muda | Mismo principio, componente nuevo. |
| Tokens CSS (`--paper/--ink/--display/--text/--mono`) | El método de variables y prefijos por bloque | Valores nuevos (identidad propia), CSS modular. |
| `Avatar` de silueta | Solución a la falta de retratos con licencia | Se mantiene como fallback. |
| Mensajes de error de Auth en español (`SA_authError`) | Textos | Se reutilizan. |
| `CONFIGURAR.md` y `PROGRESO.md` | Formato de guía operativa y bitácora | Mismo formato. |
| Pipeline JSON → generador (`_generar.py`) | Separar fuente editable de artefacto generado | Se transforma en importadores JSON/CSV/Markdown con validación y fuentes. |

## 21. Qué NO se debe copiar

- **Identidad visual completa:** paleta papel/tinta, familias tipográficas, lema "cartelera iberoamericana", mascota gato, panel de tweaks.
- **Contenido:** obras, columnas de opinión, textos de hero, espacios, talleres, fondos de otros países.
- **Mapa mundial** y la clave por país en inglés.
- **Datos de muestra** (`demo: true`) y el flag `showDemoContent`: en ESCENA VALPARAÍSO no existe contenido inventado; existe contenido con estado de verificación.
- **`image-slot.js`** y `.image-slots.state.json` (dependen de un runtime de prototipado).
- **`tweaks-panel.jsx`**.
- **Tienda, Centro legal con agendamiento simulado, Bolsa de trabajo ficticia, JoinModal por FormSubmit.**
- **Babel en el navegador, React UMD, navegación por estado sin URLs, CSS monolítico en el HTML.**
- **Admin por correo fijo** y las credenciales del proyecto Supabase de Aplauzo (ESCENA VALPARAÍSO usa un proyecto propio).

## 22. Qué conviene refactorizar antes de reutilizar

1. `schema.sql`: de una tabla genérica `submissions` con `payload jsonb` a tablas por entidad, más `contributions` (propuestas ciudadanas) y `sources` (fuentes y verificación). Roles en tabla `profiles.role`, no en función con correos.
2. `SUB_FIELDS`: a esquemas JSON únicos por entidad (`data/schemas/*.schema.json`) que sirvan a formulario, importador, validador y documentación.
3. `buildSearchIndex`: a índice con tipo, territorio, disciplina y URL; agrupación y filtros.
4. `map.jsx`: a componente con proyección regional, capas, puntos con coordenadas verificadas, zoom por provincia y comuna, y eventos táctiles.
5. `live-data.js`: desaparece; todo el contenido vive en la base de datos con estado de verificación.
6. `filterDemo`: se reemplaza por `verification_status` y `confidence_score`.

## 23. Recomendaciones

1. **Stack con build y URLs reales:** Next.js (App Router, TypeScript) desplegado en Vercel, con generación estática e ISR para fichas y SSR para búsquedas y cartelera. Resuelve SEO, rendimiento y rutas semánticas de una vez.
2. **Supabase propio para ESCENA VALPARAÍSO:** Postgres con PostGIS, Auth, Storage y RLS. Reutilizar el patrón de moderación, no el esquema.
3. **Modelo relacional con territorio y verificación como columnas de primera clase** (ver `MODELO_DATOS.md`).
4. **Mapa regional propio** con geometría oficial de comunas (ver `MAPA.md`).
5. **Esquemas JSON compartidos** para formularios, importación e investigación.
6. **Ningún contenido sin fuente.** Reemplazar el concepto "demo" por "pendiente de verificación", nunca publicado.
7. **Panel de administración** propio (roles admin, editor, verificador) antes que un CMS externo; evaluar CMS headless solo si el volumen editorial lo exige.
8. **Analítica con eventos** desde el día uno (ver `ARQUITECTURA.md`).

Esta auditoría se considera cerrada. La construcción de ESCENA VALPARAÍSO no altera ningún archivo de Aplauzo.
