import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AsideBox, Block, FichaLayout } from "@/components/entity/FichaLayout";
import { FichaHead } from "@/components/entity/FichaHead";
import { ContactBlock } from "@/components/entity/ContactBlock";
import { FestivalList, FundingList, RecognitionList, TextList } from "@/components/entity/Records";
import { SigueExplorando } from "@/components/entity/SigueExplorando";
import { SourceList } from "@/components/verification/SourceList";
import { WorkCard } from "@/components/cards/WorkCard";
import { EpisodeCard } from "@/components/cards/EpisodeCard";
import { JsonLd } from "@/components/ui/JsonLd";
import { Avatar } from "@/components/ui/Avatar";
import { Markdown, plainText } from "@/lib/markdown";
import { communeName, communeUrl, getCommune, getProvince, provinceShortName, provinceUrl } from "@/lib/data/territories";
import { audienceName, disciplineName, STATUS_LABEL } from "@/lib/data/vocab";
import { isIndexable } from "@/lib/data/visibility";
import { formatMonth } from "@/lib/format";
import { artistsOfCompany, getCompany, listCompanies, worksOfCompany } from "@/lib/queries/entities";
import { episodesOfCompany } from "@/lib/queries/series";
import { companyJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return listCompanies().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getCompany(slug);
  if (!c) return {};
  return pageMetadata({
    title: `${c.name} · Compañía de ${c.disciplines.map(disciplineName).join(", ").toLowerCase()} en ${communeName(c.commune)}`,
    description: plainText(c.description_md, 160) || `${c.name}, compañía de ${communeName(c.commune)}, Región de Valparaíso.`,
    path: `/companias/${c.slug}`,
    index: isIndexable(c),
  });
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCompany(slug);
  if (!c) notFound();
  const commune = getCommune(c.commune);
  const province = commune ? getProvince(commune.province) : undefined;
  const members = artistsOfCompany(c.slug);
  const works = worksOfCompany(c.slug);
  const episodes = episodesOfCompany(c.slug);

  return (
    <>
      <article className="wrap" style={{ paddingTop: "var(--s-5)" }}>
        <JsonLd data={companyJsonLd(c)} />
        <Breadcrumbs items={[{ name: "Compañías", href: "/companias" }, { name: c.name, href: `/companias/${c.slug}` }]} />
        <div style={{ height: "var(--s-5)" }} />
        <FichaLayout
          main={
            <>
              <FichaHead
                eyebrow={`Compañía · ${c.disciplines.map(disciplineName).join(" · ")}`}
                title={c.name}
                subtitle={c.legal_name && c.legal_name !== c.name ? c.legal_name : null}
                avatar={<Avatar name={c.name} size={72} square />}
                verification={c.verification}
                facts={
                  <>
                    <span><Link href={communeUrl(c.commune)}>{communeName(c.commune)}</Link>{province && <>, <Link href={provinceUrl(province.slug)}>Provincia de {provinceShortName(province)}</Link></>}</span>
                    {c.other_communes.length > 0 && <span>También en {c.other_communes.map((o, i) => <span key={o}>{i > 0 ? ", " : ""}<Link href={communeUrl(o)}>{communeName(o)}</Link></span>)}</span>}
                    {c.founded_year && <span>Desde {c.founded_year}</span>}
                    <span>{STATUS_LABEL[c.status]}{c.last_activity_at ? ` · actividad ${formatMonth(c.last_activity_at)}` : ""}</span>
                    {c.audiences.length > 0 && <span>Público: {c.audiences.map(audienceName).join(", ").toLowerCase()}</span>}
                  </>
                }
              />
              {c.description_md && <Markdown className="prose lead" text={c.description_md} />}
              {c.trajectory_md && <Block title="Trayectoria" id="trayectoria"><Markdown className="prose" text={c.trajectory_md} /></Block>}
              {(members.length > 0 || c.members_text.length > 0) && (
                <Block title="Integrantes" id="integrantes">
                  <ul className="rule-list">
                    {members.map(({ artist, role }) => (
                      <li key={artist.slug}><Link href={`/artistas/${artist.slug}`} style={{ fontFamily: "var(--display)", fontSize: "1.15rem", textDecoration: "none" }}>{artist.name}</Link> <span className="small muted">· {role}</span></li>
                    ))}
                    {c.members_text.map((m) => <li key={m}>{m} <span className="small muted">· sin ficha todavía</span></li>)}
                  </ul>
                </Block>
              )}
              {works.length > 0 && (
                <Block title="Obras" id="obras"><div className="grid-2">{works.map((w) => <WorkCard key={w.slug} w={w} />)}</div></Block>
              )}
              {c.festivals.length > 0 && <Block title="Festivales" id="festivales"><FestivalList items={c.festivals} /></Block>}
              {c.funding_awards.length > 0 && <Block title="Fondos adjudicados" id="fondos"><FundingList items={c.funding_awards} /></Block>}
              {c.recognitions.length > 0 && <Block title="Reconocimientos" id="reconocimientos"><RecognitionList items={c.recognitions} /></Block>}
              {episodes.length > 0 && (
                <Block title="En De Cuento en Cuento" id="dcc"><div className="grid-2">{episodes.map((e) => <EpisodeCard key={e.slug} e={e} />)}</div></Block>
              )}
              <SourceList sources={c.sources} />
              {c.verification.note && <p className="small muted">Nota de verificación: {c.verification.note}</p>}
            </>
          }
          aside={
            <>
              <AsideBox title="Contacto"><ContactBlock website={c.website} social={c.social} email={c.email} authorized={c.contact_authorized} territory={c.commune} slug={c.slug} /></AsideBox>
              <AsideBox title="Territorio">
                <ul style={{ listStyle: "none", display: "grid", gap: "var(--s-1)", fontSize: "var(--t-sm)" }}>
                  <li><Link href={communeUrl(c.commune)}>Todo en {communeName(c.commune)}</Link></li>
                  {province && <li><Link href={provinceUrl(province.slug)}>Provincia de {provinceShortName(province)}</Link></li>}
                  <li><Link href={`/companias?comuna=${c.commune}`}>Otras compañías de la comuna</Link></li>
                </ul>
              </AsideBox>
              <AsideBox title="Disciplinas">
                <ul className="chips">{c.disciplines.map((d) => <li key={d}><Link className="chip" href={`/buscar?q=${encodeURIComponent(disciplineName(d))}`}>{disciplineName(d)}</Link></li>)}</ul>
              </AsideBox>
              {c.tags.length > 0 && <AsideBox title="Etiquetas"><TextList items={c.tags} /></AsideBox>}
            </>
          }
        />
      </article>
      {province && <SigueExplorando province={province.slug} exclude={{ type: "company", slug: c.slug }} />}
    </>
  );
}
