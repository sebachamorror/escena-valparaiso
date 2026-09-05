import { cache } from "react";
import { loadArtists, loadCompanies, loadWorks } from "@/lib/data/load";
import { isVisible } from "@/lib/data/visibility";
import { communesOfProvince, getCommune } from "@/lib/data/territories";
import type { Artist, Company, Work } from "@/lib/data/types";

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, "es");
const byTitle = (a: { title: string }, b: { title: string }) => a.title.localeCompare(b.title, "es");

/* ---------- Compañías ---------- */

export const listCompanies = cache((): Company[] => loadCompanies().filter(isVisible).sort(byName));

export const getCompany = cache((slug: string): Company | undefined =>
  listCompanies().find((c) => c.slug === slug),
);

export const companiesInCommune = cache((commune: string): Company[] =>
  listCompanies().filter((c) => c.commune === commune || c.other_communes.includes(commune)),
);

export const companiesInProvince = cache((province: string): Company[] => {
  const communes = new Set(communesOfProvince(province).map((c) => c.slug));
  return listCompanies().filter((c) => communes.has(c.commune));
});

/* ---------- Artistas ---------- */

export const listArtists = cache((): Artist[] => loadArtists().filter(isVisible).sort(byName));

export const getArtist = cache((slug: string): Artist | undefined =>
  listArtists().find((a) => a.slug === slug),
);

export const artistsInCommune = cache((commune: string): Artist[] =>
  listArtists().filter((a) => a.commune === commune),
);

export const artistsInProvince = cache((province: string): Artist[] => {
  const communes = new Set(communesOfProvince(province).map((c) => c.slug));
  return listArtists().filter((a) => communes.has(a.commune));
});

export const artistsWithCraft = cache((craft: string): Artist[] =>
  listArtists().filter((a) => a.crafts.includes(craft)),
);

export const artistsOfCompany = cache((companySlug: string): { artist: Artist; role: string }[] => {
  const out: { artist: Artist; role: string }[] = [];
  for (const a of listArtists()) {
    for (const m of a.companies) {
      if (m.company === companySlug) out.push({ artist: a, role: m.role });
    }
  }
  return out;
});

/* ---------- Obras ---------- */

export const listWorks = cache((): Work[] => loadWorks().filter(isVisible).sort(byTitle));

export const getWork = cache((slug: string): Work | undefined => listWorks().find((w) => w.slug === slug));

export const worksOfCompany = cache((companySlug: string): Work[] =>
  listWorks().filter((w) => w.companies.includes(companySlug)),
);

export const worksOfArtist = cache((artistSlug: string): { work: Work; role: string }[] => {
  const out: { work: Work; role: string }[] = [];
  for (const w of listWorks()) {
    for (const c of w.credits) {
      if (c.artist === artistSlug) out.push({ work: w, role: c.role });
    }
  }
  return out;
});

export const worksInCommune = cache((commune: string): Work[] =>
  listWorks().filter((w) => w.communes.includes(commune)),
);

export const worksInProvince = cache((province: string): Work[] => {
  const communes = new Set(communesOfProvince(province).map((c) => c.slug));
  return listWorks().filter((w) => w.communes.some((c) => communes.has(c)));
});

/* ---------- Conteos por territorio ---------- */

export interface TerritoryCounts { companies: number; artists: number; works: number; episodes: number; total: number }

export const countsForCommune = cache((commune: string, episodes = 0): TerritoryCounts => {
  const companies = companiesInCommune(commune).length;
  const artists = artistsInCommune(commune).length;
  const works = worksInCommune(commune).length;
  return { companies, artists, works, episodes, total: companies + artists + works + episodes };
});

export const countsForProvince = cache((province: string, episodes = 0): TerritoryCounts => {
  const companies = companiesInProvince(province).length;
  const artists = artistsInProvince(province).length;
  const works = worksInProvince(province).length;
  return { companies, artists, works, episodes, total: companies + artists + works + episodes };
});

/** Provincia de una entidad a partir de su comuna de sede. */
export function provinceOf(commune: string): string | undefined {
  return getCommune(commune)?.province;
}
