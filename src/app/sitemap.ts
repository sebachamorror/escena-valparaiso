import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { isPublishable } from "@/lib/data/visibility";
import { loadArtists, loadCompanies, loadWorks } from "@/lib/data/load";
import { listProvinces, communesOfProvince, provinceUrl, communeUrl } from "@/lib/data/territories";
import { countsForCommune, countsForProvince } from "@/lib/queries/entities";
import { listEpisodes, episodeUrl, episodesInCommune, episodesInProvince } from "@/lib/queries/series";
import { listCrafts } from "@/lib/data/vocab";

/**
 * Solo páginas publicadas (docs/SEO.md §1 y §6). Las fichas pendientes no existen
 * para los buscadores aunque el modo previsualización las muestre.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const out: MetadataRoute.Sitemap = [];
  const add = (path: string, priority = 0.5, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly") =>
    out.push({ url: absoluteUrl(path), priority, changeFrequency });

  add("/", 1, "daily");
  for (const p of ["/buscar", "/mapa", "/cartelera", "/companias", "/artistas", "/obras", "/espacios", "/territorios", "/convocatorias", "/editorial", "/oficios", "/formacion", "/archivo", "/de-cuento-en-cuento", "/de-cuento-en-cuento/la-posta", "/de-cuento-en-cuento/protagonistas", "/participa", "/datos"]) add(p, 0.7);

  for (const c of loadCompanies().filter(isPublishable)) add(`/companias/${c.slug}`, 0.8);
  for (const a of loadArtists().filter(isPublishable)) add(`/artistas/${a.slug}`, 0.8);
  for (const w of loadWorks().filter(isPublishable)) add(`/obras/${w.slug}`, 0.7);
  for (const e of listEpisodes()) add(episodeUrl(e), 0.8);
  for (const cr of listCrafts()) add(`/oficios/${cr.slug}`, 0.4, "monthly");

  // Territorios: solo los que tienen al menos una entidad publicable o un episodio.
  const publishableCommunes = new Set<string>();
  for (const c of loadCompanies().filter(isPublishable)) publishableCommunes.add(c.commune);
  for (const a of loadArtists().filter(isPublishable)) publishableCommunes.add(a.commune);
  for (const w of loadWorks().filter(isPublishable)) for (const c of w.communes) publishableCommunes.add(c);
  for (const p of listProvinces()) {
    const communes = communesOfProvince(p.slug);
    const hasContent = communes.some((c) => publishableCommunes.has(c.slug)) || episodesInProvince(p.slug).length > 0 || countsForProvince(p.slug).total > 0 && false;
    if (hasContent) add(provinceUrl(p.slug), 0.7);
    for (const c of communes) {
      if (publishableCommunes.has(c.slug) || episodesInCommune(c.slug).length > 0 || countsForCommune(c.slug).total > 0 && false) add(communeUrl(c.slug), 0.6);
    }
  }
  return out;
}
