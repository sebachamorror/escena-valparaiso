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
import { craftName, disciplineName } from "@/lib/data/vocab";
import { isIndexable } from "@/lib/data/visibility";
import { getArtist, getCompany, listArtists, worksOfArtist } from "@/lib/queries/entities";
import { episodesOfArtist } from "@/lib/queries/series";
import { artistJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return listArtists().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArtist(slug);
  if (!a) return {};
  return pageMetadata({
    title: `${a.name} · ${a.crafts.map(craftName).join(", ")} · ${communeName(a.commune)}`,
    description: plainText(a.bio_md, 160) || `${a.name}, ${communeName(a.commune)}, Región de Valparaíso.`,
    path: `/artistas/${a.slug}`,
    index: isIndexable(a),
  });
}

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArtist(slug);
  if (!a) notFound();
  const commune = getCommune(a.commune);
  const province = commune ? getProvince(commune.province) : undefined;
  const works = worksOfArtist(a.slug);
  const episodes = episodesOfArtist(a.slug);
  const companies = a.companies.map((m) => ({ ...m, entity: getCompany(m.company) }));

  return (
    <>
      <article className="wrap" style={{ paddingTop: "var(--s-5)" }}>
        <JsonLd data={artistJsonLd(a)} />
        <Breadcrumbs items={[{ name: "Artistas", href: "/artistas" }, { name: a.name, href: `/artistas/${a.slug}` }]} />
        <div style={{ height: "var(--s-5)" }} />
        <FichaLayout
          main={
            <>
              <FichaHead
                eyebrow={`Artista · ${a.crafts.map(craftName).join(" · ")}`}
                title={a.name}
                subtitle={a.artistic_name}
                avatar={<Avatar name={a.name} size={72} />}
                verification={a.verification}
                facts={
                  <>
                    <span><Link href={communeUrl(a.commune)}>{communeName(a.commune)}</Link>{province && <>, <Link href={provinceUrl(province.slug)}>Provincia de {provinceShortName(province)}</Link></>}</span>
                    {a.disciplines.length > 0 && <span>{a.disciplines.map(disciplineName).join(", ")}</span>}
                  </>
                }
              />
              {a.bio_md && <Markdown className="prose lead" text={a.bio_md} />}
              {a.specialties.length > 0 && (
                <ul className="chips" aria-label="Especialidades">{a.specialties.map((s) => <li key={s} className="chip">{s}</li>)}</ul>
              )}
              {a.trajectory_md && <Block title="Trayectoria" id="trayectoria"><Markdown className="prose" text={a.trajectory_md} /></Block>}
              {(companies.length > 0 || a.companies_text.length > 0) && (
                <Block title="Compañías y agrupaciones" id="companias">
                  <ul className="rule-list">
                    {companies.map((m) => (
                      <li key={m.company}>
                        {m.entity ? <Link href={`/companias/${m.entity.slug}`} style={{ fontFamily: "var(--display)", fontSize: "1.15rem", textDecoration: "none" }}>{m.entity.name}</Link> : m.company}
                        <span className="small muted"> · {m.role}{m.from_year ? ` · desde ${m.from_year}` : ""}{m.to_year ? ` hasta ${m.to_year}` : ""}</span>
                      </li>
                    ))}
                    {a.companies_text.map((c) => <li key={c}>{c} <span className="small muted">· sin ficha todavía</span></li>)}
                  </ul>
                </Block>
              )}
              {(works.length > 0 || a.works_text.length > 0) && (
                <Block title="Obras" id="obras">
                  {works.length > 0 && <div className="grid-2" style={{ marginBottom: a.works_text.length ? "var(--s-4)" : 0 }}>{works.map(({ work }) => <WorkCard key={work.slug} w={work} />)}</div>}
                  {a.works_text.length > 0 && <TextList items={a.works_text.map((w) => `${w} · sin ficha todavía`)} />}
                </Block>
              )}
              {a.training.length > 0 && (
                <Block title="Formación" id="formacion">
                  <TextList items={a.training.map((tr) => `${tr.title}${tr.institution && tr.institution !== "[NO ENCONTRADO]" ? ` · ${tr.institution}` : ""}${tr.year ? ` · ${tr.year}` : ""}`)} />
                </Block>
              )}
              {a.recognitions.length > 0 && <Block title="Reconocimientos" id="reconocimientos"><RecognitionList items={a.recognitions} /></Block>}
              {a.funding_awards.length > 0 && <Block title="Fondos" id="fondos"><FundingList items={a.funding_awards} /></Block>}
              {a.festivals.length > 0 && <Block title="Festivales" id="festivales"><FestivalList items={a.festivals} /></Block>}
              {episodes.length > 0 && (
                <Block title="En Quinta Escena Podcast" id="dcc"><div className="grid-2">{episodes.map((e) => <EpisodeCard key={e.slug} e={e} protagonistName={a.name} />)}</div></Block>
              )}
              <SourceList sources={a.sources} />
              {a.verification.note && <p className="small muted">Nota de verificación: {a.verification.note}</p>}
            </>
          }
          aside={
            <>
              <AsideBox title="Contacto"><ContactBlock website={a.website} social={a.social} email={a.email_public} authorized={a.contact_authorized} territory={a.commune} slug={a.slug} /></AsideBox>
              <AsideBox title="Territorio">
                <ul style={{ listStyle: "none", display: "grid", gap: "var(--s-1)", fontSize: "var(--t-sm)" }}>
                  <li><Link href={communeUrl(a.commune)}>Todo en {communeName(a.commune)}</Link></li>
                  {province && <li><Link href={provinceUrl(province.slug)}>Provincia de {provinceShortName(province)}</Link></li>}
                </ul>
              </AsideBox>
              <AsideBox title="Oficios">
                <ul className="chips">{a.crafts.map((c) => <li key={c}><Link className="chip" href={`/oficios/${c}`}>{craftName(c)}</Link></li>)}</ul>
              </AsideBox>
            </>
          }
        />
      </article>
      {province && <SigueExplorando province={province.slug} exclude={{ type: "artist", slug: a.slug }} />}
    </>
  );
}
