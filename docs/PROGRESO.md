# PROGRESO — QUINTA ESCENA

Bitácora por fase. Cada entrada: qué se hizo, qué falta, riesgos, decisiones, próximos pasos.

---

## Fase 1 — Arquitectura y auditoría · sesión 2026-09-05

### Qué se hizo

**Auditoría de Aplauzo** (`docs/AUDITORIA_APLAUZO.md`): lectura completa del repositorio de producción (`~/Documents/WebAplauzo`) y del workspace (`~/Documents/Aplauzo`), sin modificar nada. Stack detectado: React 18 UMD + Babel en el navegador, sin build; datos en `window.APLAUZO`; navegación por estado sin URLs; mapa mundial d3 + topojson; buscador en memoria; Supabase para envíos con moderación (esquema solo en el workspace, no versionado); SEO inexistente. Se listó qué reutilizar (patrón de moderación, esquema declarativo de formularios, normalización de búsqueda, enfoque d3 del mapa, estados vacíos, tokens CSS), qué no copiar (identidad, contenido, mapa mundial, datos demo, image-slot, tweaks, admin por correo fijo, Babel en el navegador) y qué refactorizar.

**Carpeta nueva** `~/Documents/quinta-escena/`, hermana de Aplauzo y WebAplauzo, con: `CLAUDE.md`, `README.md`, `docs/` (SOUL, ARQUITECTURA, MODELO_DATOS, MAPA, EDITORIAL, QUINTA_ESCENA_PODCAST, INVESTIGACION, CRITERIOS_VERIFICACION, SEO, ROADMAP, este archivo), `.claude/skills/` (12 skills), `data/` (esquemas, vocabularios, territorios, serie, protagonistas, compañías, obras, cola), `scripts/validar_datos.py`, `public/geo/FUENTES.md`, `src/README.md` (vacío a propósito), `.gitignore`, `.editorconfig`.

**Arquitectura propuesta**: Next.js 15 (App Router, TypeScript) en Vercel; Supabase propio (Postgres + PostGIS + Auth + Storage + RLS); CSS Modules con tokens; mapa regional SVG (d3-geo + geometría oficial de comunas) y mapa de detalle con OpenStreetMap; búsqueda con Postgres full-text; panel `/admin` con roles; analítica con eventos (Plausible). Estructura de carpetas, navegación de 11 secciones, portada de 10 bloques, componentes reutilizables y nuevos, flujos de descubrimiento, participación y verificación.

**Modelo de datos**: territorio y verificación como columnas de primera clase; entidades company, artist, work, event/occurrence, venue/place, call, post, craft, training, archive_item, series/episode/posta; media con crédito y licencia; sources y entity_sources; relaciones polimórficas; contributions y research_tasks; RLS; búsqueda; mapeo con `data/`.

**Sistema territorial**: 8 provincias y 38 comunas verificadas con la Biblioteca del Congreso Nacional; códigos únicos territoriales (región 05, provincias 051–058, 38 comunas) verificados con el documento oficial de SUBDERE. Isla de Pascua y Juan Fernández incluidas como territorios insulares.

**Quinta Escena Podcast**: serie, 7 episodios y 7 entregas de La Posta según `ruta.py` y la propuesta vigente; 7 protagonistas, 6 agrupaciones y 4 obras con fuentes y estado `pendiente`; sin RUT ni datos personales. Discrepancias registradas (28 objetos del brief frente a 7 de la propuesta; lengua de señas en 4 o 7 capítulos).

**Skills**: buscar-companias-teatro, buscar-artistas-escenicos, buscar-cartelera, buscar-festivales, buscar-espacios-escenicos, buscar-convocatorias, buscar-oficios-escenicos, buscar-archivo-teatral, verificar-datos, investigar-territorio, investigar-quinta-escena-podcast, auditar-fuente.

**Cola de investigación**: 112 tareas (17 en curso, 95 pendientes): protagonistas, agrupaciones, compañías candidatas del catálogo oficial de títeres 2025 y del levantamiento interno, artistas mencionados, espacios y organizaciones, festivales, convocatorias, fuentes a auditar y las 38 comunas (prioridad alta en Los Andes, San Felipe de Aconcagua, Petorca y Quillota).

**Validación**: `python3 scripts/validar_datos.py` → 0 errores, 0 avisos.

### Qué falta

- Revisión conceptual del usuario sobre arquitectura, modelo de datos y mapa (Ciclo 3) antes de crear `src/`.
- Texto de presentación definitivo (se revisa al cerrar Fase 2).
- Localizar las URL de las fuentes públicas citadas en la investigación madre (SIGPA, Fondos de Cultura, prensa) para subir los scores de 55–65 a ≥ 70.
- Validar cada ficha con la persona protagonista (compromiso de la propuesta).
- Centroides y geometría oficial de comunas (Fase 4).
- Capitales provinciales desde fuente oficial.

### Riesgos

