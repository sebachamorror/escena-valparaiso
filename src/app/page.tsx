import Link from "next/link";
import { SectionHead } from "@/components/layout/PageHeader";
import { SearchForm } from "@/components/search/SearchForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { JsonLd } from "@/components/ui/JsonLd";
import { ArtistCard } from "@/components/cards/ArtistCard";
import { CompanyCard } from "@/components/cards/CompanyCard";
import { RouteStrip } from "@/components/dcc/RouteStrip";
import { EventCard } from "@/components/cards/EventCard";
import { RegionMap } from "@/components/map/RegionMap";
import { t } from "@/content/es-CL";
import { listProvinces, provinceShortName, provinceUrl, communesOfProvince, listCommunes } from "@/lib/data/territories";
import { previewEnabled } from "@/lib/data/visibility";
import { countsForCommune, countsForProvince, listArtists, listCompanies } from "@/lib/queries/entities";
import { listUpcomingOccurrences } from "@/lib/queries/events";
import { episodesInCommune, episodesInProvince, getSeries, listEpisodes } from "@/lib/queries/series";
import { websiteJsonLd } from "@/lib/seo/jsonld";
import { SITE_TAGLINE } from "@/lib/site";
import styles from "./home.module.css";
import dcc from "@/components/dcc/dcc.module.css";

