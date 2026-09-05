import Link from "next/link";
import type { PostaHandover } from "@/lib/data/types";
import { communeName } from "@/lib/data/territories";
import { getEpisodeBySlug, episodeUrl } from "@/lib/queries/series";
import { Markdown } from "@/lib/markdown";
import { formatDate } from "@/lib/format";
import styles from "./dcc.module.css";

/** Línea de las siete entregas. Objeto y mensaje solo aparecen cuando ocurren. */
export function PostaTimeline({ handovers }: { handovers: PostaHandover[] }) {
  return (
    <ol className={styles.posta}>
      {handovers.map((h) => {
        const from = getEpisodeBySlug(h.from_episode);
        const to = h.to_episode ? getEpisodeBySlug(h.to_episode) : undefined;
        return (
          <li key={h.n} className={styles.postaItem}>
            <h3>
              Entrega {h.n}: {from ? <Link href={episodeUrl(from)}>{communeName(h.from_commune)}</Link> : communeName(h.from_commune)}
              {" → "}
              {h.to_commune ? (to ? <Link href={episodeUrl(to)}>{communeName(h.to_commune)}</Link> : communeName(h.to_commune)) : "cierre de temporada"}
            </h3>
            <p className={styles.postaMeta}>
              {h.status === "pendiente" ? "Pendiente" : h.status}
              {h.handed_at ? ` · entregado el ${formatDate(h.handed_at)}` : ""}
              {h.received_at ? ` · recibido el ${formatDate(h.received_at)}` : ""}
            </p>
            {(h.object || h.message_md) && (
              <div className={styles.postaBox}>
                {h.object && <p><strong>Objeto:</strong> {h.object}</p>}
                {h.message_md && <Markdown text={h.message_md} />}
              </div>
            )}
            {h.note && <p className="small muted" style={{ marginTop: "var(--s-2)" }}>{h.note}</p>}
          </li>
        );
      })}
    </ol>
  );
}