- Los perfiles de la serie dependen de documentos internos: sin URLs públicas registradas no alcanzan el umbral de publicación.
- El brief y la propuesta difieren en el número de objetos (28 / 7): se necesita la decisión del usuario.
- Cuatro provincias interiores no tienen compañías documentadas en las fuentes revisadas: la investigación territorial debe ir a buscar (municipios, teatros municipales, Fondos de Cultura, DAEM).
- Isla de Pascua y Juan Fernández exigen tratamiento propio (insets del mapa, investigación remota).

### Decisiones

- Carpeta hermana, no subcarpeta de Aplauzo, para que evolucione de forma independiente.
- Next.js + Supabase en vez de SPA sin build o de Astro, por SEO, ISR y panel de administración en un solo despliegue.
- Sin contenido "demo": solo estados de verificación; nada se publica bajo 70.
- Datos de la serie: mandan las cartas y `ruta.py`; la carpeta `_archivo` del proyecto no se usa como fuente.
- Sin RUT, direcciones de sedes, teléfonos ni correos personales en la plataforma.

### Próximos pasos

1. Usuario revisa `docs/ARQUITECTURA.md`, `docs/MODELO_DATOS.md`, `docs/MAPA.md` y decide sobre las discrepancias de `docs/QUINTA_ESCENA_PODCAST.md` §9.
2. Fase 2: diseño visual (identidad propia + relación con la de Quinta Escena Podcast).
3. Fase 3: proyecto Supabase, migraciones, importador.
4. En paralelo: correr `investigar-quinta-escena-podcast` para registrar URLs de fuentes y `investigar-territorio` en las provincias interiores.

---

## Fases 2, 4, 5, 6, 9 y 10 (parcial) — construcción inicial de la aplicación · sesión 2026-09-05

### Contexto

El usuario revisó la Fase 1 y, ante la pregunta de si podía ver la página, respondió "sí, aprobado y construye". Eso saltó el hito de mockups separados de la Fase 2 (`docs/ROADMAP.md`: "Aprobación del usuario sobre mockups") y el orden estricto de fases: se construyó la aplicación directamente en código, con la identidad visual definida en los mismos componentes. Se documenta aquí como decisión explícita, no como omisión silenciosa (regla 9 de `CLAUDE.md`).

### Qué se hizo

**Proyecto Next.js** (`package.json`, `tsconfig.json`, `next.config.ts`, `.env.example`, `vitest.config.ts`): Next 15, React 19, TypeScript estricto, App Router. Sin Supabase: toda la app lee `data/` en el servidor con `fs` (`src/lib/data/load.ts`), cacheado por request con `React.cache`.

**Capa de datos** (`src/lib/data/`, `src/lib/queries/`): tipos espejo de `data/schemas/`; `visibility.ts` implementa el umbral de publicación (`published && verificado && score ≥ 70`) y un modo previsualización (activo por defecto fuera de producción) que muestra fichas `pendiente` con aviso «en verificación», nunca indexable (`isIndexable` exige publicable). Consultas por comuna, provincia, compañía, artista, obra y episodio; conteos por territorio.

**Sistema visual** (`src/styles/tokens.css`, `globals.css`): paleta papel/tinta con un acento mar y uno cerro; tipografía de sistema (serif de despliegue, sans de texto, mono para metadatos); Quinta Escena Podcast conserva su coral, amarillo y crema (`docs/QUINTA_ESCENA_PODCAST.md` §11) en franjas propias. Mobile first: navegación con menú de pantalla completa bajo 1180px, rejillas fluidas, mapa táctil.

**Páginas** (`src/app/`): portada (10 bloques), `/buscar` (índice en memoria con tokenización sin acentos, agrupado por tipo), `/mapa`, `/territorios` con provincia y comuna, `/companias`, `/artistas`, `/obras` con listado y ficha, `/oficios` (17 oficios, perfiles reales por oficio), `/quinta-escena-podcast` con episodios, La Posta y protagonistas, `/cartelera`, `/convocatorias`, `/editorial`, `/formacion`, `/archivo`, `/espacios` con estado vacío honesto y llamada a proponer, `/participa` (formulario sin login, con `POST /api/participa`), `/datos` (política de verificación pública), `sitemap.xml` (solo fichas publicables), `robots.txt`, imagen Open Graph generada. Cada ficha muestra `VerificationBadge`, `SourceList` con nivel y fecha de consulta, y "Sigue explorando" (misma provincia). JSON-LD por tipo de página.

**Mapa regional** (`src/components/map/RegionMap.tsx`, `src/lib/geo/load.ts`): se descargó la División Político Administrativa 2023 (SUBDERE/IDE Chile, autorizada por Resolución DIFROL N.º 87 de 2023) y se procesó con `mapshaper` a `public/geo/valparaiso.topo.json` (~46 KB): 38 comunas, 7 provincias continentales disueltas, Isla de Pascua y Juan Fernández en capas propias. Documentado en `public/geo/FUENTES.md` con fuente, licencia y pasos de procesamiento, como exige `docs/MAPA.md`. Renderizado en servidor con `d3-geo` (`geoMercator` + `geoPath`), sin JavaScript para el primer pintado; cada comuna es un `<a>` enfocable con nombre accesible y conteo. Vista regional con recuadros insulares; vista de provincia enfocada, incluida Isla de Pascua (la isla pasa a ser el contenido principal cuando la provincia no tiene comunas continentales) y Valparaíso (Juan Fernández como recuadro dentro de su propia provincia). Se aprovechó el procesamiento para calcular y registrar en `data/territories/comunas.json` un punto interior (no el centroide geométrico exacto) por cada una de las 38 comunas, con su fuente, completando el dato que estaba en `null`.