export default function HomePage() {
  const artists = listArtists();
  const companies = listCompanies();
  const provinces = listProvinces();
  const series = getSeries();
  const episodes = listEpisodes();
  const people = [...artists.slice(0, 3), ...companies.slice(0, 3)];
  const communeCounts = Object.fromEntries(listCommunes().map((c) => [c.slug, countsForCommune(c.slug, episodesInCommune(c.slug).length)]));
  const upcoming = listUpcomingOccurrences();

  return (
    <>
      <JsonLd data={websiteJsonLd()} />

      {/* 1. Hero */}
      <section className={`wrap ${styles.hero}`} aria-labelledby="hero-title">
        <div className={styles.heroText}>
          <p className="eyebrow">Artes escénicas de la Región de Valparaíso</p>
          <h1 id="hero-title" className={styles.heroTitle}>Descubre qué está pasando <span>en la escena de tu región.</span></h1>
          <p className="lead">
            Compañías, artistas, obras, espacios, cartelera, convocatorias y memoria de las 38 comunas y 8 provincias, de la cordillera al mar. Cada dato con su fuente.
          </p>
          <div className={styles.heroActions}>
            <Link href="/cartelera" className="btn btn-primary">Cartelera</Link>
            <Link href="/territorios" className="btn">Explorar por territorio</Link>
            <Link href="/de-cuento-en-cuento" className="btn">De Cuento en Cuento</Link>
          </div>
        </div>
        <RegionMap counts={communeCounts} width={520} height={560} />
      </section>

      {/* 2. Buscador */}
      <section className={styles.searchBand} aria-label="Buscar">
        <div className={`wrap ${styles.searchInner}`}>
          <div>
            <h2 style={{ fontSize: "var(--t-lg)" }}>¿A quién buscas?</h2>
            <p className="small muted" style={{ margin: 0 }}>Compañías, artistas, obras, comunas y oficios.</p>
          </div>
          <div>
            <SearchForm />
            <ul className={styles.quick} aria-label="Búsquedas sugeridas">
              {["títeres", "Los Andes", "clown", "San Antonio", "narración oral"].map((q) => (
                <li key={q}><Link className="chip" href={`/buscar?q=${encodeURIComponent(q)}`}>{q}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Qué está pasando */}
      <section className="wrap section" aria-labelledby="pasando">
        <SectionHead id="pasando" title="Qué está pasando" sub="Funciones y actividades próximas, con fecha, hora, lugar y fuente oficial." action={<Link href="/cartelera" className="link-more">Toda la cartelera</Link>} />
        {upcoming.length ? (
          <div className="grid-3">{upcoming.slice(0, 6).map((o) => <EventCard key={`${o.event.slug}-${o.occurrence.starts_at}`} item={o} />)}</div>
        ) : (
          <EmptyState title="Cartelera" text={t.empty.events} proposeLabel="Avisar de una función" proposeHref="/participa?tipo=actividad" />
        )}
      </section>

      {/* 4. Conoce a quienes lo hacen */}
      <section className="wrap section" aria-labelledby="quienes">
        <SectionHead id="quienes" title="Conoce a quienes lo hacen" sub={previewEnabled() ? "Fichas en verificación: se validan con cada persona antes de publicarse." : "Personas y agrupaciones con ficha verificada."} action={<Link href="/artistas" className="link-more">Artistas y compañías</Link>} />
        {people.length ? (
          <div className="grid-3">
            {artists.slice(0, 3).map((a) => <ArtistCard key={a.slug} a={a} />)}
            {companies.slice(0, 3).map((c) => <CompanyCard key={c.slug} c={c} />)}
          </div>
        ) : (
          <EmptyState title="Fichas" text="Las primeras fichas se publican cuando cada persona y agrupación valida su información." />
        )}
      </section>

      {/* 5. Explora por territorio */}
      <section className="wrap section" aria-labelledby="territorio">
        <SectionHead id="territorio" title="Explora por territorio" sub="Ocho provincias, treinta y ocho comunas. Isla de Pascua y Juan Fernández incluidas." action={<Link href="/territorios" className="link-more">Todas las comunas</Link>} />
        <div className={styles.provinces}>
          {provinces.map((p) => {
            const counts = countsForProvince(p.slug, episodesInProvince(p.slug).length);
            const n = communesOfProvince(p.slug).length;
            return (
              <Link key={p.slug} href={provinceUrl(p.slug)} className={styles.prov}>
                <span className={styles.provCut}>{p.cut_code}{p.insular ? " · insular" : ""}</span>
                <span className={styles.provName}>{provinceShortName(p)}</span>
                <span className={styles.provCount}>{n} {n === 1 ? "comuna" : "comunas"}{counts.total ? ` · ${counts.total} ${counts.total === 1 ? "registro" : "registros"}` : ""}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 6. De Cuento en Cuento */}
      <section className={dcc.band} aria-labelledby="dcc-title">
        <div className={`wrap ${dcc.bandInner}`}>
          <p className={dcc.kicker}>Serie original · Temporada {series.season} · {series.status === "planificada" ? "en preparación" : series.status}</p>
          <h2 id="dcc-title" className={dcc.title} style={{ marginTop: "var(--s-2)" }}>De Cuento <em>en</em> Cuento</h2>
          <p className={dcc.descriptor} style={{ marginTop: "var(--s-2)" }}>{series.descriptor}</p>
          <p className="lead" style={{ marginTop: "var(--s-4)", color: "inherit" }}>{series.subtitle}</p>
          <RouteStrip episodes={episodes} />
          <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", marginTop: "var(--s-5)" }}>
            <Link href="/de-cuento-en-cuento" className={`btn ${dcc.btn}`}>La serie</Link>
            <Link href="/de-cuento-en-cuento/la-posta" className={`btn ${dcc.btn}`}>La Posta</Link>
            <Link href="/de-cuento-en-cuento/protagonistas" className={`btn ${dcc.btn}`}>Protagonistas</Link>
          </div>
        </div>
      </section>

      {/* 7 y 8. Editorial y convocatorias */}
      <section className="wrap section" aria-label="Editorial y convocatorias">
        <div className={styles.twoCol}>
          <div>
            <SectionHead title="Editorial" sub="Entrevistas, perfiles, crónicas y memoria." action={<Link href="/editorial" className="link-more">Editorial</Link>} />
            <EmptyState title="Editorial" text={t.empty.posts} proposeLabel="Proponer una historia" proposeHref="/participa?tipo=historia" />
          </div>
          <div>
            <SectionHead title="Convocatorias abiertas" sub="Fondos, residencias, festivales, talleres y audiciones." action={<Link href="/convocatorias" className="link-more">Convocatorias</Link>} />
            <EmptyState title="Convocatorias" text={t.empty.calls} proposeLabel="Avisar de una convocatoria" proposeHref="/participa?tipo=actividad" />
          </div>
        </div>
      </section>

      {/* 9. Mapa */}
      <section className="wrap section" aria-labelledby="mapa-title">
        <div className={styles.mapCta}>
          <div>
            <p className="eyebrow">Mapa regional</p>
            <h2 id="mapa-title" style={{ marginTop: "var(--s-2)" }}>El mapa es un índice, no una ilustración.</h2>
            <p className="muted" style={{ marginTop: "var(--s-2)", maxWidth: "60ch" }}>
              Provincias y comunas con lo que ocurre en cada una: quiénes lo hacen, dónde trabajan, qué contenidos existen y por dónde pasa la serie. Se dibuja solo con geometría oficial.
            </p>
          </div>
          <Link href="/mapa" className="btn btn-sea">Abrir el mapa</Link>
        </div>
      </section>
    </>
  );
}
