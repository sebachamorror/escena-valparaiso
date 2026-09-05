# PROGRESO — ESCENA VALPARAÍSO

Bitácora por fase. Cada entrada: qué se hizo, qué falta, riesgos, decisiones, próximos pasos.

---

## Fase 1 — Arquitectura y auditoría · sesión 2026-09-05

### Qué se hizo

**Auditoría de Aplauzo** (`docs/AUDITORIA_APLAUZO.md`): lectura completa del repositorio de producción (`~/Documents/WebAplauzo`) y del workspace (`~/Documents/Aplauzo`), sin modificar nada. Stack detectado: React 18 UMD + Babel en el navegador, sin build; datos en `window.APLAUZO`; navegación por estado sin URLs; mapa mundial d3 + topojson; buscador en memoria; Supabase para envíos con moderación (esquema solo en el workspace, no versionado); SEO inexistente. Se listó qué reutilizar (patrón de moderación, esquema declarativo de formularios, normalización de búsqueda, enfoque d3 del mapa, estados vacíos, tokens CSS), qué no copiar (identidad, contenido, mapa mundial, datos demo, image-slot, tweaks, admin por correo fijo, Babel en el navegador) y qué refactorizar.

**Carpeta nueva** `~/Documents/escena-valparaiso/`, hermana de Aplauzo y WebAplauzo, con: `CLAUDE.md`, `README.md`, `docs/` (SOUL, ARQUITECTURA, MODELO_DATOS, MAPA, EDITORIAL, DE_CUENTO_EN_CUENTO, INVESTIGACION, CRITERIOS_VERIFICACION, SEO, ROADMAP, este archivo), `.claude/skills/` (12 skills), `data/` (esquemas, vocabularios, territorios, serie, protagonistas, compañías, obras, cola), `scripts/validar_datos.py`, `public/geo/FUENTES.md`, `src/README.md` (vacío a propósito), `.gitignore`, `.editorconfig`.

**Arquitectura propuesta**: Next.js 15 (App Router, TypeScript) en Vercel; Supabase propio (Postgres + PostGIS + Auth + Storage + RLS); CSS Modules con tokens; mapa regional SVG (d3-geo + geometría oficial de comunas) y mapa de detalle con OpenStreetMap; búsqueda con Postgres full-text; panel `/admin` con roles; analítica con eventos (Plausible). Estructura de carpetas, navegación de 11 secciones, portada de 10 bloques, componentes reutilizables y nuevos, flujos de descubrimiento, participación y verificación.

**Modelo de datos**: territorio y verificación como columnas de primera clase; entidades company, artist, work, event/occurrence, venue/place, call, post, craft, training, archive_item, series/episode/posta; media con crédito y licencia; sources y entity_sources; relaciones polimórficas; contributions y research_tasks; RLS; búsqueda; mapeo con `data/`.

**Sistema territorial**: 8 provincias y 38 comunas verificadas con la Biblioteca del Congreso Nacional; códigos únicos territoriales (región 05, provincias 051–058, 38 comunas) verificados con el documento oficial de SUBDERE. Isla de Pascua y Juan Fernández incluidas como territorios insulares.

**De Cuento en Cuento**: serie, 7 episodios y 7 entregas de La Posta según `ruta.py` y la propuesta vigente; 7 protagonistas, 6 agrupaciones y 4 obras con fuentes y estado `pendiente`; sin RUT ni datos personales. Discrepancias registradas (28 objetos del brief frente a 7 de la propuesta; lengua de señas en 4 o 7 capítulos).

**Skills**: buscar-companias-teatro, buscar-artistas-escenicos, buscar-cartelera, buscar-festivales, buscar-espacios-escenicos, buscar-convocatorias, buscar-oficios-escenicos, buscar-archivo-teatral, verificar-datos, investigar-territorio, investigar-de-cuento-en-cuento, auditar-fuente.

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

1. Usuario revisa `docs/ARQUITECTURA.md`, `docs/MODELO_DATOS.md`, `docs/MAPA.md` y decide sobre las discrepancias de `docs/DE_CUENTO_EN_CUENTO.md` §9.
2. Fase 2: diseño visual (identidad propia + relación con la de De Cuento en Cuento).
3. Fase 3: proyecto Supabase, migraciones, importador.
4. En paralelo: correr `investigar-de-cuento-en-cuento` para registrar URLs de fuentes y `investigar-territorio` en las provincias interiores.

