import { cache } from "react";
import { loadEpisodes, loadPosta, loadSeries } from "@/lib/data/load";
import type { Episode } from "@/lib/data/types";

export const getSeries = cache(() => loadSeries());
export const listEpisodes = cache((): Episode[] => loadEpisodes());
export const getPosta = cache(() => loadPosta());

/** Slug de URL: "dcc-01-los-andes" → "1-los-andes". */
export function episodeUrlSlug(ep: Episode): string {
  return `${ep.number}-${ep.commune}`;
}

export function episodeUrl(ep: Episode): string {
  return `/de-cuento-en-cuento/episodios/${episodeUrlSlug(ep)}`;
}

export const getEpisodeByUrlSlug = cache((urlSlug: string): Episode | undefined => {
  const m = /^(\d+)-/.exec(urlSlug);
  if (!m) return undefined;
  const n = Number(m[1]);
  const ep = listEpisodes().find((e) => e.number === n);
  return ep && episodeUrlSlug(ep) === urlSlug ? ep : undefined;
});

export const getEpisodeBySlug = cache((slug: string): Episode | undefined =>
  listEpisodes().find((e) => e.slug === slug),
);

export const episodesInCommune = cache((commune: string): Episode[] =>
  listEpisodes().filter((e) => e.commune === commune),
);

export const episodesInProvince = cache((province: string): Episode[] =>
  listEpisodes().filter((e) => e.province === province),
);

export const episodesOfArtist = cache((artistSlug: string): Episode[] =>
  listEpisodes().filter((e) => e.protagonist_artist === artistSlug),
);

export const episodesOfCompany = cache((companySlug: string): Episode[] =>
  listEpisodes().filter(
    (e) => e.protagonist_company === companySlug || e.related.some((r) => r.type === "company" && r.slug === companySlug),
  ),
);

/** Disciplina de episodio → oficios relacionados (para /oficios). */
export const DISCIPLINE_TO_CRAFTS: Record<string, string[]> = {
  titeres: ["titeres"],
  clown: ["circo", "actuacion"],
  circo: ["circo"],
  teatro: ["actuacion", "direccion"],
  "narracion-oral": ["narracion-oral"],
};

export const episodesForCraft = cache((craft: string): Episode[] =>
  listEpisodes().filter((e) => (DISCIPLINE_TO_CRAFTS[e.discipline] ?? []).includes(craft)),
);

export const EPISODE_STATUS_LABEL: Record<string, string> = {
  planificado: "En preparación",
  "en-produccion": "En producción",
  publicado: "Publicado",
};
