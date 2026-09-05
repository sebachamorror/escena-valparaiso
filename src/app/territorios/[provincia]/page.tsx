import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, SectionHead } from "@/components/layout/PageHeader";
import { TerritoryCard } from "@/components/cards/TerritoryCard";
import { CompanyCard } from "@/components/cards/CompanyCard";
import { ArtistCard } from "@/components/cards/ArtistCard";
import { WorkCard } from "@/components/cards/WorkCard";
import { EpisodeCard } from "@/components/cards/EpisodeCard";
import { VenueCard } from "@/components/cards/VenueCard";
import { EventCard } from "@/components/cards/EventCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { RegionMap } from "@/components/map/RegionMap";
import { t } from "@/content/es-CL";
import { communesOfProvince, communeUrl, getProvince, listProvinces, provinceShortName } from "@/lib/data/territories";
import { artistsInProvince, companiesInProvince, countsForCommune, countsForProvince, getArtist, worksInProvince } from "@/lib/queries/entities";
import { episodesInCommune, episodesInProvince } from "@/lib/queries/series";
import { venuesInProvince } from "@/lib/queries/venues";
import { upcomingInProvince } from "@/lib/queries/events";
import { pageMetadata } from "@/lib/seo/metadata";
import { isPublishable } from "@/lib/data/visibility";
import styles from "../territory.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return listProvinces().map((p) => ({ provincia: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ provincia: string }> }): Promise<Metadata> {
  const { provincia } = await params;
  const p = getProvince(provincia);
  if (!p) return {};
  const hasPublished = [...companiesInProvince(p.slug), ...artistsInProvince(p.slug), ...worksInProvince(p.slug)].some(isPublishable) || episodesInProvince(p.slug).length > 0;
  return pageMetadata({
    title: `Artes escénicas en la ${p.name} · compañías, artistas, obras y cartelera`,
    description: `Teatro, títeres, circo, narración oral y danza en la ${p.name}, Región de Valparaíso: ${communesOfProvince(p.slug).map((c) => c.name).join(", ")}.`,
    path: `/territorios/${p.slug}`,
    index: hasPublished,
  });
}

export default async function ProvincePage({ params }: { params: Promise<{ provincia: string }> }) {
  const { provincia } = await params;
  const p = getProvince(provincia);
  if (!p) notFound();
  const communes = communesOfProvince(p.slug);
  const companies = companiesInProvince(p.slug);
  const artists = artistsInProvince(p.slug);
  const works = worksInProvince(p.slug);
  const episodes = episodesInProvince(p.slug);
  const venues = venuesInProvince(p.slug);
  const events = upcomingInProvince(p.slug);
  const counts = countsForProvince(p.slug, episodes.length);
  const short = provinceShortName(p);

  return (
    <div className="wrap">
      <PageHeader
        eyebrow={`Provincia · código ${p.cut_code}${p.insular ? " · territorio insular" : ""}`}
        title={`Artes escénicas en ${short}`}
        lead={`${communes.length} ${communes.length === 1 ? "comuna" : "comunas"}: ${communes.map((c) => c.name).join(", ")}.`}
        crumbs={[{ name: "Territorios", href: "/territorios" }, { name: short, href: `/territorios/${p.slug}` }]}
      >
        <div className={styles.counts} aria-label="Registros en esta provincia">
          <div className={styles.count}><strong>{counts.companies}</strong><span>compañías</span></div>
          <div className={styles.count}><strong>{counts.artists}</strong><span>artistas</span></div>
          <div className={styles.count}><strong>{counts.works}</strong><span>obras</span></div>
          <div className={styles.count}><strong>{counts.episodes}</strong><span>episodios</span></div>
        </div>
      </PageHeader>

      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="comunas">
        <SectionHead id="comunas" title="Comunas" action={<Link href="/mapa" className="link-more">Mapa regional</Link>} />
        <div className={styles.mapGrid}>
          <RegionMap counts={Object.fromEntries(communes.map((c) => [c.slug, countsForCommune(c.slug, episodesInCommune(c.slug).length)]))} focusProvince={p.slug} width={520} height={440} />
          <div className="grid">
          {communes.map((c) => (
            <TerritoryCard key={c.slug} href={communeUrl(c.slug)} name={c.name} kind="Comuna" insular={c.insular} counts={countsForCommune(c.slug, episodesInCommune(c.slug).length)} />
          ))}
          </div>
        </div>
      </section>

      {episodes.length > 0 && (
        <section className="section" aria-labelledby="dcc">
          <SectionHead id="dcc" title="De Cuento en Cuento" sub="La serie pasa por esta provincia." action={<Link href="/de-cuento-en-cuento" className="link-more">La serie</Link>} />
          <div className="grid-3">{episodes.map((e) => <EpisodeCard key={e.slug} e={e} protagonistName={e.protagonist_artist ? getArtist(e.protagonist_artist)?.name : null} />)}</div>
        </section>
      )}

      <section className="section" aria-labelledby="quienes">
        <SectionHead id="quienes" title="Quiénes lo hacen" sub="Compañías y artistas con sede en la provincia." />
        {companies.length + artists.length > 0 ? (
          <div className="grid-3">
            {companies.map((c) => <CompanyCard key={c.slug} c={c} />)}
            {artists.map((a) => <ArtistCard key={a.slug} a={a} />)}
          </div>
        ) : (
          <EmptyState text={`Todavía no tenemos compañías ni artistas documentados en ${short}. La investigación territorial va a buscar: municipios, teatros municipales, Fondos de Cultura, escuelas.`} proposeLabel={`Proponer a alguien de ${short}`} proposeHref={`/participa?provincia=${p.slug}`} />
        )}
      </section>

      {works.length > 0 && (
        <section className="section" aria-labelledby="obras">
          <SectionHead id="obras" title="Obras" />
          <div className="grid-3">{works.map((w) => <WorkCard key={w.slug} w={w} />)}</div>
        </section>
      )}

      {venues.length > 0 && (
        <section className="section" aria-labelledby="espacios">
          <SectionHead id="espacios" title="Espacios escénicos" action={<Link href="/espacios" className="link-more">Espacios</Link>} />
          <div className="grid-3">{venues.map((v) => <VenueCard key={v.slug} v={v} />)}</div>
        </section>
      )}

      <section className="section" aria-labelledby="cartelera">
        <SectionHead id="cartelera" title="Cartelera" sub="Funciones próximas en la provincia." action={<Link href="/cartelera" className="link-more">Toda la cartelera</Link>} />
        {events.length ? (
          <div className="grid-3">{events.map((o) => <EventCard key={`${o.event.slug}-${o.occurrence.starts_at}`} item={o} />)}</div>
        ) : (
          <EmptyState text={t.empty.events} proposeLabel="Avisar de una función" proposeHref={`/participa?tipo=actividad&provincia=${p.slug}`} />
        )}
      </section>
    </div>
  );
}
