import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, SectionHead } from "@/components/layout/PageHeader";
import { CompanyCard } from "@/components/cards/CompanyCard";
import { ArtistCard } from "@/components/cards/ArtistCard";
import { WorkCard } from "@/components/cards/WorkCard";
import { EpisodeCard } from "@/components/cards/EpisodeCard";
import { VenueCard } from "@/components/cards/VenueCard";
import { EventCard } from "@/components/cards/EventCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SigueExplorando } from "@/components/entity/SigueExplorando";
import { RegionMap } from "@/components/map/RegionMap";
import { t } from "@/content/es-CL";
import { communesOfProvince, getCommune, getProvince, listCommunes, provinceShortName, provinceUrl } from "@/lib/data/territories";
import { artistsInCommune, companiesInCommune, countsForCommune, getArtist, worksInCommune } from "@/lib/queries/entities";
import { episodesInCommune } from "@/lib/queries/series";
import { venuesInCommune } from "@/lib/queries/venues";
import { upcomingInCommune } from "@/lib/queries/events";
import { pageMetadata } from "@/lib/seo/metadata";
import { isPublishable } from "@/lib/data/visibility";
import styles from "../../territory.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return listCommunes().map((c) => ({ provincia: c.province, comuna: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ provincia: string; comuna: string }> }): Promise<Metadata> {
  const { provincia, comuna } = await params;
  const c = getCommune(comuna);
  if (!c || c.province !== provincia) return {};
  const hasPublished = [...companiesInCommune(c.slug), ...artistsInCommune(c.slug), ...worksInCommune(c.slug)].some(isPublishable) || episodesInCommune(c.slug).length > 0;
  return pageMetadata({
    title: `Teatro y artes escénicas en ${c.name} · compañías, artistas, obras y cartelera`,
    description: `Compañías, artistas, obras, espacios y cartelera de artes escénicas en ${c.name}, ${getProvince(c.province)?.name ?? ""}, Región de Valparaíso.`,
    path: `/territorios/${c.province}/${c.slug}`,
    index: hasPublished,
  });
}

export default async function CommunePage({ params }: { params: Promise<{ provincia: string; comuna: string }> }) {
  const { provincia, comuna } = await params;
  const c = getCommune(comuna);
  if (!c || c.province !== provincia) notFound();
  const p = getProvince(c.province)!;
  const companies = companiesInCommune(c.slug);
  const artists = artistsInCommune(c.slug);
  const works = worksInCommune(c.slug);
  const episodes = episodesInCommune(c.slug);
  const venues = venuesInCommune(c.slug);
  const events = upcomingInCommune(c.slug);
  const counts = countsForCommune(c.slug, episodes.length);

  return (
    <>
      <div className="wrap">
        <PageHeader
          eyebrow={`Comuna · código ${c.cut_code} · ${p.name}${c.insular ? " · territorio insular" : ""}`}
          title={`Artes escénicas en ${c.name}`}
          lead={counts.total ? `Lo que sabemos de la escena de ${c.name}, con fuentes.` : `Todavía no tenemos registros de ${c.name}. Eso no significa que no haya escena: significa que aún no la hemos encontrado.`}
          crumbs={[{ name: "Territorios", href: "/territorios" }, { name: provinceShortName(p), href: provinceUrl(p.slug) }, { name: c.name, href: `/territorios/${c.province}/${c.slug}` }]}
        >
          <div className={styles.counts} aria-label="Registros en esta comuna">
            <div className={styles.count}><strong>{counts.companies}</strong><span>compañías</span></div>
            <div className={styles.count}><strong>{counts.artists}</strong><span>artistas</span></div>
            <div className={styles.count}><strong>{counts.works}</strong><span>obras</span></div>
            <div className={styles.count}><strong>{counts.episodes}</strong><span>episodios</span></div>
          </div>
        </PageHeader>

        <section className="section" style={{ paddingTop: 0 }} aria-labelledby="ubicacion">
          <SectionHead id="ubicacion" title={`${c.name} en la ${p.name}`} action={<Link href="/mapa" className="link-more">Mapa regional</Link>} />
          <div className={styles.mapGrid}>
            <RegionMap counts={Object.fromEntries(communesOfProvince(p.slug).map((x) => [x.slug, countsForCommune(x.slug, episodesInCommune(x.slug).length)]))} focusProvince={p.slug} currentCommune={c.slug} width={520} height={440} />
            <ul className="rule-list">
              {communesOfProvince(p.slug).map((x) => (
                <li key={x.slug}>{x.slug === c.slug ? <strong>{x.name}</strong> : <Link href={`/territorios/${x.province}/${x.slug}`}>{x.name}</Link>} <span className="small muted">· {countsForCommune(x.slug, episodesInCommune(x.slug).length).total || "sin"} registros</span></li>
              ))}
            </ul>
          </div>
        </section>

        {episodes.length > 0 && (
          <section className="section" aria-labelledby="dcc">
            <SectionHead id="dcc" title="De Cuento en Cuento" sub={`La serie se detiene en ${c.name}.`} />
            <div className="grid-3">{episodes.map((e) => <EpisodeCard key={e.slug} e={e} protagonistName={e.protagonist_artist ? getArtist(e.protagonist_artist)?.name : null} />)}</div>
          </section>
        )}

        <section className="section" aria-labelledby="quienes">
          <SectionHead id="quienes" title="Quiénes lo hacen" />
          {companies.length + artists.length > 0 ? (
            <div className="grid-3">
              {companies.map((x) => <CompanyCard key={x.slug} c={x} />)}
              {artists.map((a) => <ArtistCard key={a.slug} a={a} />)}
            </div>
          ) : (
            <EmptyState text={`Aún no tenemos compañías ni artistas documentados en ${c.name}.`} proposeLabel={`Proponer a alguien de ${c.name}`} proposeHref={`/participa?comuna=${c.slug}`} />
          )}
        </section>

        {works.length > 0 && (
          <section className="section" aria-labelledby="obras">
            <SectionHead id="obras" title="Obras" />
            <div className="grid-3">{works.map((w) => <WorkCard key={w.slug} w={w} />)}</div>
          </section>
        )}

        <section className="section" aria-labelledby="espacios">
          <SectionHead id="espacios" title="Espacios y cartelera" action={<Link href="/espacios" className="link-more">Espacios</Link>} />
          <div className="grid-2">
            {venues.length ? (
              <div style={{ display: "grid", gap: "var(--s-5)" }}>{venues.map((v) => <VenueCard key={v.slug} v={v} />)}</div>
            ) : (
              <EmptyState title="Espacios" text={t.empty.venues} proposeLabel="Proponer un espacio" proposeHref={`/participa?tipo=espacio&comuna=${c.slug}`} />
            )}
            {events.length ? (
              <div style={{ display: "grid", gap: "var(--s-5)" }}>{events.map((o) => <EventCard key={`${o.event.slug}-${o.occurrence.starts_at}`} item={o} />)}</div>
            ) : (
              <EmptyState title="Cartelera" text={t.empty.events} proposeLabel="Avisar de una función" proposeHref={`/participa?tipo=actividad&comuna=${c.slug}`} />
            )}
          </div>
        </section>
      </div>
      <SigueExplorando province={p.slug} />
    </>
  );
}
