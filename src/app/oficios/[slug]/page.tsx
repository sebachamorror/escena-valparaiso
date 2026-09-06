import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader, SectionHead } from "@/components/layout/PageHeader";
import { ArtistCard } from "@/components/cards/ArtistCard";
import { EpisodeCard } from "@/components/cards/EpisodeCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { craftName, listCrafts } from "@/lib/data/vocab";
import { artistsWithCraft, getArtist } from "@/lib/queries/entities";
import { episodesForCraft } from "@/lib/queries/series";
import { pageMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return listCrafts().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = listCrafts().find((x) => x.slug === slug);
  if (!c) return {};
  return pageMetadata({
    title: `${c.name} · oficio escénico en la Región de Valparaíso`,
    description: `Perfiles, contenidos y episodios sobre el oficio de ${c.name.toLowerCase()} en las artes escénicas de la Región de Valparaíso.`,
    path: `/oficios/${c.slug}`,
  });
}

export default async function CraftPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const craft = listCrafts().find((x) => x.slug === slug);
  if (!craft) notFound();
  const artists = artistsWithCraft(craft.slug);
  const episodes = episodesForCraft(craft.slug);

  return (
    <div className="wrap">
      <PageHeader eyebrow="Oficio escénico" title={craftName(craft.slug)} lead="¿Qué haces? ¿Cómo lo haces? ¿Por qué así? ¿Qué herramientas necesitas? ¿Cómo aprendiste? Las preguntas guía del oficio, con las personas que lo practican en la región." crumbs={[{ name: "Oficios", href: "/oficios" }, { name: craft.name, href: `/oficios/${craft.slug}` }]} />

      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="perfiles">
        <SectionHead id="perfiles" title="Perfiles profesionales" sub="Personas de la región que practican este oficio." />
        {artists.length ? (
          <div className="grid-3">{artists.map((a) => <ArtistCard key={a.slug} a={a} />)}</div>
        ) : (
          <EmptyState text={`Aún no tenemos perfiles de ${craft.name.toLowerCase()} en la región.`} proposeLabel="Proponer a alguien" proposeHref={`/participa?tipo=artista&oficio=${craft.slug}`} />
        )}
      </section>

      <section className="section" aria-labelledby="contenidos">
        <SectionHead id="contenidos" title="Artículos, videos y entrevistas" />
        <EmptyState text="Todavía no hay contenidos editoriales sobre este oficio. Se publican con crédito, licencia y fuente." proposeLabel="Proponer un contenido" proposeHref={`/participa?tipo=documento&oficio=${craft.slug}`} />
      </section>

      {episodes.length > 0 && (
        <section className="section" aria-labelledby="dcc">
          <SectionHead id="dcc" title="En Quinta Escena Podcast" sub="Episodios donde este oficio se muestra." />
          <div className="grid-3">{episodes.map((e) => <EpisodeCard key={e.slug} e={e} protagonistName={e.protagonist_artist ? getArtist(e.protagonist_artist)?.name : null} />)}</div>
        </section>
      )}
    </div>
  );
}