---

## Fases 2, 4, 5, 6, 9 y 10 (parcial) — construcción inicial de la aplicación · sesión 2026-09-05

### Contexto

El usuario revisó la Fase 1 y, ante la pregunta de si podía ver la página, respondió "sí, aprobado y construye". Eso saltó el hito de mockups separados de la Fase 2 (`docs/ROADMAP.md`: "Aprobación del usuario sobre mockups") y el orden estricto de fases: se construyó la aplicación directamente en código, con la identidad visual definida en los mismos componentes. Se documenta aquí como decisión explícita, no como omisión silenciosa (regla 9 de `CLAUDE.md`).

### Qué se hizo

**Proyecto Next.js** (`package.json`, `tsconfig.json`, `next.config.ts`, `.env.example`, `vitest.config.ts`): Next 15, React 19, TypeScript estricto, App Router. Sin Supabase: toda la app lee `data/` en el servidor con `fs` (`src/lib/data/load.ts`), cacheado por request con `React.cache`.

**Capa de datos** (`src/lib/data/`, `src/lib/queries/`): tipos espejo de `data/schemas/`; `visibility.ts` implementa el umbral de publicación (`published && verificado && score ≥ 70`) y un modo previsualización (activo por defecto fuera de producción) que muestra fichas `pendiente` con aviso «en verificación», nunca indexable (`isIndexable` exige publicable). Consultas por comuna, provincia, compañía, artista, obra y episodio; conteos por territorio.

**Sistema visual** (`src/styles/tokens.css`, `globals.css`): paleta papel/tinta con un acento mar y uno cerro; tipografía de sistema (serif de despliegue, sans de texto, mono para metadatos); De Cuento en Cuento conserva su coral, amarillo y crema (`docs/DE_CUENTO_EN_CUENTO.md` §11) en franjas propias. Mobile first: navegación con menú de pantalla completa bajo 1180px, rejillas fluidas, mapa táctil.

**Páginas** (`src/app/`): portada (10 bloques), `/buscar` (índice en memoria con tokenización sin acentos, agrupado por tipo), `/mapa`, `/territorios` con provincia y comuna, `/companias`, `/artistas`, `/obras` con listado y ficha, `/oficios` (17 oficios, perfiles reales por oficio), `/de-cuento-en-cuento` con episodios, La Posta y protagonistas, `/cartelera`, `/convocatorias`, `/editorial`, `/formacion`, `/archivo`, `/espacios` con estado vacío honesto y llamada a proponer, `/participa` (formulario sin login, con `POST /api/participa`), `/datos` (política de verificación pública), `sitemap.xml` (solo fichas publicables), `robots.txt`, imagen Open Graph generada. Cada ficha muestra `VerificationBadge`, `SourceList` con nivel y fecha de consulta, y "Sigue explorando" (misma provincia). JSON-LD por tipo de página.

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

Búsqueda y verificación con `WebSearch`/`WebFetch` (siguiendo `docs/INVESTIGACION.md` y las skills `investigar-de-cuento-en-cuento` y `verificar-datos`) sobre los siete protagonistas y sus obras/agrupaciones. Resultado: **5 registros pasaron a `verificado`** con fuentes públicas reales, dos quedaron con mejor puntaje sin llegar al umbral, y se actualizaron seis tareas de `research_queue.json`:

