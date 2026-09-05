export const SITE_NAME = "ESCENA VALPARAÍSO";
export const SITE_TAGLINE = "Descubre qué está pasando en la escena de tu región.";
export const SITE_DESCRIPTION =
  "Artes escénicas de la Región de Valparaíso: compañías, artistas, obras, espacios, cartelera, convocatorias, memoria y la serie De Cuento en Cuento. Un sistema territorial abierto para las 38 comunas y 8 provincias.";

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Secciones principales (docs/ARQUITECTURA.md §3). */
export const NAV = [
  { href: "/cartelera", label: "Cartelera" },
  { href: "/companias", label: "Compañías" },
  { href: "/artistas", label: "Artistas" },
  { href: "/obras", label: "Obras" },
  { href: "/territorios", label: "Territorios" },
  { href: "/convocatorias", label: "Convocatorias" },
  { href: "/editorial", label: "Editorial" },
  { href: "/oficios", label: "Oficios" },
  { href: "/formacion", label: "Formación" },
  { href: "/archivo", label: "Archivo" },
  { href: "/de-cuento-en-cuento", label: "De Cuento en Cuento" },
] as const;

export const NAV_TRANSVERSAL = [
  { href: "/buscar", label: "Buscar" },
  { href: "/mapa", label: "Mapa" },
  { href: "/espacios", label: "Espacios" },
  { href: "/participa", label: "Participa" },
] as const;
