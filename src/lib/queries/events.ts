import { cache } from "react";
import { loadEvents } from "@/lib/data/load";
import { isVisible } from "@/lib/data/visibility";
import { communesOfProvince } from "@/lib/data/territories";
import { getVenue } from "@/lib/queries/venues";
import type { EventEntity, Occurrence } from "@/lib/data/types";

export interface UpcomingOccurrence { event: EventEntity; occurrence: Occurrence; commune: string | null }

/** Solo funciones visibles con al menos una fecha futura (docs/CRITERIOS_VERIFICACION.md: las vencidas se ocultan). */
export const listUpcomingOccurrences = cache((): UpcomingOccurrence[] => {
  const now = Date.now();
  const out: UpcomingOccurrence[] = [];
  for (const e of loadEvents().filter(isVisible)) {
    for (const occ of e.occurrences) {
      const t = Date.parse(occ.starts_at);
      if (Number.isNaN(t) || t < now) continue;
      const commune = occ.venue ? (getVenue(occ.venue)?.place.commune ?? null) : (occ.place?.commune ?? null);
      out.push({ event: e, occurrence: occ, commune });
    }
  }
  out.sort((a, b) => Date.parse(a.occurrence.starts_at) - Date.parse(b.occurrence.starts_at));
  return out;
});

export const upcomingInCommune = cache((commune: string): UpcomingOccurrence[] =>
  listUpcomingOccurrences().filter((o) => o.commune === commune),
);

export const upcomingInProvince = cache((province: string): UpcomingOccurrence[] => {
  const communes = new Set(communesOfProvince(province).map((c) => c.slug));
  return listUpcomingOccurrences().filter((o) => o.commune && communes.has(o.commune));
});

export const getEvent = cache((slug: string): EventEntity | undefined =>
  loadEvents().filter(isVisible).find((e) => e.slug === slug),
);
