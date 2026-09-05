import type { Verifiable } from "./types";

/** Umbral de publicación (docs/CRITERIOS_VERIFICACION.md §3). */
export const PUBLISH_THRESHOLD = 70;

/** Publicable: verificado, score ≥ 70 y publicación explícita. */
export function isPublishable(e: Verifiable): boolean {
  return (
    e.published === true &&
    e.verification.status === "verificado" &&
    e.verification.confidence_score >= PUBLISH_THRESHOLD
  );
}

/**
 * Modo previsualización de equipo. Muestra fichas pendientes con etiqueta
 * "en verificación" y noindex. En desarrollo está activo por defecto;
 * en producción solo si ESCENA_PREVIEW=1.
 */
export function previewEnabled(): boolean {
  const v = process.env.ESCENA_PREVIEW;
  if (v !== undefined && v !== "") return v === "1" || v === "true";
  return process.env.NODE_ENV !== "production";
}

/** Visible en esta build: publicable, o pendiente en modo previsualización. */
export function isVisible(e: Verifiable): boolean {
  if (isPublishable(e)) return true;
  if (!previewEnabled()) return false;
  return e.verification.status !== "rechazado";
}

/** Una ficha visible pero no publicable se indexa con noindex. */
export function isIndexable(e: Verifiable): boolean {
  return isPublishable(e);
}
