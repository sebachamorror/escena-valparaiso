import Link from "next/link";
import type { TerritoryCounts } from "@/lib/queries/entities";
import styles from "./cards.module.css";

interface Props { href: string; name: string; kind: "Provincia" | "Comuna"; sub?: string; counts: TerritoryCounts; insular?: boolean }

export function TerritoryCard({ href, name, kind, sub, counts, insular }: Props) {
  const parts: string[] = [];
  if (counts.companies) parts.push(`${counts.companies} ${counts.companies === 1 ? "compañía" : "compañías"}`);
  if (counts.artists) parts.push(`${counts.artists} ${counts.artists === 1 ? "artista" : "artistas"}`);
  if (counts.works) parts.push(`${counts.works} ${counts.works === 1 ? "obra" : "obras"}`);
  if (counts.venues) parts.push(`${counts.venues} ${counts.venues === 1 ? "espacio" : "espacios"}`);
  if (counts.events) parts.push(`${counts.events} ${counts.events === 1 ? "función" : "funciones"}`);
  if (counts.episodes) parts.push(`${counts.episodes} ${counts.episodes === 1 ? "episodio" : "episodios"}`);
  return (
    <article className={`${styles.card} ${styles.territory}`}>
      <div className={styles.tags}><span>{kind}</span>{insular && <span>Insular</span>}</div>
      <h3><Link href={href}>{name}</Link></h3>
      {sub && <p className={styles.meta}>{sub}</p>}
      <p className={styles.count}>
        {parts.length ? parts.map((p, i) => <span key={p}>{i > 0 ? " · " : ""}<strong>{p.split(" ")[0]}</strong> {p.split(" ").slice(1).join(" ")}</span>) : "Sin registros todavía"}
      </p>
    </article>
  );
}
