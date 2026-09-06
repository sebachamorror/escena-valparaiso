/** Tipos y etiquetas del buscador. Sin dependencias de servidor: se usa en cliente. */
export type SearchType = "company" | "artist" | "work" | "episode" | "territory" | "craft" | "venue" | "event";

export interface SearchDoc {
  type: SearchType;
  url: string;
  title: string;
  subtitle: string;
  /** Texto normalizado para buscar (título + subtítulo + cuerpo). */
  haystack: string;
  /** Título normalizado, para priorizar coincidencias. */
  ntitle: string;
  commune?: string;
  province?: string;
}

export const SEARCH_TYPE_LABEL: Record<SearchType, string> = {
  company: "Compañías",
  artist: "Artistas",
  work: "Obras",
  episode: "Quinta Escena Podcast",
  territory: "Territorios",
  craft: "Oficios",
  venue: "Espacios",
  event: "Cartelera",
};