- **Hugo Hernández Urtubia** y **Compañía de Marionetas The Magic Show**: verificados (score 75) con [Diario El Trabajo, 24 de agosto de 2026](https://eltrabajo.cl/web/el-arte-de-dar-vida-dos-titiriteros-del-valle-son-reconocidos-como-cultores/), que confirma el reconocimiento SIGPA como cultor («más de 20 años de trayectoria», no los 25 exactos citados internamente) y la función del 25 de agosto de 2026 en la Escuela Mateo Cokljat de San Felipe. *Varieté de Marionetas Musicales* subió a score 62 (sigue `pendiente`: falta fuente propia de dirección, estreno y sinopsis).
- **Nelson Rojas Torres**: verificado (score 70, en el límite) con una fuente institucional propia del Ministerio de las Culturas ([bitácora de residencias, página dedicada a él](https://bitacoraresidencias.cultura.gob.cl/conversaciones-entre-territorios-nelson-rojas-torres-con-vasili-carrillo-nova/)) que confirma su rol de gestor cultural en la residencia «Recolectores de Memoria» (Lota, 2018). Arte Escénico La Ligua subió a score 60 (se encontró y registró la cuenta de Instagram oficial del Festival Valle del Liwa, pero sin abrirla para confirmar contenido; sigue `pendiente`).
- **Alan Fernández Caro**, **Compañía de Teatro La Lancha** y la obra **Llo Lle We**: se localizó [El Proa, 24 de diciembre de 2021](https://elproa.cl/2021/12/compania-de-teatro-la-lancha-se-ha-lucido-con-su-obra-llo-lle-we-la-historia-de-san-antonio/), que confirma elenco completo (agregando a Diego Chamorro como director y actor, y a los músicos Francisco Luco y Pablo Urtubia), sinopsis y más de 23 funciones a esa fecha en la Plaza de Llolleo, Lo Abarca y Santiago. Alan Fernández y la compañía quedaron `verificado` (score 75); la obra quedó en score 63 (`pendiente`: la fuente es real pero antigua —casi 5 años— y no hay fuente nivel 1 propia de la obra).
- **Carlos Muñoz Rivera / Festín de la Risa**: sin cambios de score. Dos artículos prometedores (sientevalpo.cl, elmartutino.cl) aparecieron en la búsqueda pero no se pudieron abrir (404 y 403); quedan como pista en `research_queue.json` (rq-002) para un próximo intento.

En todos los casos se dejó `published: false`: la publicación sigue siendo una decisión explícita de una persona del equipo (`docs/CRITERIOS_VERIFICACION.md` §3), y para los siete protagonistas de la serie además falta la validación directa con cada persona (`docs/DE_CUENTO_EN_CUENTO.md` §10), anotada explícitamente en cada `verification.note`.

`python3 scripts/validar_datos.py` sigue en 0 errores tras los cambios; las 13 pruebas de Vitest siguen en verde; se confirmó visualmente en el sitio local que las fichas de Hugo Hernández y de la Compañía de Teatro La Lancha ya muestran el estado "Ficha verificada".

### Qué falta

- Los otros cuatro protagonistas (Natalia Zúñiga, Víctor Opazo, Constanza Méndez y sus agrupaciones) no se tocaron en esta sesión: siguen con las mismas fuentes internas sin URL pública.
- Imágenes: no se buscó ninguna. El camino compatible con las reglas del proyecto es Wikimedia Commons y fuentes oficiales que declaren explícitamente derecho de reúso, con crédito; para la mayoría de estas compañías y artistas independientes es probable que no exista ninguna foto con licencia clara, y el resultado correcto es el espacio digno (avatar con iniciales) que ya está construido, más la invitación a proponer una foto autorizada.
- La "gran búsqueda" pedida por el usuario, para *todo* lo que la plataforma propone (compañías, artistas, obras, espacios, cartelera, convocatorias, editorial, archivo en 38 comunas), es el objetivo completo de la Fase 11 del roadmap (≥ 50 compañías con score ≥ 70 en al menos 5 provincias); esta sesión solo cubrió una primera porción acotada (los siete protagonistas y sus obras/agrupaciones ya existentes en `data/`).

### Próximos pasos

1. Definir con el usuario el orden de la investigación territorial abierta (nuevas compañías, artistas, espacios, cartelera y convocatorias): las provincias interiores señaladas como prioritarias (Los Andes, San Felipe de Aconcagua, Petorca, Quillota) u otro orden que prefiera.
2. Completar Natalia Zúñiga, Víctor Opazo y Constanza Méndez con el mismo método.
3. Retomar `sientevalpo.cl` y `elmartutino.cl` para Carlos Muñoz Rivera / Festín de la Risa (bloqueados hoy).
