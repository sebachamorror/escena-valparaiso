import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AsideBox, Block, FichaLayout } from "@/components/entity/FichaLayout";
import { FichaHead } from "@/components/entity/FichaHead";
import { SourceList } from "@/components/verification/SourceList";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { JsonLd } from "@/components/ui/JsonLd";
import { Markdown, plainText } from "@/lib/markdown";
import { formatDate } from "@/lib/format";
import { communeName, communeUrl, getCommune, getProvince, provinceShortName, provinceUrl } from "@/lib/data/territories";
import { disciplineName, audienceName } from "@/lib/data/vocab";
import { isIndexable } from "@/lib/data/visibility";
import { getEvent } from "@/lib/queries/events";
import { getVenue } from "@/lib/queries/venues";
import { getCompany, getWork } from "@/lib/queries/entities";
import { loadEvents } from "@/lib/data/load";
import { absoluteUrl } from "@/lib/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return loadEvents().map((e) => ({ slug: e.slug }));
}

const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function formatOccurrence(iso: string): string {
  const d = new Date(iso);
  const day = WEEKDAYS[d.getDay()];
  const date = d.toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Santiago" });
  const time = d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Santiago" });
  return `${day} ${date}, ${time} hrs`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = getEvent(slug);
  if (!e) return {};
  const venue = e.occurrences[0]?.venue ? getVenue(e.occurrences[0].venue!) : undefined;
  return pageMetadata({
    title: `${e.title}${venue ? ` · ${venue.short_name ?? venue.name}` : ""}`,
    description: plainText(e.description_md, 160) || `${e.title}, función de artes escénicas en la Región de Valparaíso.`,
    path: `/cartelera/${e.slug}`,
    index: isIndexable(e),
  });
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = getEvent(slug);
  if (!e) notFound();
  const work = e.work ? getWork(e.work) : undefined;
  const company = e.company ? getCompany(e.company) : undefined;
  const firstVenue = e.occurrences[0]?.venue ? getVenue(e.occurrences[0].venue!) : undefined;
  const commune = firstVenue ? getCommune(firstVenue.place.commune) : undefined;
  const province = commune ? getProvince(commune.province) : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TheaterEvent",
    name: e.title,
    url: absoluteUrl(`/cartelera/${e.slug}`),
    startDate: e.occurrences[0]?.starts_at,
    location: firstVenue ? { "@type": "Place", name: firstVenue.name, address: firstVenue.place.address } : undefined,
    offers: e.price ? { "@type": "Offer", price: e.price } : undefined,
  };

  return (
    <article className="wrap" style={{ paddingTop: "var(--s-5)" }}>
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={[{ name: "Cartelera", href: "/cartelera" }, { name: e.title, href: `/cartelera/${e.slug}` }]} />
      <div style={{ height: "var(--s-5)" }} />
      <FichaLayout
        main={
          <>
            <FichaHead
              eyebrow={e.kind === "funcion" ? "Función" : e.kind}
              title={e.title}
              subtitle={e.organizer_text}
              verification={e.verification}
              facts={
                <>
                  {firstVenue && <span><Link href={`/espacios/${firstVenue.slug}`}>{firstVenue.short_name ?? firstVenue.name}</Link></span>}
                  {commune && <span><Link href={communeUrl(commune.slug)}>{commune.name}</Link>{province && <>, <Link href={provinceUrl(province.slug)}>{provinceShortName(province)}</Link></>}</span>}
                  {e.audience && <span>{audienceName(e.audience)}</span>}
                  {e.is_free ? <span>Entrada liberada</span> : e.price ? <span>{e.price}</span> : null}
                </>
              }
            />
            {e.description_md && <Markdown className="prose lead" text={e.description_md} />}
            <Block title="Funciones" id="funciones">
              <ul className="rule-list">
                {e.occurrences.map((occ, i) => {
                  const v = occ.venue ? getVenue(occ.venue) : undefined;
                  return (
                    <li key={i}>
                      <strong>{occ.time_unknown ? formatDate(occ.starts_at.slice(0, 10)) : formatOccurrence(occ.starts_at)}</strong>
                      {v && <> · <Link href={`/espacios/${v.slug}`}>{v.short_name ?? v.name}</Link></>}
                      {occ.price && <span className="small muted"> · {occ.price}</span>}
                      {occ.note && <span className="small muted"> · {occ.note}</span>}
                    </li>
                  );
                })}
              </ul>
            </Block>
            <SourceList sources={e.sources} />
            <p className="small muted">Fecha de la última confirmación con la fuente oficial: {formatDate(e.last_checked_at)}.</p>
            {e.verification.note && <p className="small muted">Nota de verificación: {e.verification.note}</p>}
          </>
        }
        aside={
          <>
            {e.booking_url && (
              <AsideBox title="Entradas">
                <p className="small"><ExternalLink href={e.booking_url} kind="booking" territory={commune?.slug}>Reservar o comprar</ExternalLink></p>
              </AsideBox>
            )}
            {(work || company) && (
              <AsideBox title="Obra y compañía">
                <ul style={{ listStyle: "none", display: "grid", gap: "var(--s-1)", fontSize: "var(--t-sm)" }}>
                  {work && <li><Link href={`/obras/${work.slug}`}>{work.title}</Link></li>}
                  {company && <li><Link href={`/companias/${company.slug}`}>{company.name}</Link></li>}
                </ul>
              </AsideBox>
            )}
            {firstVenue && (
              <AsideBox title="Espacio">
                <ul style={{ listStyle: "none", display: "grid", gap: "var(--s-1)", fontSize: "var(--t-sm)" }}>
                  <li><Link href={`/espacios/${firstVenue.slug}`}>{firstVenue.name}</Link></li>
                  {firstVenue.place.address && <li className="muted">{firstVenue.place.address}</li>}
                </ul>
              </AsideBox>
            )}
            {e.disciplines.length > 0 && (
              <AsideBox title="Disciplinas">
                <ul className="chips">{e.disciplines.map((d) => <li key={d} className="chip">{disciplineName(d)}</li>)}</ul>
              </AsideBox>
            )}
          </>
        }
      />
    </article>
  );
}
