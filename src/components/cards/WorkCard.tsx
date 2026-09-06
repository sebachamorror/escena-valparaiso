import Link from "next/link";
import type { Work } from "@/lib/data/types";
import { communeName } from "@/lib/data/territories";
import { audienceName, disciplineName } from "@/lib/data/vocab";
import { plainText } from "@/lib/markdown";
import { isPublishable } from "@/lib/data/visibility";
import { colorForSlug } from "@/lib/palette";
import styles from "./cards.module.css";

export function WorkCard({ w, companyName }: { w: Work; companyName?: string }) {
  return (
    <article className={`${styles.card} ${styles[colorForSlug(w.slug)]}`}>
      {!isPublishable(w) && <span className={styles.state}>En verificación</span>}
      <div className={styles.tags}><span>Obra</span>{w.communes[0] && <span>{communeName(w.communes[0])}</span>}</div>
      <h3><Link href={`/obras/${w.slug}`}>{w.title}</Link></h3>
      <p className={styles.meta}>
        {companyName ? `${companyName} · ` : ""}
        {w.disciplines.map(disciplineName).join(" · ")}
        {w.audience ? ` · ${audienceName(w.audience)}` : ""}
        {w.premiere_year ? ` · ${w.premiere_year}` : ""}
      </p>
      {w.synopsis_md ? <p className={styles.excerpt}>{plainText(w.synopsis_md, 160)}</p> : w.authorship ? <p className={styles.excerpt}>De {w.authorship}</p> : null}
    </article>
  );
}
