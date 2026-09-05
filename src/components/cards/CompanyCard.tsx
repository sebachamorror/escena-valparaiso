import Link from "next/link";
import type { Company } from "@/lib/data/types";
import { communeName } from "@/lib/data/territories";
import { disciplineName, STATUS_LABEL } from "@/lib/data/vocab";
import { plainText } from "@/lib/markdown";
import { isPublishable } from "@/lib/data/visibility";
import styles from "./cards.module.css";

export function CompanyCard({ c }: { c: Company }) {
  return (
    <article className={styles.card}>
      {!isPublishable(c) && <span className={styles.state}>En verificación</span>}
      <div className={styles.tags}><span>Compañía</span><span>{communeName(c.commune)}</span></div>
      <h3><Link href={`/companias/${c.slug}`}>{c.name}</Link></h3>
      <p className={styles.meta}>
        {c.disciplines.map(disciplineName).join(" · ")}
        {c.founded_year ? ` · desde ${c.founded_year}` : ""}
        {c.status !== "activa" ? ` · ${STATUS_LABEL[c.status]}` : ""}
      </p>
      {c.description_md && <p className={styles.excerpt}>{plainText(c.description_md, 180)}</p>}
    </article>
  );
}
