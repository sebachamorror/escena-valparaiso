import { normalize } from "@/lib/format";
import type { SearchDoc, SearchType } from "./types";

export interface SearchHit extends SearchDoc { score: number }
export interface SearchGroup { type: SearchType; hits: SearchHit[] }

const STOP = new Set(["de", "del", "la", "el", "los", "las", "en", "y", "a", "un", "una", "por", "para", "con"]);

export function tokenize(q: string): string[] {
  return normalize(q).split(/[^a-z0-9ñ]+/).filter((t) => t.length > 1 && !STOP.has(t));
}

/**
 * Búsqueda en memoria: coincidencia de tokens en título (peso alto) y cuerpo.
 * Todos los tokens deben aparecer en algún campo. Devuelve grupos por tipo.
 */
export function search(docs: SearchDoc[], q: string, types?: SearchType[]): SearchGroup[] {
  const tokens = tokenize(q);
  if (tokens.length === 0) return [];
  const hits: SearchHit[] = [];
  for (const d of docs) {
    if (types && types.length > 0 && !types.includes(d.type)) continue;
    let score = 0;
    let all = true;
    for (const t of tokens) {
      const inTitle = d.ntitle.includes(t);
      const inBody = d.haystack.includes(t);
      if (!inTitle && !inBody) { all = false; break; }
      score += inTitle ? 10 : 2;
      if (d.ntitle.startsWith(t)) score += 5;
    }
    if (!all) continue;
    if (d.ntitle === tokens.join(" ")) score += 20;
    hits.push({ ...d, score });
  }
  hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "es"));
  const order: SearchType[] = ["event", "company", "artist", "work", "venue", "episode", "territory", "craft"];
  const groups: SearchGroup[] = [];
  for (const type of order) {
    const g = hits.filter((h) => h.type === type);
    if (g.length) groups.push({ type, hits: g });
  }
  return groups;
}
