import { cache } from "react";
import { listArtists, listCompanies, listWorks } from "@/lib/queries/entities";
import { listEpisodes, episodeUrl } from "@/lib/queries/series";
import { listCommunes, listProvinces, communeUrl, provinceUrl, provinceShortName, communeName } from "@/lib/data/territories";
import { craftName, disciplineName, listCrafts } from "@/lib/data/vocab";
import { plainText } from "@/lib/markdown";
import { normalize } from "@/lib/format";

import type { SearchDoc } from "./types";
export type { SearchDoc, SearchType } from "./types";
export { SEARCH_TYPE_LABEL } from "./types";

function doc(d: Omit<SearchDoc, "haystack" | "ntitle"> & { body?: string }): SearchDoc {
  const { body = "", ...rest } = d;
  return {
    ...rest,
    ntitle: normalize(rest.title),
    haystack: normalize([rest.title, rest.subtitle, body].join(" ")),
  };
}

/** Índice de búsqueda construido en el servidor desde data/. */
export const buildSearchIndex = cache((): SearchDoc[] => {
  const docs: SearchDoc[] = [];

  for (const c of listCompanies()) {
    docs.push(doc({
      type: "company", url: `/companias/${c.slug}`, title: c.name,
      subtitle: `${c.disciplines.map(disciplineName).join(", ")} · ${communeName(c.commune)}`,
      body: [c.description_md, c.trajectory_md, c.members_text.join(" "), c.tags.join(" ")].filter(Boolean).join(" "),
      commune: c.commune,
    }));
  }
  for (const a of listArtists()) {
    docs.push(doc({
      type: "artist", url: `/artistas/${a.slug}`, title: a.artistic_name ? `${a.name} (${a.artistic_name})` : a.name,
      subtitle: `${a.crafts.map(craftName).join(", ")} · ${communeName(a.commune)}`,
      body: [a.bio_md, a.trajectory_md, a.specialties.join(" "), a.disciplines.map(disciplineName).join(" ")].filter(Boolean).join(" "),
      commune: a.commune,
    }));
  }
  for (const w of listWorks()) {
    docs.push(doc({
      type: "work", url: `/obras/${w.slug}`, title: w.title,
      subtitle: `${w.disciplines.map(disciplineName).join(", ")}${w.communes[0] ? ` · ${communeName(w.communes[0])}` : ""}`,
      body: [w.synopsis_md, w.authorship, w.direction, w.credits.map((c) => c.name).join(" "), w.history_text.join(" ")].filter(Boolean).join(" "),
      commune: w.communes[0],
    }));
  }
  for (const e of listEpisodes()) {
    docs.push(doc({
      type: "episode", url: episodeUrl(e), title: `Episodio ${e.number} · ${e.title}`,
      subtitle: `${e.tramo ?? ""} · ${disciplineName(e.discipline)} · ${communeName(e.commune)}`,
      body: [e.narrative_axis, e.natural_location, plainText(e.synopsis_md, 400)].filter(Boolean).join(" "),
      commune: e.commune, province: e.province,
    }));
  }
  for (const p of listProvinces()) {
    docs.push(doc({ type: "territory", url: provinceUrl(p.slug), title: p.name, subtitle: "Provincia · Región de Valparaíso", body: provinceShortName(p), province: p.slug }));
  }
  for (const c of listCommunes()) {
    docs.push(doc({ type: "territory", url: communeUrl(c.slug), title: c.name, subtitle: `Comuna · Provincia de ${provinceShortName({ ...c, name: c.province, region: "", cut_code: "", sort: 0, capital: null }) }`, commune: c.slug, province: c.province }));
  }
  for (const cr of listCrafts()) {
    docs.push(doc({ type: "craft", url: `/oficios/${cr.slug}`, title: cr.name, subtitle: "Oficio escénico" }));
  }
  return docs;
});
