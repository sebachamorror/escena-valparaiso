import { describe, expect, it } from "vitest";
import { isPublishable } from "@/lib/data/visibility";
import { loadArtists, loadCompanies, loadEpisodes, loadTerritories, loadWorks } from "@/lib/data/load";

describe("datos versionados", () => {
  it("territorios: 8 provincias y 38 comunas con provincia válida", () => {
    const t = loadTerritories();
    expect(t.provinces).toHaveLength(8);
    expect(t.communes).toHaveLength(38);
    const provs = new Set(t.provinces.map((p) => p.slug));
    for (const c of t.communes) expect(provs.has(c.province)).toBe(true);
  });
  it("referencias cruzadas resuelven", () => {
    const communes = new Set(loadTerritories().communes.map((c) => c.slug));
    const companies = new Set(loadCompanies().map((c) => c.slug));
    const works = new Set(loadWorks().map((w) => w.slug));
    for (const a of loadArtists()) {
      expect(communes.has(a.commune)).toBe(true);
      for (const m of a.companies) expect(companies.has(m.company)).toBe(true);
      for (const w of a.works) expect(works.has(w.work)).toBe(true);
    }
    for (const e of loadEpisodes()) expect(communes.has(e.commune)).toBe(true);
  });
  it("nada publicado sin verificación", () => {
    for (const e of [...loadCompanies(), ...loadArtists(), ...loadWorks()]) {
      if (e.published) expect(isPublishable(e)).toBe(true);
    }
  });
});
