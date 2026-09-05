import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import type {
  Artist, Company, Episode, EventEntity, Posta, Series, Territories, Venue, Vocabularies, Work,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

function readJson<T>(relative: string): T {
  const file = path.join(DATA_DIR, relative);
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

function readCollection<T extends { slug: string }>(folder: string): T[] {
  const dir = path.join(DATA_DIR, folder);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as T);
}

/** Colecciones crudas (sin filtro de visibilidad). Usar a través de src/lib/queries. */
export const loadCompanies = cache((): Company[] => readCollection<Company>("companies"));
export const loadArtists = cache((): Artist[] => readCollection<Artist>("artists"));
export const loadWorks = cache((): Work[] => readCollection<Work>("works"));
export const loadTerritories = cache((): Territories => readJson<Territories>("territories/comunas.json"));
export const loadVocabularies = cache((): Vocabularies => readJson<Vocabularies>("schemas/vocabularios.json"));
export const loadSeries = cache((): Series => readJson<Series>("de-cuento-en-cuento/serie.json"));
export const loadEpisodes = cache((): Episode[] =>
  readJson<Episode[]>("de-cuento-en-cuento/episodios.json").slice().sort((a, b) => a.number - b.number),
);
export const loadPosta = cache((): Posta => readJson<Posta>("de-cuento-en-cuento/posta.json"));

export const loadVenues = cache((): Venue[] => readCollection<Venue>("venues"));
export const loadEvents = cache((): EventEntity[] => readCollection<EventEntity>("events"));

/** Colecciones aún sin datos (se llenan con investigaciones futuras). */
export const loadCalls = cache((): { slug: string }[] => readCollection("calls"));
export const loadArchive = cache((): { slug: string }[] => readCollection("archive"));
