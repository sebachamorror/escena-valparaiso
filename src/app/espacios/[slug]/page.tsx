import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AsideBox, Block, FichaLayout } from "@/components/entity/FichaLayout";
import { FichaHead } from "@/components/entity/FichaHead";
import { EventCard } from "@/components/cards/EventCard";
import { SourceList } from "@/components/verification/SourceList";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { JsonLd } from "@/components/ui/JsonLd";
import { Markdown, plainText } from "@/lib/markdown";
import { communeName, communeUrl, getCommune, getProvince, provinceShortName, provinceUrl } from "@/lib/data/territories";
import { disciplineName } from "@/lib/data/vocab";
import { isIndexable } from "@/lib/data/visibility";
import { getVenue, listVenues } from "@/lib/queries/venues";
import { upcomingInCommune } from "@/lib/queries/events";
import { absoluteUrl } from "@/lib/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return listVenues().map((v) => ({ slug: v.slug }));
}

const VENUE_TYPE_LABEL: Record<string, string> = {
  teatro: "Teatro", "centro-cultural": "Centro cultural", sala: "Sala",
  "espacio-independiente": "Espacio independiente", escuela: "Escuela", museo: "Museo",
  "espacio-publico": "Espacio público", "no-convencional": "Lugar no convencional",
};

const STATUS_LABEL: Record<string, string> = {
  activo: "Activo", "cerrado-temporal": "Cerrado temporalmente", desaparecido: "Desaparecido", desconocido: "Estado por confirmar",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = getVenue(slug);
  if (!v) return {};
  return pageMetadata({
    title: `${v.name} · ${VENUE_TYPE_LABEL[v.venue_type] ?? v.venue_type} en ${communeName(v.place.commune)}`,
    description: plainText(v.description_md, 160) || `${v.name}, ${communeName(v.place.commune)}, Región de Valparaíso.`,
    path: `/espacios/${v.slug}`,
    index: isIndexable(v),
  });
}

export default async function VenuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = getVenue(slug);
  if (!v) notFound();
  const commune = getCommune(v.place.commune);
  const province = commune ? getProvince(commune.province) : undefined;
  const upcoming = upcomingInCommune(v.place.commune).filter((o) => o.occurrence.venue === v.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PerformingArtsTheater",
    name: v.name,
    url: absoluteUrl(`/espacios/${v.slug}`),
    address: v.place.address ? { "@type": "PostalAddress", streetAddress: v.place.address, addressLocality: communeName(v.place.commune), addressRegion: "Región de Valparaíso", addressCountry: "CL" } : undefined,
  };

  return (
    <article className="wrap" style={{ paddingTop: "var(--s-5)" }}>
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={[{ name: "Espacios", href: "/espacios" }, { name: v.short_name ?? v.name, href: `/espacios/${v.slug}` }]} />
      <div style={{ height: "var(--s-5)" }} />
      <FichaLayout
        main={
          <>
            <FichaHead
              eyebrow={`${VENUE_TYPE_LABEL[v.venue_type] ?? v.venue_type}${v.owner ? ` · ${v.owner}` : ""}`}
              title={v.name}
              subtitle={null}
              verification={v.verification}
              facts={
                <>
                  <span><Link href={communeUrl(v.place.commune)}>{communeName(v.place.commune)}</Link>{province && <>, <Link href={provinceUrl(province.slug)}>Provincia de {provinceShortName(province)}</Link></>}</span>
                  {v.place.address && <span>{v.place.address}</span>}
                  <span>{STATUS_LABEL[v.status]}</span>
                  {v.capacity && <span>{v.capacity} personas</span>}
                </>
              }
            />
            {v.description_md && <Markdown className="prose lead" text={v.description_md} />}
            {upcoming.length > 0 && (
              <Block title="Próximas funciones" id="funciones"><div className="grid-2">{upcoming.map((o) => <EventCard key={`${o.event.slug}-${o.occurrence.starts_at}`} item={o} />)}</div></Block>
            )}
            {v.rooms.length > 0 && <Block title="Salas" id="salas"><p>{v.rooms.join(", ")}</p></Block>}
            {v.accessibility.length > 0 && <Block title="Accesibilidad" id="accesibilidad"><p>{v.accessibility.join(", ")}</p></Block>}
            <SourceList sources={v.sources} />
            {v.verification.note && <p className="small muted">Nota de verificación: {v.verification.note}</p>}
          </>
        }
        aside={
          <>
            <AsideBox title="Contacto">
              <ul style={{ listStyle: "none", display: "grid", gap: "var(--s-1)", fontSize: "var(--t-sm)" }}>
                {v.website && <li><ExternalLink href={v.website} territory={v.place.commune}>Sitio web</ExternalLink></li>}
                {v.social.instagram && <li><ExternalLink href={v.social.instagram} kind="social" territory={v.place.commune}>Instagram</ExternalLink></li>}
                {v.social.facebook && <li><ExternalLink href={v.social.facebook} kind="social" territory={v.place.commune}>Facebook</ExternalLink></li>}
                {v.contact_public && <li>{v.contact_public}</li>}
                {!v.website && !v.social.instagram && !v.social.facebook && !v.contact_public && <li className="muted">Aún no tenemos un contacto público de este espacio.</li>}
              </ul>
            </AsideBox>
            <AsideBox title="Territorio">
              <ul style={{ listStyle: "none", display: "grid", gap: "var(--s-1)", fontSize: "var(--t-sm)" }}>
                <li><Link href={communeUrl(v.place.commune)}>Todo en {communeName(v.place.commune)}</Link></li>
                {province && <li><Link href={provinceUrl(province.slug)}>Provincia de {provinceShortName(province)}</Link></li>}
              </ul>
            </AsideBox>
            {v.disciplines.length > 0 && (
              <AsideBox title="Disciplinas">
                <ul className="chips">{v.disciplines.map((d) => <li key={d} className="chip">{disciplineName(d)}</li>)}</ul>
              </AsideBox>
            )}
          </>
        }
      />
    </article>
  );
}
