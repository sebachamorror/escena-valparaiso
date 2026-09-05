import { cache } from "react";
import { loadTerritories } from "./load";
import type { Commune, Province } from "./types";

export const getRegion = cache(() => loadTerritories().region);

export const listProvinces = cache((): Province[] =>
  loadTerritories().provinces.slice().sort((a, b) => a.sort - b.sort),
);

export const listCommunes = cache((): Commune[] =>
  loadTerritories().communes.slice().sort((a, b) => a.name.localeCompare(b.name, "es")),
);

export const getProvince = cache((slug: string): Province | undefined =>
  loadTerritories().provinces.find((p) => p.slug === slug),
);

export const getCommune = cache((slug: string): Commune | undefined =>
  loadTerritories().communes.find((c) => c.slug === slug),
);

export const communesOfProvince = cache((provinceSlug: string): Commune[] =>
  listCommunes().filter((c) => c.province === provinceSlug),
);

export function provinceOfCommune(communeSlug: string): Province | undefined {
  const c = getCommune(communeSlug);
  return c ? getProvince(c.province) : undefined;
}

/** Nombre corto de provincia: "Provincia de Los Andes" → "Los Andes". */
export function provinceShortName(p: Province): string {
  return p.name.replace(/^Provincia de /, "");
}

export function communeName(slug: string): string {
  return getCommune(slug)?.name ?? slug;
}

/** URLs de territorio. Las comunas cuelgan de su provincia para evitar
 * colisiones de slug (Valparaíso, Quillota, San Antonio, Petorca, Los Andes, Isla de Pascua). */
export function provinceUrl(slug: string): string {
  return `/territorios/${slug}`;
}

export function communeUrl(slug: string): string {
  const c = getCommune(slug);
  return c ? `/territorios/${c.province}/${c.slug}` : `/territorios`;
}
