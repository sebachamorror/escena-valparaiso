# Geometría oficial

`valparaiso.topo.json` contiene la geometría de la Región de Valparaíso usada por `RegionMap` (`src/components/map/RegionMap.tsx`), generada desde la división político-administrativa oficial de Chile.

## Fuente

- **Capa:** División Político Administrativa (DPA) 2023.
- **Institución:** Grupo de Trabajo DPA de la IDE Chile (Subsecretaría de Desarrollo Regional y Administrativo — SUBDERE; Instituto Geográfico Militar — IGM; Dirección Nacional de Fronteras y Límites del Estado — DIFROL; Instituto Nacional de Estadísticas — INE), coordinado por la Secretaría Ejecutiva del SNIT, Ministerio de Bienes Nacionales.
- **Publicación:** 3 de agosto de 2023.
- **URL de descarga:** https://ide.subdere.gov.cl/descargas/SHP/Limite_DPA_03082023.rar (también indexada en el Geoportal de Chile: https://geoportal.cl/geoportal/catalog/36391/Divisi%C3%B3n%20Pol%C3%ADtica%20Administrativa%202023).
- **Fecha de descarga:** 5 de septiembre de 2026.
- **Formato de origen:** Shapefile (`COMUNAS_v1`, `PROVINCIAS_v1`), sistema de referencia SIRGAS-Chile (geográficas), escala de representación 1:50.000.
- **Licencia / condiciones de uso:** cartografía autorizada para circulación por Resolución N.º 87 de 2023 de la Dirección Nacional de Fronteras y Límites del Estado (DIFROL). Toda publicación derivada debe llevar la leyenda: «Autorizada su circulación por Resolución Nº 87 del 2023 de la Dirección Nacional de Fronteras y Límites del Estado» (se muestra en el pie del mapa, `RegionMap`). Los productos derivados no comprometen al Estado de Chile respecto de límites y fronteras (DFL N.º 83 de 1979, Ministerio de Relaciones Exteriores) y deben ser revisados por DIFROL antes de una publicación distinta de este uso editorial no oficial.
- **Cobertura:** no incluye el Territorio Antártico Chileno; para la Región de Valparaíso se excluyeron además las islas Desventuradas (San Félix y San Ambrosio, comuna de Valparaíso) por quedar fuera del recorte continental usado para el mapa regional.

## Procesamiento

Herramienta: `mapshaper` 0.7.59 (línea de comandos), a partir de `COMUNAS_v1.shp` y `PROVINCIAS_v1.shp`.

1. Filtrar `CUT_REG == "05"` (38 comunas de la Región de Valparaíso).
2. Unir cada comuna con `data/territories/comunas.json` por `CUT_COM`/`cut_code` para incorporar `slug`, `name`, `province_slug` e `insular`.
3. Separar Isla de Pascua y Juan Fernández en capas propias (recuadros); recortar el resto al bbox continental `-72.3,-34.3,-69.7,-31.7` (excluye Desventuradas).
4. Simplificar al 5 % (`-simplify 5% keep-shapes`) conservando la forma de la costa; `-clean` sobre las comunas continentales.
5. Disolver las comunas continentales por `province_slug` para obtener los polígonos de provincia (`-dissolve`), y unir con `data/territories/comunas.json` (provincias) por slug para `name`, `cut_code` e `insular`.
6. Exportar como TopoJSON con cuantización por defecto de mapshaper (arcos compartidos entre comunas vecinas), combinando las cuatro capas (`comunas`, `isla_de_pascua`, `juan_fernandez`, `provincias`) en un único archivo.

Resultado: 38 comunas (36 en la capa `comunas` con la geometría continental de Valparaíso recortada, más `isla_de_pascua` y `juan_fernandez` en capas separadas) y 7 provincias continentales (Isla de Pascua no se disuelve como polígono provincial: es una sola comuna insular). Tamaño final: ~46 KB, dentro del objetivo de docs/MAPA.md (< 150 KB).

## Uso en la aplicación

`src/lib/geo/load.ts` carga y decodifica el TopoJSON con `topojson-client` (`feature`, `mesh`) en el servidor; `src/components/map/RegionMap.tsx` lo dibuja con `d3-geo` (`geoMercator` + `geoPath`), sin cargar geometría en el cliente para la vista regional (renderizado en servidor, sin JavaScript para el primer pintado, según `docs/MAPA.md` §8).

## Pendiente

- Centroides de comuna en `data/territories/comunas.json` (`lat`/`lng`/`centroid_source`): se pueden calcular desde esta misma geometría (punto interior) cuando se necesiten para puntos de la capa "quiénes lo hacen" a nivel de comuna.
- Reemplazar por la próxima actualización oficial de la DPA si SUBDERE publica una versión posterior a agosto de 2023.
- Revisar con DIFROL antes de cualquier uso fuera de este contexto editorial (docs/MAPA.md, cartografía no oficial de referencia territorial).
