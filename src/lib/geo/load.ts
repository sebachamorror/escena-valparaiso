import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { feature, mesh } from "topojson-client";
import type { GeometryCollection, GeometryObject, Topology } from "topojson-specification";
import type { Feature, FeatureCollection, MultiLineString, MultiPolygon, Polygon } from "geojson";

/** Propiedades escritas por scripts de public/geo/FUENTES.md (mapshaper). */
export interface CommuneProps { slug: string; name: string; province_slug: string; cut_code: string; insular: string }
export interface ProvinceProps { slug: string; name: string; insular: string }

type Geom = Polygon | MultiPolygon;
export type CommuneFeature = Feature<Geom, CommuneProps>;
export type ProvinceFeature = Feature<Geom, ProvinceProps>;

type RegionTopology = Topology<{
  comunas: GeometryCollection<CommuneProps>;
  isla_de_pascua: GeometryCollection<CommuneProps>;
  juan_fernandez: GeometryCollection<CommuneProps>;
  provincias: GeometryCollection<ProvinceProps>;
}>;

export interface RegionGeo {
  /** Comunas continentales (Valparaíso recortada al bbox continental: sin islas Desventuradas). */
  communes: FeatureCollection<Geom, CommuneProps>;
  provinces: FeatureCollection<Geom, ProvinceProps>;
  islaDePascua: FeatureCollection<Geom, CommuneProps>;
  juanFernandez: FeatureCollection<Geom, CommuneProps>;
  /** Límites entre provincias (malla interior). */
  provinceMesh: MultiLineString;
  /** Contorno exterior del continente regional. */
  outline: MultiLineString;
}

const GEO_FILE = path.join(process.cwd(), "public", "geo", "valparaiso.topo.json");

/** Carga la geometría oficial procesada. Devuelve null si aún no se descargó (ver public/geo/FUENTES.md). */
export const loadRegionGeo = cache((): RegionGeo | null => {
  if (!fs.existsSync(GEO_FILE)) return null;
  const topo = JSON.parse(fs.readFileSync(GEO_FILE, "utf8")) as RegionTopology;
  const communes = feature(topo, topo.objects.comunas) as FeatureCollection<Geom, CommuneProps>;
  const provinces = feature(topo, topo.objects.provincias) as FeatureCollection<Geom, ProvinceProps>;
  const islaDePascua = feature(topo, topo.objects.isla_de_pascua) as FeatureCollection<Geom, CommuneProps>;
  const juanFernandez = feature(topo, topo.objects.juan_fernandez) as FeatureCollection<Geom, CommuneProps>;
  const provinceOf = (g: GeometryObject): string | undefined => (g.properties as CommuneProps | undefined)?.province_slug;
  const provinceMesh = mesh(topo, topo.objects.comunas, (a, b) => a !== b && provinceOf(a) !== provinceOf(b));
  const outline = mesh(topo, topo.objects.comunas, (a, b) => a === b);
  return { communes, provinces, islaDePascua, juanFernandez, provinceMesh, outline };
});
