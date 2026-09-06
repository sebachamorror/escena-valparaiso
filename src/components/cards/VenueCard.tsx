import Link from "next/link";
import type { Venue } from "@/lib/data/types";
import { communeName } from "@/lib/data/territories";
import { isPublishable } from "@/lib/data/visibility";
import { colorForSlug } from "@/lib/palette";
import styles from "./cards.module.css";

const VENUE_TYPE_LABEL: Record<string, string> = {
  teatro: "Teatro", "centro-cultural": "Centro cultural", sala: "Sala",
  "espacio-independiente": "Espacio independiente", escuela: "Escuela", museo: "Museo",
  "espacio-publico": "Espacio público", "no-convencional": "Lugar no convencional",
};

export function VenueCard({ v }: { v: Venue }) {
  return (
    <article className={`${styles.card} ${styles[colorForSlug(v.slug)]}`}>
      {!isPublishable(v) && <span className={styles.state}>En verificación</span>}
      <div className={styles.tags}><span>{VENUE_TYPE_LABEL[v.venue_type] ?? v.venue_type}</span><span>{communeName(v.place.commune)}</span></div>
      <h3><Link href={`/espacios/${v.slug}`}>{v.short_name ?? v.name}</Link></h3>
      {v.place.address && <p className={styles.meta}>{v.place.address}</p>}
      {v.description_md && <p className={styles.excerpt}>{v.description_md.replace(/[*_]/g, "").slice(0, 160)}{v.description_md.length > 160 ? "…" : ""}</p>}
    </article>
  );
}
