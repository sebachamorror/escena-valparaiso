export const SITE_NAME = "QUINTA ESCENA";
export const SITE_TAGLINE = "Descubre qué está pasando en la escena de tu región.";
export const SITE_DESCRIPTION =
  "Artes escénicas de la Región de Valparaíso: compañías, artistas, obras, espacios, cartelera, convocatorias, memoria y la serie Quinta Escena Podcast. Un sistema territorial abierto para las 38 comunas y 8 provincias.";

/**
 * URL pública del sitio. Prioridad: NEXT_PUBLIC_SITE_URL (override explícito) →
 * VERCEL_PROJECT_PRODUCTION_URL en producción → VERCEL_URL (previews) →
 * localhost en desarrollo. Evita que un valor de ejemplo mal configurado en el
 * panel de Vercel quede horneado en el sitemap o las URLs canónicas.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const prodUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (process.env.VERCEL_ENV === "production" && prodUrl) return `https://${prodUrl}`;
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;
  return "http://localhost:3000";
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
  { href: "/quinta-escena-podcast", label: "Quinta Escena Podcast" },
] as const;

export const NAV_TRANSVERSAL = [
  { href: "/buscar", label: "Buscar" },
  { href: "/mapa", label: "Mapa" },
  { href: "/espacios", label: "Espacios" },
  { href: "/participa", label: "Participa" },
] as const;