**Pruebas**: 13 pruebas unitarias con Vitest (`tests/unit/`) sobre el buscador, los formatos en español y la integridad de los datos (referencias cruzadas, nada publicado sin verificación). `python3 scripts/validar_datos.py` sigue en 0 errores, 0 avisos tras el cambio de centroides.

**Verificación manual**: build de producción limpio (96 rutas, SSG donde corresponde); recorrido con Playwright de las 33 rutas en móvil (390 px) y escritorio (1280 px) sin errores de consola ni de página, salvo el 404 esperado en una ruta inexistente. Se encontró y corrigió en el camino un error real: `RegionMap` rompía (`NaN` en los `path`) al enfocar una provincia sin comunas continentales (Isla de Pascua) o al omitir Juan Fernández del mapa de la Provincia de Valparaíso; ambos casos quedaron cubiertos.

### Qué falta

- Supabase (Fase 3): sin base de datos, RLS, panel `/admin` ni importador. El formulario de `/participa` responde con honestidad que el envío se activa al conectar la base.
- Contenido real: cartelera, convocatorias, editorial, formación, archivo y espacios siguen vacíos (no hay `data/venues|events|calls|editorial|archive`); las fichas de los siete protagonistas siguen `pendiente` (validación con cada persona, fuera del código).
- Mapa: faltan las capas 1, 3, 4 y 6 (sin datos aún) y el mapa de detalle con OpenStreetMap para direcciones verificadas.
- Diseño: no hubo mockups ni aprobación visual separada; la identidad se definió directamente en código. El texto de presentación de la portada sigue provisional.
- Accesibilidad y SEO: falta auditoría con `axe` y revisión formal de Core Web Vitals (Fases 12 y 13); lo construido sigue las pautas de `docs/SEO.md` y `docs/MAPA.md` §7 pero no se midió.

### Riesgos

- Al no haber Supabase, cualquier cambio a `data/*.json` requiere una nueva build para reflejarse (no hay revalidación bajo demanda todavía).
- El estado de previsualización (`ESCENA_PREVIEW`) muestra fichas `pendiente` por defecto fuera de producción; hay que fijarlo explícitamente en el despliegue de producción para no publicar por accidente contenido no verificado.
- La geometría oficial (DPA 2023) trae la leyenda obligatoria de DIFROL en el pie del mapa; cualquier uso fuera de este contexto editorial debe revisarse con DIFROL (ver `public/geo/FUENTES.md`).

### Decisiones

- Construir directamente en código ante la instrucción explícita del usuario, documentando la omisión del hito de mockups en vez de detenerse a pedir una aprobación de diseño por separado.
- Sin Supabase por ahora: `data/` como fuente de verdad servida en el servidor, manteniendo el mismo modelo de esquemas para no duplicar trabajo cuando se conecte la base real.
- Descargar y procesar la geometría oficial en esta misma sesión (Fase 4 adelantada) en vez de dejar el mapa como maqueta, porque estaba disponible y sin costo adicional relevante.

### Próximos pasos

1. Usuario revisa la aplicación construida (`npm run dev`) y decide si la identidad visual actual se mantiene o se rehace como Fase 2 formal.
2. Crear el proyecto Supabase, migraciones y RLS (Fase 3); conectar `/api/participa` y activar el envío real de propuestas.
3. Investigación territorial y de fuentes para subir los scores de compañías, artistas y obras sobre 70, y cargar `venues`, `events`, `calls`, `editorial`, `archive`.
4. Validar las siete fichas de protagonistas con cada persona antes de publicar nada de la serie.

---

## Primera investigación real con fuentes públicas · sesión 2026-09-05

### Contexto

El usuario pidió "una gran búsqueda" para llenar el sitio con información real de internet, incluyendo fotografías tomadas de Google Images. Se le explicó que usar Google Images como fuente final está expresamente prohibido por la regla 5 de `CLAUDE.md` y por `docs/EDITORIAL.md` §8 (además del riesgo de derechos de autor), y se propuso empezar por lo más acotado y de mayor impacto: subir a fuentes públicas verificables los registros que ya existían con citas de la "investigación madre" pero sin URL propia. No se buscaron ni incorporaron imágenes en esta sesión.

### Qué se hizo

Búsqueda y verificación con `WebSearch`/`WebFetch` (siguiendo `docs/INVESTIGACION.md` y las skills `investigar-quinta-escena-podcast` y `verificar-datos`) sobre los siete protagonistas y sus obras/agrupaciones. Resultado: **5 registros pasaron a `verificado`** con fuentes públicas reales, dos quedaron con mejor puntaje sin llegar al umbral, y se actualizaron seis tareas de `research_queue.json`:

