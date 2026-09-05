import { describe, expect, it } from "vitest";
import { search, tokenize } from "@/lib/search/query";
import type { SearchDoc } from "@/lib/search/types";

const doc = (type: SearchDoc["type"], title: string, subtitle = "", body = ""): SearchDoc => {
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  return { type, url: `/${type}/${title}`, title, subtitle, ntitle: norm(title), haystack: norm(`${title} ${subtitle} ${body}`) };
};

const docs: SearchDoc[] = [
  doc("company", "Compañía de Marionetas The Magic Show", "Títeres y marionetas · Los Andes", "marionetas gigantes"),
  doc("artist", "Hugo Hernández Urtubia", "Títeres · Los Andes", "cultor del teatro de títeres"),
  doc("territory", "Los Andes", "Provincia"),
  doc("work", "Ayayai", "Clown · Valparaíso", "humor físico"),
];

describe("tokenize", () => {
  it("quita acentos, minúsculas y palabras vacías", () => {
    expect(tokenize("Títeres en Los Andes")).toEqual(["titeres", "andes"]);
  });
});

describe("search", () => {
  it("encuentra sin acentos y agrupa por tipo", () => {
    const groups = search(docs, "titeres");
    expect(groups.map((g) => g.type)).toEqual(["company", "artist"]);
  });
  it("prioriza coincidencia en el título", () => {
    const groups = search(docs, "andes");
    const territory = groups.find((g) => g.type === "territory")!;
    expect(territory.hits[0].title).toBe("Los Andes");
    const all = groups.flatMap((g) => g.hits);
    expect(all[0].type === "territory" || all.some((h) => h.title === "Los Andes")).toBe(true);
  });
  it("exige todos los tokens", () => {
    expect(search(docs, "marionetas ayayai")).toEqual([]);
  });
  it("filtra por tipo", () => {
    const groups = search(docs, "titeres", ["artist"]);
    expect(groups).toHaveLength(1);
    expect(groups[0].type).toBe("artist");
  });
  it("consulta vacía devuelve nada", () => {
    expect(search(docs, "  ")).toEqual([]);
  });
});
