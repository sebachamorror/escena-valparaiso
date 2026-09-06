/** Rotación de color de acento por slug, para el bloque de color de cada tarjeta. */
const PALETTE = ["pink", "lime", "gold", "sky", "violet", "mint"] as const;
export type PaletteColor = (typeof PALETTE)[number];

export function colorForSlug(slug: string): PaletteColor {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
