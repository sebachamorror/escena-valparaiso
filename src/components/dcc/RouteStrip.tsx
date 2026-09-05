import Link from "next/link";
import type { Episode } from "@/lib/data/types";
import { communeName } from "@/lib/data/territories";
import { episodeUrl } from "@/lib/queries/series";
import styles from "./dcc.module.css";

/** La ruta de la serie: siete comunas en orden de recorrido, de la cordillera al mar. No es un mapa. */
export function RouteStrip({ episodes }: { episodes: Episode[] }) {
  return (
    <div className="scroll-x">
      <ol className={styles.route} aria-label="Ruta de la serie, de la cordillera al mar">
        {episodes.map((e) => (
          <li key={e.slug} className={styles.routeItem}>
            <Link href={episodeUrl(e)}>
              <span className={styles.routeN}>Ep. {e.number}</span>
              <span className={styles.routeName}>{communeName(e.commune)}</span>
              <span className={styles.routeTramo}>{e.tramo}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
