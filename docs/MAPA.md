# Mapa de la Región de Valparaíso

Estado: propuesta (Ciclo 2). Se implementa en la Fase 4.

## 1. Qué es y qué no es

Un mapa **exclusivo de la Región de Valparaíso**, no del mundo ni de Iberoamérica. Es una herramienta de navegación (un índice territorial), no una ilustración. Debe funcionar especialmente bien en móvil. La arquitectura deja abierta la posibilidad de otras regiones, otras ediciones y otros proyectos: la región es un parámetro.

## 2. Niveles

| Nivel | Qué muestra | Cómo se dibuja |
|---|---|---|
| Región | 8 provincias, 38 comunas, con Isla de Pascua y Juan Fernández como recuadros (insets) | SVG estático generado con d3-geo a partir de TopoJSON oficial |
| Provincia | Sus comunas, con conteo de entidades por capa | SVG, zoom por `fitExtent` |
| Comuna | Puntos con coordenadas verificadas (espacios, sedes, locaciones) | SVG o mapa de detalle según densidad |
| Detalle | Calles para llegar a un espacio | MapLibre GL o Leaflet sobre OpenStreetMap, con atribución |

## 3. Capas

| Capa | Nombre | Entidades | Fuente de posición |
|---|---|---|---|
| 1 | Qué está pasando | eventos con funciones próximas, festivales | espacio de la función |
| 2 | Quiénes lo hacen | compañías, artistas | comuna de sede (centroide) o sede verificada |
| 3 | Dónde trabajan | sedes, salas de ensayo, talleres declarados | dirección verificada y autorizada |
| 4 | Qué contenidos existen | editorial, archivo, formación | comuna asociada |
| 5 | De Cuento en Cuento | episodios, locaciones naturales, ruta de La Posta | comuna + locación natural |
| 6 | Espacios escénicos | teatros, centros culturales, salas, espacios no convencionales | dirección verificada |

Cada capa se activa con un chip; en móvil, un selector horizontal. Al tocar una comuna se abre un panel inferior con el resumen por capa y enlace a `/territorios/<comuna>`.

## 4. Geometría oficial

- **Fuente:** división político-administrativa oficial de Chile (Ministerio de Bienes Nacionales / IDE Chile, ide.cl, capa "Comunas" o "División comunal"; alternativa: Biblioteca del Congreso Nacional, SIIT, geodatos de división comunal). Se registra en `public/geo/FUENTES.md` la URL, la versión y la fecha de descarga.
- **Procesamiento:** filtrar región 05, simplificar con mapshaper (tolerancia que mantenga las costas reconocibles), exportar TopoJSON `comunas.topo.json` y `provincias.topo.json` con propiedades `slug`, `name`, `cut_code`, `province_slug`. Objetivo: menos de 150 kB.
- **Insets:** Isla de Pascua y Juan Fernández se dibujan en recuadros con escala propia y etiqueta; nunca se omiten.
- **Proyección:** Mercator o Transversa de Mercator centrada en el continente regional (aprox. 71,3° O, 32,8° S), ajustada con `fitExtent` al contenedor.

## 5. Coordenadas y geocodificación

1. **No se inventan coordenadas.** Un punto solo existe si tiene `location` con `precision` y `geocode_source`.
2. **Precisión:** `exact` (coordenada proporcionada por la entidad o verificada en terreno), `street` (geocodificada desde dirección oficial), `commune_centroid` (solo se conoce la comuna), `unknown`.
3. **Geocodificación:** solo cuando existe una dirección publicada por una fuente de nivel 1 o 2. Herramienta: Nominatim (OSM) respetando su política de uso, o verificación manual. Se guarda `geocode_source`, `geocoded_at` y la dirección de entrada.
4. **Fallback visual:** las entidades con `commune_centroid` se dibujan agrupadas en la comuna con un símbolo distinto y sin pretender exactitud.
5. **Privacidad:** las sedes de artistas y compañías solo se geolocalizan con precisión si la entidad lo autorizó; por defecto, comuna.

## 6. Interacción móvil

- Toque en comuna o provincia; sin dependencia de `hover`.
- Zoom por botones (región → provincia → comuna) y pellizco limitado; nunca zoom infinito.
- Lista sincronizada bajo el mapa: lo que se ve en el mapa se lee como lista (mismo orden), para pantallas pequeñas y lectores de pantalla.
- Panel inferior deslizable para el resumen de la comuna.

## 7. Accesibilidad

- Cada comuna es un elemento enfocable (`<a>` o `<button>`) con nombre accesible y estado.
- Navegación por teclado entre comunas (flechas o tabulación en orden geográfico razonable).
- El color nunca es el único indicador: número o etiqueta en cada capa.
- Alternativa textual completa: `/territorios` es el mismo índice sin mapa.

## 8. Rendimiento

TopoJSON cargado bajo demanda; SVG renderizado en servidor para la vista región (sin JS para el primer pintado); puntos en cliente solo en provincia o comuna; mapa de detalle cargado solo al abrir una ficha con dirección.

## 9. Reutilización desde Aplauzo

Se conserva el enfoque `d3.geoPath` + clases de estado por unidad + tooltip. Se cambia el atlas, la proyección, la interacción y se agregan capas, puntos, zoom, teclado y lista sincronizada. El componente se escribe de nuevo en TypeScript.
