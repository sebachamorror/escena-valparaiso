import Link from "next/link";
import type { Episode } from "@/lib/data/types";
import { communeName, getProvince, provinceShortName } from "@/lib/data/territories";
import { disciplineName } from "@/lib/data/vocab";
import { episodeUrl, EPISODE_STATUS_LABEL } from "@/lib/queries/series";
import styles from "./cards.module.css";

export function EpisodeCard({ e, protagonistName }: { e: Episode; protagonistName?: string | null }) {
  const prov = getProvince(e.province);
  return (
    <article className={`${styles.card} ${styles.episode}`}>
      <span className={styles.epNum} aria-hidden="true">{e.number}</span>
      <span className={styles.epTramo}>{e.tramo} · {prov ? provinceShortName(prov) : e.province}</span>
      <h3><Link href={episodeUrl(e)}>Episodio {e.number}: {communeName(e.commune)}</Link></h3>
      <p className={styles.meta}>
        {e.narrative_axis} · {disciplineName(e.discipline)}
        {protagonistName ? ` · ${protagonistName}` : ""}
      </p>
      <p className={styles.count}>{EPISODE_STATUS_LABEL[e.status] ?? e.status}</p>
    </article>
  );
}