- **Hugo Hernández Urtubia** y **Compañía de Marionetas The Magic Show**: verificados (score 75) con [Diario El Trabajo, 24 de agosto de 2026](https://eltrabajo.cl/web/el-arte-de-dar-vida-dos-titiriteros-del-valle-son-reconocidos-como-cultores/), que confirma el reconocimiento SIGPA como cultor («más de 20 años de trayectoria», no los 25 exactos citados internamente) y la función del 25 de agosto de 2026 en la Escuela Mateo Cokljat de San Felipe. *Varieté de Marionetas Musicales* subió a score 62 (sigue `pendiente`: falta fuente propia de dirección, estreno y sinopsis).
- **Nelson Rojas Torres**: verificado (score 70, en el límite) con una fuente institucional propia del Ministerio de las Culturas ([bitácora de residencias, página dedicada a él](https://bitacoraresidencias.cultura.gob.cl/conversaciones-entre-territorios-nelson-rojas-torres-con-vasili-carrillo-nova/)) que confirma su rol de gestor cultural en la residencia «Recolectores de Memoria» (Lota, 2018). Arte Escénico La Ligua subió a score 60 (se encontró y registró la cuenta de Instagram oficial del Festival Valle del Liwa, pero sin abrirla para confirmar contenido; sigue `pendiente`).
- **Alan Fernández Caro**, **Compañía de Teatro La Lancha** y la obra **Llo Lle We**: se localizó [El Proa, 24 de diciembre de 2021](https://elproa.cl/2021/12/compania-de-teatro-la-lancha-se-ha-lucido-con-su-obra-llo-lle-we-la-historia-de-san-antonio/), que confirma elenco completo (agregando a Diego Chamorro como director y actor, y a los músicos Francisco Luco y Pablo Urtubia), sinopsis y más de 23 funciones a esa fecha en la Plaza de Llolleo, Lo Abarca y Santiago. Alan Fernández y la compañía quedaron `verificado` (score 75); la obra quedó en score 63 (`pendiente`: la fuente es real pero antigua —casi 5 años— y no hay fuente nivel 1 propia de la obra).
- **Carlos Muñoz Rivera / Festín de la Risa**: sin cambios de score. Dos artículos prometedores (sientevalpo.cl, elmartutino.cl) aparecieron en la búsqueda pero no se pudieron abrir (404 y 403); quedan como pista en `research_queue.json` (rq-002) para un próximo intento.

En todos los casos se dejó `published: false`: la publicación sigue siendo una decisión explícita de una persona del equipo (`docs/CRITERIOS_VERIFICACION.md` §3), y para los siete protagonistas de la serie además falta la validación directa con cada persona (`docs/QUINTA_ESCENA_PODCAST.md` §10), anotada explícitamente en cada `verification.note`.

`python3 scripts/validar_datos.py` sigue en 0 errores tras los cambios; las 13 pruebas de Vitest siguen en verde; se confirmó visualmente en el sitio local que las fichas de Hugo Hernández y de la Compañía de Teatro La Lancha ya muestran el estado "Ficha verificada".

### Qué falta

- Los otros cuatro protagonistas (Natalia Zúñiga, Víctor Opazo, Constanza Méndez y sus agrupaciones) no se tocaron en esta sesión: siguen con las mismas fuentes internas sin URL pública.
- Imágenes: no se buscó ninguna. El camino compatible con las reglas del proyecto es Wikimedia Commons y fuentes oficiales que declaren explícitamente derecho de reúso, con crédito; para la mayoría de estas compañías y artistas independientes es probable que no exista ninguna foto con licencia clara, y el resultado correcto es el espacio digno (avatar con iniciales) que ya está construido, más la invitación a proponer una foto autorizada.
- La "gran búsqueda" pedida por el usuario, para *todo* lo que la plataforma propone (compañías, artistas, obras, espacios, cartelera, convocatorias, editorial, archivo en 38 comunas), es el objetivo completo de la Fase 11 del roadmap (≥ 50 compañías con score ≥ 70 en al menos 5 provincias); esta sesión solo cubrió una primera porción acotada (los siete protagonistas y sus obras/agrupaciones ya existentes en `data/`).

### Próximos pasos

1. Definir con el usuario el orden de la investigación territorial abierta (nuevas compañías, artistas, espacios, cartelera y convocatorias): las provincias interiores señaladas como prioritarias (Los Andes, San Felipe de Aconcagua, Petorca, Quillota) u otro orden que prefiera.
2. Completar Natalia Zúñiga, Víctor Opazo y Constanza Méndez con el mismo método.
3. Retomar `sientevalpo.cl` y `elmartutino.cl` para Carlos Muñoz Rivera / Festín de la Risa (bloqueados hoy).

---

## Espacios escénicos y cartelera real, con interfaz conectada · sesión 2026-09-05 (continuación)

### Contexto

El usuario eligió continuar la investigación por "espacios y cartelera primero", entre tres opciones planteadas (terminar los protagonistas de la serie, abrir una provincia nueva, o espacios y cartelera). Se investigaron los 8 espacios ya anotados como pistas en `research_queue.json` (rq-046 a rq-055) en vez de empezar de cero, y se conectaron los datos nuevos a la interfaz: tenerlos en `data/` sin mostrarlos en el sitio no cumplía el pedido de "dar belleza a la página con contenido real".

### Qué se hizo

**7 espacios escénicos verificados con fuentes oficiales**, en `data/venues/`, cubriendo 5 de las 8 provincias:

- **Teatromuseo del Títere y el Payaso** y **Parque Cultural de Valparaíso** (Valparaíso): dirección confirmada en el sitio oficial de cada uno.
- **Centro Cultural San Antonio** (San Antonio): dirección y contacto confirmados en el sitio municipal.
- **Teatro Municipal Juan Bustos Ramírez** (Quilpué) y **Teatro Rodolfo Bravo** (Quillota): existencia e historia confirmadas con fuentes oficiales (gob.cl, Ministerio de las Culturas), pero la dirección y capacidad que circulan en directorios de terceros no se confirmaron de forma directa: quedaron en `null` en vez de copiarse sin verificar (`verification.status = "pendiente"`).
- **Teatro Municipal Pompeya** (Villa Alemana): dirección oficial del Consejo de Monumentos Nacionales, con una discrepancia frente a otra dirección que cita Wikipedia, anotada explícitamente para que un verificador humano la resuelva.
- **Centro Cultural de Los Andes** (Los Andes): dirección y contacto confirmados en el sitio municipal.
- **San Felipe** (rq-053): sin resultados suficientes. Se encontró una «Casa de la Cultura de San Felipe» con cuentas en redes, pero ningún sitio oficial con dirección; no se creó ficha, siguiendo la regla de que la ausencia de resultados es un hallazgo, no un motivo para inventar.

**3 funciones reales en cartelera**, en `data/events/`, levantadas directamente de la cartelera oficial de Teatromuseo (`teatromuseo.cl/cartelera`, abierta y confirmada el mismo día): *Sola* (5 de septiembre), *En este instante* (6 de septiembre) y *El gran circo imaginario* (13 de septiembre), con fecha, hora y lugar exactos. Se confirmó además que Chile cambia a horario de verano (UTC-3) la noche del 5 de septiembre de 2026, y las horas se registraron con el desfase horario correcto a cada lado del cambio.

**Interfaz conectada a los datos reales** (antes estas secciones solo mostraban estados vacíos, sin importar qué hubiera en `data/`):

- Tipos, cargador y consultas nuevas para espacios (`src/lib/queries/venues.ts`) y cartelera (`src/lib/queries/events.ts`, con filtro automático de funciones vencidas).
- `/espacios` y `/espacios/[slug]`, `/cartelera` y `/cartelera/[slug]`: listados y fichas reales, con el mismo patrón de fuentes, verificación y "sigue explorando" que compañías, artistas y obras.
- Las páginas de provincia y comuna, y el bloque "Qué está pasando" de la portada, ahora muestran espacios y funciones reales cuando existen, en vez de solo el estado vacío.
- El buscador y el mapa regional (conteos por comuna y provincia) ahora incluyen espacios y funciones próximas.
- Corregido un detalle de formato: las horas se mostraban en formato de 12 horas ("07:00 p. m."); ahora usan el formato de 24 horas habitual en Chile ("19:00 hrs").

`python3 scripts/validar_datos.py` sigue en 0 errores; las 13 pruebas de Vitest en verde; build de producción limpio (102 rutas); recorrido con Playwright de 39 rutas en móvil y escritorio sin errores de consola, salvo el 404 esperado.

### Qué falta

- Cinco de los ocho espacios de la cola quedaron con dirección oficial confirmada por este asistente; los otros dos (Quilpué, Quillota) tienen la dirección que circula en internet pero no fue abierta y confirmada directamente, y San Felipe quedó sin espacio documentado.
- La cartelera solo cubre Teatromuseo (Valparaíso); las demás provincias y espacios siguen sin funciones registradas.
- Los tres provincias restantes de espacios pendientes en la cola original (Marga Marga ya cubierta parcialmente, San Felipe de Aconcagua sin resultado) y las cinco provincias sin ningún espacio (Petorca, San Antonio ya cubierta, Los Andes ya cubierta, San Felipe de Aconcagua, Isla de Pascua) siguen abiertas.
- Ningún espacio ni función quedó publicado: la publicación sigue siendo decisión de una persona del equipo.

### Próximos pasos

1. Confirmar directamente la dirección de Teatro Juan Bustos Ramírez (Quilpué) y Teatro Rodolfo Bravo (Quillota) abriendo una fuente que las declare.
2. Reintentar San Felipe con otra estrategia (llamar o escribir directamente, o revisar la cuenta de Instagram encontrada).
3. Levantar cartelera de los otros seis espacios ya documentados y de las compañías con redes sociales oficiales.
4. Seguir con la investigación territorial abierta en las provincias sin ningún registro (Petorca fuera de La Ligua, San Felipe de Aconcagua fuera de Putaendo).

---

## Despliegue en Vercel y decisión de mostrar contenido pendiente · sesión 2026-09-05 (continuación)

### Contexto

El usuario pidió subir el sitio a Vercel. Se autenticó esta sesión con su cuenta de Vercel (flujo OAuth por dispositivo, con su autorización explícita), se vinculó al proyecto `quinta-escena` que él ya había creado, y se confirmó que el despliegue automático desde GitHub ya estaba activo: cada push a `main` se despliega solo a `https://quinta-escena.vercel.app`.

Al revisar el sitio desplegado se encontraron y corrigieron dos problemas reales, y luego el usuario pidió explícitamente mostrar en la URL pública el contenido que hasta ese momento solo se veía en modo previsualización privado. Se le planteó la contrapartida (los siete perfiles de la serie no han sido validados con cada persona) antes de proceder, y reafirmó la decisión.

### Qué se hizo

1. **URL pública del sitio corregida**: `NEXT_PUBLIC_SITE_URL` había quedado configurada en Vercel con el valor de ejemplo (`http://localhost:3000`), horneado en el sitemap y las URLs canónicas de producción. Se reescribió `siteUrl()` (`src/lib/site.ts`) para que use las variables que Vercel expone automáticamente (`VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_URL`) en vez de depender de una variable configurada a mano, y se eliminó la variable mal configurada.
2. **Vista previa privada creada** (`vercel deploy`, sin `--prod`) con `ESCENA_PREVIEW=1` como variable de entorno propia del ambiente *Preview*: una URL protegida por el login de Vercel del usuario, donde se podía revisar todo el contenido en verificación sin exponerlo públicamente.
3. **Decisión explícita de publicar el contenido en verificación en producción**: a pedido directo del usuario, se agregó `ESCENA_PREVIEW=1` también al ambiente *Production* y se redesplegó. Esto activa el modo previsualización (`previewEnabled()`, `src/lib/data/visibility.ts`) para cualquier visitante de `quinta-escena.vercel.app`, no solo para el equipo.

### Qué significa esto en la práctica

- Las fichas con `verification.status = "pendiente"` o `"requiere_actualizacion"` (todas menos las 5 recién verificadas) se muestran con su aviso «Ficha en verificación» y la explicación de qué falta.
- Las 5 fichas verificadas el 5 de septiembre muestran «Ficha verificada» con su puntaje.
- Ningún dato cambió de estado: `published` sigue en `false` en todos los archivos de `data/`. La publicación formal (`isPublishable`, la que exige `docs/CRITERIOS_VERIFICACION.md`) sigue sin ocurrir.
- Por diseño, `sitemap.xml`, `robots.txt` y la metaetiqueta `robots` de cada ficha (`noindex`) siguen usando `isPublishable`, no `previewEnabled`: nada de este contenido en verificación entra al mapa del sitio ni se ofrece para indexar en buscadores, aunque cualquiera con el enlace pueda verlo navegando.

### Riesgos

- **Los siete protagonistas de la serie no han validado su ficha.** `docs/QUINTA_ESCENA_PODCAST.md` §10 exige esa validación antes de publicar, y ahora sus fichas (incluidas las 5 con score ≥ 70) son visibles públicamente aunque de forma honesta (con el aviso de verificación). Si alguna persona pide corrección o retiro, atenderlo en menos de 7 días según `docs/CRITERIOS_VERIFICACION.md` §7.
- Revertir es tan simple como quitar `ESCENA_PREVIEW` del ambiente Production en Vercel (`vercel env rm ESCENA_PREVIEW production`) y redesplegar.

### Próximos pasos

1. Validar cada ficha de protagonista con la persona correspondiente; al validarla, un miembro del equipo decide `published: true` caso a caso (la variable de entorno no reemplaza ese paso).
2. Evaluar si mantener `ESCENA_PREVIEW=1` en producción de forma permanente, o volver a «vacío y seguro» una vez que haya fichas realmente publicables.

---

## Cambio de marca: QUINTA ESCENA y Quinta Escena Podcast · sesión 2026-09-05 (continuación)

### Contexto

El usuario pidió renombrar todo el proyecto: ESCENA VALPARAÍSO pasa a llamarse **QUINTA ESCENA**, y su primera serie, De Cuento en Cuento, pasa a llamarse **Quinta Escena Podcast**. Se ejecutó como un cambio de marca completo, no solo cosmético.

### Qué se hizo

**Contenido y código** (sustitución de texto en 90+ archivos, más ajustes manuales donde el nombre estaba partido entre etiquetas `<em>`/`<span>` para un efecto de color): toda la documentación (`CLAUDE.md`, `README.md`, los 12 documentos de `docs/`), las 12 skills, y el código de la aplicación.

**Estructura de datos y rutas**, renombradas y no solo el texto visible, porque el proyecto aún no se ha lanzado (nada indexado, sin enlaces públicos que romper):
- `data/de-cuento-en-cuento/` → `data/quinta-escena-podcast/`; el campo `slug` de la serie y toda referencia cruzada (`series`, `episodes`) en compañías y artistas.
- `src/app/de-cuento-en-cuento/` → `src/app/quinta-escena-podcast/`; ruta pública `/de-cuento-en-cuento` → `/quinta-escena-podcast`, con **redirección 301 permanente** desde la ruta antigua (`next.config.ts`), según la convención de `docs/SEO.md` sobre slugs estables.
- `.claude/skills/investigar-de-cuento-en-cuento/` → `.claude/skills/investigar-quinta-escena-podcast/`.
- `docs/DE_CUENTO_EN_CUENTO.md` → `docs/QUINTA_ESCENA_PODCAST.md`.
- Etiqueta `protagonista-dcc` → `protagonista-podcast`.
- `package.json`/`package-lock.json`: nombre del paquete `quinta-escena`.

**Se dejó sin cambiar, a propósito**: el territorio real (Región de Valparaíso, sus comunas y provincias — eso no cambió, solo el nombre de la plataforma), la identidad visual de la serie (coral, amarillo, tipografía itálica del wordmark), y los identificadores internos que nunca se muestran en pantalla ni en una URL (variables CSS `--dcc-*`, los slugs de episodio `dcc-01-los-andes` … `dcc-07-san-antonio`).

**Infraestructura externa**:
- Proyecto de Vercel renombrado (`vercel project rename`) y realiasado a `quinta-escena.vercel.app`. Esto requirió pasos manuales adicionales no documentados por Vercel: el dominio `.vercel.app` autogenerado no se reasigna solo al renombrar el proyecto ni siempre en cada deploy posterior — hubo que forzarlo con `vercel alias set` después de cada redeploy, y desactivar la protección SSO del proyecto (`vercel project protection disable --sso`) porque el nuevo alias quedaba detrás del login de Vercel. **Advertencia para el futuro**: si un próximo despliegue automático (push a `main`) no se refleja en `quinta-escena.vercel.app`, puede deberse a esta misma reasignación de alias; el arreglo es `vercel alias set <deployment-url> quinta-escena.vercel.app` con la URL del despliegue más reciente.
- `NEXT_PUBLIC_SITE_URL` se fijó explícitamente en Production a `https://quinta-escena.vercel.app` porque la variable automática de Vercel para la URL de producción no se actualizó de inmediato tras el renombre.
- Carpeta local renombrada de `~/Documents/escena-valparaiso/` a `~/Documents/quinta-escena/`.
- **Pendiente, requiere acción manual del usuario**: el repositorio de GitHub sigue llamándose `sebachamorror/escena-valparaiso`. No se pudo renombrar desde aquí (sin `gh` CLI ni token). GitHub mantiene una redirección automática desde el nombre antiguo, así que nada se rompe mientras tanto; para renombrarlo: Settings → General → Repository name, en github.com/sebachamorror/escena-valparaiso.

### Verificación

`python3 scripts/validar_datos.py` en 0 errores; 13 pruebas de Vitest en verde; build de producción limpio; recorrido de todas las rutas en móvil y escritorio sin errores de consola; confirmado en vivo en `https://quinta-escena.vercel.app` (sitemap, fichas, la nueva ruta de la serie y la redirección desde la ruta antigua).

### Próximos pasos

1. Renombrar el repositorio de GitHub cuando el usuario quiera (paso manual de 30 segundos, ver arriba).
2. Si Vercel no aliasa solo un futuro deploy a `quinta-escena.vercel.app`, aplicar el arreglo manual descrito arriba, o revisar en el dashboard de Vercel (Project Settings → Domains) si ya quedó fijo como dominio de producción.

---

## Investigación mayor: compañías, festivales y cartelera · sesión 2026-09-05 (continuación)

### Contexto

El usuario pidió una búsqueda mayor en toda la web de teatro, compañías y panoramas para sumar más contenido al sitio. Se abordó como una investigación de la cola pendiente en `data/research_queue.json`, usando cuatro investigaciones en paralelo con las skills correspondientes (`buscar-companias-teatro` ×2, `buscar-festivales`, `buscar-cartelera`), cada una con búsqueda web real y fuentes verificables. No se tocó `src/`.

### Qué se hizo

**Compañías** (10 fichas nuevas en `data/companies/`, todas `published: false`):
- Del Catálogo de Compañías de Teatro Tradicional de Títeres Región de Valparaíso (Servicio Nacional del Patrimonio Cultural, 2025) — cuya URL oficial se localizó y queda registrada (resuelve rq-069): `colectiva-la-capuchina`, `titiricaos`, `guaico-titeres`, `compania-de-munecos-marionautas`, `asamblea-titiritera-attich-v` (tratada como agrupación/colectivo, sin esquema propio de "organización").
- Teatro familiar y otras compañías: `ludus-teatro`, `titeres-humedal-rio-maipo`, `la-enredadera`, `fundacion-oani-de-teatro` (la más sólida: sitio propio, actividad hasta agosto de 2026), `teatro-la-peste`.
- **Descartadas deliberadamente sin ficha** por no poder fijar la comuna de sede con una fuente real (aunque su existencia sí está confirmada): *La Barconeta* y *Vaccaro Puppets* (ambas del catálogo oficial, con correo público hallado) e *Hypókritas* (existe una compañía homónima en Salamanca, España, que no debe confundirse con esta).
- **Descartadas por no corresponder o no poder confirmarse**: *Ojos de Mar* (es una fundación ambiental, no una compañía de teatro), *Compañía de Teatro Espontáneo de Quillota* (sin fuente que confirme su existencia), *Teatro Ánima* de Quillota (sin actividad desde julio de 2019; queda como candidata a Archivo).

**Festivales y cartelera** (6 fichas nuevas en `data/events/`, 1 en `data/archive/`, 2 funciones nuevas en `data/events/`):
- Festivales documentados: Festival Litoral Teatral 2026 (verificado, décima edición), Festival Ventolera 2024 (verificado, IV edición), Festival Caleta de Títeres 2026 (verificado, II edición, funciones sobre lanchas en el Muelle Prat), Festival Teatro Container 2024 (verificado, VIII edición), Puerto a Puerta Valparaíso 2024 (pendiente, única fuente es el sitio de OANI).
- Gira "Paraísos Creativos" (teatro familiar, noviembre 2021) documentada como entrada de archivo (`data/archive/paraisos-creativos-gira-teatro-familiar-2021.json`), con el itinerario completo de Festín de la Risa, Ludus Teatro y La Enredadera.
- **Festival Valle del Liwa (La Ligua) no se pudo documentar**: su sitio oficial no resuelve desde este entorno, y se detectó una discrepancia sin resolver entre las fichas ya existentes (que citan "quinta edición 2024") y un PDF de bases indexado que dice "4º Festival... 2024". Queda anotado como tarea de verificación.
- Cartelera: dos funciones nuevas verificadas en el Centro Cultural San Antonio (*Ánimas de día claro*, 5-sep-2026; *Circo Saltimbanqui*, 26-sep-2026). El resto de los espacios ya verificados (Parque Cultural de Valparaíso, Teatro Municipal Juan Bustos Ramírez, Teatro Municipal Pompeya, Teatro Rodolfo Bravo, Centro Cultural de Los Andes) no tenían programación oficial de artes escénicas publicada para las próximas semanas al momento del levantamiento, o sus sitios no eran accesibles con las herramientas disponibles.

**Cola de investigación**: 15 tareas pasaron a `done`, 3 a `discarded` (con el motivo documentado en cada una), y se agregaron 44 tareas nuevas (`rq-113` a `rq-156`) a partir de pistas concretas con fuente — principalmente compañías participantes de festivales (con comuna citada por la fuente), dos hallazgos que ameritan seguimiento propio (la itinerancia regional "Mujeres en la Escena", 2026-2027, y el festival FESTILAMBE de Valparaíso), y dos tareas de verificación sobre el caso Valle del Liwa.

### Qué no se hizo (a propósito)

- No se marcó ninguna ficha como `verificado` sin una fuente nivel 1 sólida que lo justificara; la mayoría de lo nuevo queda `pendiente`, como corresponde a una primera pasada de investigación.
- No se creó ninguna relación (compañía, obra) inventada: donde la fuente no daba el dato, el campo quedó en `null` y la pista pasó a la cola en vez de forzarse.
- No se investigaron las 38 comunas de `investigar-territorio` (`rq-075` a `rq-112`, la mayoría aún `pending`) ni las convocatorias de fondos (`rq-065` a `rq-068`): quedan fuera del alcance de esta sesión, priorizada en compañías, festivales y cartelera.

### Verificación

`python3 scripts/validar_datos.py --strict` → 0 errores, 0 avisos. Recuento final: `companies` 16 archivos, `events` 10 archivos, `archive` 1 archivo, `research_queue` 156 tareas (22 `done`, 3 `discarded`, 20 `in_progress`, 111 `pending`).

### Próximos pasos

1. Verificar con la skill `verificar-datos` las fichas nuevas antes de cualquier publicación (ninguna tiene `published: true`).
2. Resolver la discrepancia de edición del Festival Valle del Liwa (`rq-155`) y reintentar el acceso a `festivalvalledelliwa.cl` (`rq-156`).
3. Seguir la pista de la itinerancia "Mujeres en la Escena" (Quillota 23-sep-2026, Quilpué/Colliguay 24-oct-2026) buscando una fuente oficial (Ministerio, gestora o compañías) antes de registrarla como cartelera.
4. Completar las fichas de compañía nuevas que quedaron sin comuna de sede (La Barconeta, Vaccaro Puppets, Hypókritas) contactando directamente por los correos públicos ya hallados, o revisando sus redes sociales desde un entorno con acceso a Instagram.
