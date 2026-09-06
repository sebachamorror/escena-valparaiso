import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { listCrafts } from "@/lib/data/vocab";
import { artistsWithCraft } from "@/lib/queries/entities";
import { episodesForCraft } from "@/lib/queries/series";
import { pageMetadata } from "@/lib/seo/metadata";
import styles from "@/components/cards/cards.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Oficios escénicos · 17 oficios de las artes escénicas",
  description: "Actuación, dramaturgia, dirección, iluminación, sonido, escenografía, vestuario, utilería, maquillaje, títeres, producción, gestión, mediación, técnica, música escénica, circo y narración oral en la Región de Valparaíso.",
  path: "/oficios",
});

export default function CraftsPage() {
  const crafts = listCrafts();
  return (
    <div className="wrap">
      <PageHeader eyebrow="Oficios" title="Diecisiete oficios escénicos" lead="Cada oficio reúne artículos, videos, entrevistas, perfiles profesionales de la región y los episodios de Quinta Escena Podcast donde se muestra. Los oficios enseñan." crumbs={[{ name: "Oficios", href: "/oficios" }]} />
      <div className="grid" style={{ marginBottom: "var(--s-8)" }}>
        {crafts.map((c) => {
          const n = artistsWithCraft(c.slug).length;
          const e = episodesForCraft(c.slug).length;
          return (
            <article key={c.slug} className={`${styles.card} ${styles.territory}`}>
              <div className={styles.tags}><span>Oficio</span></div>
              <h3><Link href={`/oficios/${c.slug}`}>{c.name}</Link></h3>
              <p className={styles.count}>
                {n ? <><strong>{n}</strong> {n === 1 ? "perfil" : "perfiles"}</> : "Sin perfiles todavía"}
                {e ? <> · <strong>{e}</strong> {e === 1 ? "episodio" : "episodios"}</> : null}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
