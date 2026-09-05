"use client";

/**
 * Eventos de analítica (docs/ARQUITECTURA.md §8). Sin script de Plausible cargado,
 * los eventos se descartan en silencio. Toda llamada lleva la dimensión territory.
 */
type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window { plausible?: (event: string, opts?: { props?: Props }) => void }
}

export function track(event: string, props: Props = {}): void {
  if (typeof window === "undefined" || typeof window.plausible !== "function") return;
  const clean: Props = {};
  for (const [k, v] of Object.entries(props)) if (v !== undefined) clean[k] = v;
  window.plausible(event, { props: clean });
}
