import Link from "next/link";
import type { Artist } from "@/lib/data/types";
import { communeName } from "@/lib/data/territories";
import { craftName } from "@/lib/data/vocab";
import { plainText } from "@/lib/markdown";
import { isPublishable } from "@/lib/data/visibility";
import { Avatar } from "@/components/ui/Avatar";
import styles from "./cards.module.css";

export function ArtistCard({ a }: { a: Artist }) {
  return (
    <article className={styles.card}>
      {!isPublishable(a) && <span className={styles.state}>En verificación</span>}
      <div className={styles.tags}><span>Artista</span><span>{communeName(a.commune)}</span></div>
      <div className={styles.row}>
        <Avatar name={a.name} size={48} />
        <h3>
          <Link href={`/artistas/${a.slug}`}>{a.name}</Link>
          {a.artistic_name && <span className="muted" style={{ display: "block", fontSize: "1rem", fontStyle: "italic" }}>{a.artistic_name}</span>}
        </h3>
      </div>
      <p className={styles.meta}>{a.crafts.map(craftName).join(" · ")}</p>
      {a.bio_md && <p className={styles.excerpt}>{plainText(a.bio_md, 160)}</p>}
    </article>
  );
}
