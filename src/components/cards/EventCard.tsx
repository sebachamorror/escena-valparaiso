import Link from "next/link";
import type { UpcomingOccurrence } from "@/lib/queries/events";
import { getVenue } from "@/lib/queries/venues";
import { communeName } from "@/lib/data/territories";
import { colorForSlug } from "@/lib/palette";
import styles from "./cards.module.css";

const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function formatOccurrence(iso: string): string {
  const d = new Date(iso);
  const day = WEEKDAYS[d.getDay()];
  const date = d.toLocaleDateString("es-CL", { day: "numeric", month: "long", timeZone: "America/Santiago" });
  const time = d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Santiago" });
  return `${day} ${date} · ${time} hrs`;
}

export function EventCard({ item }: { item: UpcomingOccurrence }) {
  const { event, occurrence } = item;
  const venue = occurrence.venue ? getVenue(occurrence.venue) : undefined;
  return (
    <article className={`${styles.card} ${styles[colorForSlug(event.slug)]}`}>
      <div className={styles.tags}>
        <span>{event.kind === "funcion" ? "Función" : event.kind}</span>
        {item.commune && <span>{communeName(item.commune)}</span>}
      </div>
      <h3><Link href={`/cartelera/${event.slug}`}>{event.title}</Link></h3>
      <p className={styles.meta}>
        {occurrence.time_unknown ? new Date(occurrence.starts_at).toLocaleDateString("es-CL", { day: "numeric", month: "long", timeZone: "America/Santiago" }) : formatOccurrence(occurrence.starts_at)}
        {venue && <> · <Link href={`/espacios/${venue.slug}`}>{venue.short_name ?? venue.name}</Link></>}
      </p>
      {(occurrence.price ?? event.price) && <p className={styles.meta}>{event.is_free ? "Entrada liberada" : occurrence.price ?? event.price}</p>}
      {event.description_md && <p className={styles.excerpt}>{event.description_md.replace(/[*_]/g, "").slice(0, 140)}{event.description_md.length > 140 ? "…" : ""}</p>}
    </article>
  );
}
