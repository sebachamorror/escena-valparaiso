import Link from "next/link";
import { t } from "@/content/es-CL";
import { getProvince, provinceShortName, provinceUrl } from "@/lib/data/territories";
import { artistsInProvince, companiesInProvince, worksInProvince } from "@/lib/queries/entities";
import { episodeUrl, episodesInProvince } from "@/lib/queries/series";
import { communeName } from "@/lib/data/territories";
import styles from "./entity.module.css";

interface Props { province: string; exclude?: { type: "company" | "artist" | "work" | "episode"; slug: string } }

/** Circuito de descubrimiento: otras entidades de la misma provincia (docs/SOUL.md, docs/SEO.md §7). */
export function SigueExplorando({ province, exclude }: Props) {
  const prov = getProvince(province);
  if (!prov) return null;
  const skip = (type: string, slug: string) => exclude && exclude.type === type && exclude.slug === slug;
  const companies = companiesInProvince(province).filter((c) => !skip("company", c.slug)).slice(0, 5);
  const artists = artistsInProvince(province).filter((a) => !skip("artist", a.slug)).slice(0, 5);
  const works = worksInProvince(province).filter((w) => !skip("work", w.slug)).slice(0, 5);
  const episodes = episodesInProvince(province).filter((e) => !skip("episode", e.slug)).slice(0, 3);
  const cols = [
    { title: "Compañías", items: companies.map((c) => ({ href: `/companias/${c.slug}`, label: c.name })) },
    { title: "Artistas", items: artists.map((a) => ({ href: `/artistas/${a.slug}`, label: a.name })) },
    { title: "Obras", items: works.map((w) => ({ href: `/obras/${w.slug}`, label: w.title })) },
    { title: "De Cuento en Cuento", items: episodes.map((e) => ({ href: episodeUrl(e), label: `Episodio ${e.number} · ${communeName(e.commune)}` })) },
  ].filter((c) => c.items.length);

  return (
    <section className={styles.explore} aria-labelledby="sigue-explorando">
      <div className="wrap">
        <p className="eyebrow">{t.explore.subtitle}</p>
        <h2 id="sigue-explorando" style={{ marginBottom: "var(--s-5)" }}>
          {t.explore.title}: <Link href={provinceUrl(prov.slug)}>{prov.name}</Link>
        </h2>
        {cols.length ? (
          <div className={styles.exploreGrid}>
            {cols.map((c) => (
              <div key={c.title} className={styles.exploreCol}>
                <h3>{c.title}</h3>
                <ul>{c.items.map((i) => <li key={i.href}><Link href={i.href}>{i.label}</Link></li>)}</ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Todavía no hay más registros en {provinceShortName(prov)}. <Link href="/participa">¿Conoces a alguien?</Link></p>
        )}
        <p style={{ marginTop: "var(--s-5)" }}>
          <Link href={provinceUrl(prov.slug)} className="link-more">Todo lo que sabemos de {provinceShortName(prov)}</Link>
        </p>
      </div>
    </section>
  );
}
