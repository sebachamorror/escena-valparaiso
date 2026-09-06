# Estrategia SEO regional

## 1. Meta

Que búsquedas como *compañías de teatro en Valparaíso*, *teatro en San Antonio*, *teatro en Los Andes*, *obras de teatro en Viña del Mar*, *artistas escénicos de Valparaíso*, *cartelera teatral Valparaíso*, *festivales de teatro Valparaíso* lleguen naturalmente a QUINTA ESCENA.

Regla: solo se indexa contenido **verificado**. Las fichas no publicadas no existen para los buscadores (no hay páginas "vacías" indexadas).

## 2. Arquitectura de URLs

| Sección | Patrón | Ejemplo |
|---|---|---|
| Territorios | `/territorios/<provincia>` · `/territorios/<comuna>` | `/territorios/los-andes`, `/territorios/san-antonio`, `/territorios/putaendo` |
| Compañías | `/companias` · `/companias/<slug>` · `/companias?comuna=` | `/companias/teatro-la-lancha` |
| Artistas | `/artistas/<slug>` | `/artistas/hugo-hernandez-urtubia` |
| Obras | `/obras/<slug>` | `/obras/el-loco-y-la-triste` |
| Espacios | `/espacios/<slug>` | |
| Cartelera | `/cartelera` · `/cartelera/hoy` · `/cartelera/<comuna>` · `/cartelera/<yyyy>/<mm>` | `/cartelera/vina-del-mar` |
| Convocatorias | `/convocatorias/<slug>` · `/convocatorias/archivo` | |
| Editorial | `/editorial/<slug>` | |
| Oficios | `/oficios/<slug>` | `/oficios/titeres` |
| Formación | `/formacion/<slug>` | |
| Archivo | `/archivo/<slug>` | |
| Quinta Escena Podcast | `/quinta-escena-podcast` · `/quinta-escena-podcast/episodios/<n>-<slug>` · `/quinta-escena-podcast/la-posta` | `/quinta-escena-podcast/episodios/1-los-andes` |

Slugs sin acentos, en minúsculas, con guiones; estables (si cambia el nombre, se redirige 301 desde el slug antiguo).

## 3. Páginas territoriales como landings

Cada comuna y provincia tiene una página con título tipo "Teatro y artes escénicas en San Antonio", texto propio (no plantilla vacía), conteos reales, compañías, artistas, espacios, cartelera, editorial, convocatorias y episodios. Son las páginas con más potencial de búsqueda local. Se generan solo para territorios con al menos una entidad verificada; los demás muestran una página breve con llamada a participar y `noindex`.

## 4. Metadata por tipo

Título (`<title>`) y descripción únicos por página, con territorio y disciplina cuando corresponde:

- Compañía: `«{nombre}» · Compañía de {disciplina} en {comuna} · QUINTA ESCENA`.
- Artista: `{nombre} · {oficio} · {comuna}`.
- Evento: `{obra} · {fecha} · {espacio}, {comuna}`.
- Territorio: `Artes escénicas en {comuna} · compañías, obras y cartelera`.

Open Graph y Twitter Cards en todas las páginas; imagen OG dinámica (`opengraph-image.tsx`) con nombre, territorio y crédito cuando no hay fotografía con licencia. `canonical` siempre. `lang="es-CL"`.

## 5. Datos estructurados (Schema.org, JSON-LD)

| Página | Tipo |
|---|---|
| Compañía | `PerformingGroup` (u `Organization`) con `location`, `sameAs` (redes), `foundingDate` |
| Artista | `Person` con `jobTitle`, `homeLocation`, `sameAs` |
| Obra | `CreativeWork` / `TheaterEvent` cuando hay funciones |
| Función | `TheaterEvent` con `startDate`, `location` (`Place` con `address`), `offers`, `performer`, `organizer` |
| Espacio | `PerformingArtsTheater` o `Place` con dirección y `geo` |
| Editorial | `Article` / `NewsArticle` con `author`, `datePublished` |
| Episodio | `VideoObject` + `PodcastEpisode` con `transcript` |
| Convocatoria | `Event` (o `Grant` cuando aplique) con fechas |
| Todas | `BreadcrumbList`, `WebSite` con `SearchAction` en la portada |

## 6. Sitemap y robots

`sitemap.xml` índice con un sitemap por sección, generado desde la base de datos con `lastmod`; solo páginas publicadas. `robots.txt` permite todo salvo `/admin`, `/api` y páginas `noindex`. Se registra el sitio en Google Search Console y Bing.

## 7. Contenido y enlazado interno

- Un H1 por página con el nombre y el territorio.
- "Sigue explorando" en cada ficha: enlaces a entidades de la misma provincia.
- Migas de pan visibles y en JSON-LD.
- Textos de disciplina y territorio escritos, no generados.
- Editorial enlaza siempre a fichas; fichas enlazan a editorial.

## 8. Rendimiento y técnica

Core Web Vitals como criterio de aceptación (LCP < 2,5 s, CLS < 0,1, INP < 200 ms en móvil). HTML renderizado en servidor; imágenes con `next/image`; fuentes locales; sin transpilar en el navegador.

## 9. Medición

Search Console (consultas, páginas, territorio), analítica con dimensión `territory`, seguimiento de las siete consultas objetivo y de "teatro en {comuna}" para las 38 comunas.
