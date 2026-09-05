import { cache } from "react";
import { loadVenues } from "@/lib/data/load";
import { isVisible } from "@/lib/data/visibility";
import { communesOfProvince } from "@/lib/data/territories";
import type { Venue } from "@/lib/data/types";

const byName = (a: Venue, b: Venue) => a.name.localeCompare(b.name, "es");

export const listVenues = cache((): Venue[] => loadVenues().filter(isVisible).sort(byName));

export const getVenue = cache((slug: string): Venue | undefined =>
  listVenues().find((v) => v.slug === slug),
);

export const venuesInCommune = cache((commune: string): Venue[] =>
  listVenues().filter((v) => v.place.commune === commune),
);

export const venuesInProvince = cache((province: string): Venue[] => {
  const communes = new Set(communesOfProvince(province).map((c) => c.slug));
  return listVenues().filter((v) => communes.has(v.place.commune));
});
