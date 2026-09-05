import { loadVocabularies } from "./load";
import type { VocabTerm } from "./types";

type VocabKey = "disciplines" | "venue_types" | "call_types" | "crafts" | "audiences" | "modalities";

function term(key: VocabKey, slug: string): VocabTerm | undefined {
  return loadVocabularies()[key].find((t) => t.slug === slug);
}

export function disciplineName(slug: string): string {
  return term("disciplines", slug)?.name ?? slug;
}

export function craftName(slug: string): string {
  return term("crafts", slug)?.name ?? slug;
}

export function audienceName(slug: string): string {
  return term("audiences", slug)?.name ?? slug;
}

export function listCrafts(): VocabTerm[] {
  return loadVocabularies().crafts;
}

export function listDisciplines(): VocabTerm[] {
  return loadVocabularies().disciplines;
}

export const STATUS_LABEL: Record<string, string> = {
  activa: "Activa",
  inactiva: "Inactiva",
  desaparecida: "Desaparecida",
  desconocido: "Actividad por confirmar",
};

export const SOURCE_TYPE_LABEL: Record<string, string> = {
  oficial: "Fuente oficial",
  institucional: "Fuente institucional",
  prensa: "Prensa",
  academico: "Publicación académica",
  "red-social": "Red social oficial",
  directorio: "Directorio",
  testimonio: "Testimonio",
  "documento-proyecto": "Documento del proyecto",
  otro: "Otra fuente",
};
