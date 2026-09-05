import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AsideBox, Block, FichaLayout } from "@/components/entity/FichaLayout";
import { FichaHead } from "@/components/entity/FichaHead";
import { TextList } from "@/components/entity/Records";
import { SigueExplorando } from "@/components/entity/SigueExplorando";
import { SourceList } from "@/components/verification/SourceList";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { JsonLd } from "@/components/ui/JsonLd";
import { Markdown, plainText } from "@/lib/markdown";
import { communeName, communeUrl, getCommune, getProvince, provinceShortName, provinceUrl } from "@/lib/data/territories";
import { audienceName, disciplineName } from "@/lib/data/vocab";
import { isIndexable } from "@/lib/data/visibility";
import { getArtist, getCompany, getWork, listWorks } from "@/lib/queries/entities";
import { workJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return listWorks().map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const w = getWork(slug);
  if (!w) return {};
  const company = w.companies[0] ? getCompany(w.companies[0]) : undefined;
  return pageMetadata({
    title: `${w.title}${company ? ` · ${company.name}` : ""}${w.communes[0] ? ` · ${communeName(w.communes[0])}` : ""}`,
    description: plainText(w.synopsis_md, 160) || `${w.title}, obra de ${w.disciplines.map(disciplineName).join(", ").toLowerCase()} de la Región de Valparaíso.`,
    path: `/obras/${w.slug}`,
    index: isIndexable(w),
  });
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = getWork(slug);
  if (!w) notFound();
  const companies = w.companies.map((c) => getCompany(c)).filter((c): c is NonNullable<typeof c> => !!c);
  const commune = w.communes[0] ? getCommune(w.communes[0]) : undefined;
  const province = commune ? getProvince(commune.province) : undefined;

  return (
    <>
      <article className="wrap" style={{ paddingTop: "var(--s-5)" }}>
        <JsonLd data={workJsonLd(w)} />
        <Breadcrumbs items={[{ name: "Obras", href: "/obras" }, { name: w.title, href: `/obras/${w.slug}` }]} />
        <div style={{ height: "var(--s-5)" }} />
        <FichaLayout
          main={
            <>
              <FichaHead
                eyebrow={`Obra · ${w.disciplines.map(disciplineName).join(" · ")}`}
                title={w.title}
                subtitle={w.authorship ? `De ${w.authorship}` : null}
                verification={w.verification}
                facts={
                  <>
                    {companies.map((c) => <span key={c.slug}><Link href={`/companias/${c.slug}`}>{c.name}</Link></span>)}
                    {w.direction && <span>Dirección: {w.direction}</span>}
                    {w.audience && <span>Público: {audienceName(w.audience).toLowerCase()}</span>}
                    {w.premiere_year && <span>Estreno {w.premiere_year}</span>}
                    {w.duration_min && <span>{w.duration_min} min</span>}
                    {commune && <span><Link href={communeUrl(commune.slug)}>{commune.name}</Link></span>}
                  </>
                }
              />
              {w.synopsis_md ? <Markdown className="prose lead" text={w.synopsis_md} /> : <p className="muted">Aún no tenemos la sinopsis. <Link href={`/participa?ficha=${w.slug}`}>¿La conoces?</Link></p>}
              {w.credits.length > 0 && (
                <Block title="Ficha artística" id="creditos">
                  <ul className="rule-list">
                    {w.credits.map((c, i) => {
                      const artist = c.artist ? getArtist(c.artist) : undefined;
                      return (
                        <li key={i}>
                          {artist ? <Link href={`/artistas/${artist.slug}`} style={{ fontFamily: "var(--display)", fontSize: "1.15rem", textDecoration: "none" }}>{c.name}</Link> : c.name}
                          <span className="small muted"> · {c.role}</span>
                        </li>
                      );
                    })}
                  </ul>
                </Block>
              )}
              {w.history_text.length > 0 && <Block title="Historia y funciones" id="historia"><TextList items={w.history_text} /></Block>}
              <SourceList sources={w.sources} />
              {w.verification.note && <p className="small muted">Nota de verificación: {w.verification.note}</p>}
            </>
          }
          aside={
            <>
              {(w.video_url || w.dossier_url) && (
                <AsideBox title="Material">
                  <ul style={{ listStyle: "none", display: "grid", gap: "var(--s-1)", fontSize: "var(--t-sm)" }}>
                    {w.video_url && <li><ExternalLink href={w.video_url} territory={w.communes[0]}>Video</ExternalLink></li>}
                    {w.dossier_url && <li><ExternalLink href={w.dossier_url} territory={w.communes[0]}>Dossier</ExternalLink></li>}
                  </ul>
                </AsideBox>
              )}
              {companies.length > 0 && (
                <AsideBox title="Compañía">
                  <ul style={{ listStyle: "none", display: "grid", gap: "var(--s-1)", fontSize: "var(--t-sm)" }}>
                    {companies.map((c) => <li key={c.slug}><Link href={`/companias/${c.slug}`}>{c.name}</Link></li>)}
                  </ul>
                </AsideBox>
              )}
              {province && (
                <AsideBox title="Territorio">
                  <ul style={{ listStyle: "none", display: "grid", gap: "var(--s-1)", fontSize: "var(--t-sm)" }}>
                    {w.communes.map((c) => <li key={c}><Link href={communeUrl(c)}>Todo en {communeName(c)}</Link></li>)}
                    <li><Link href={provinceUrl(province.slug)}>Provincia de {provinceShortName(province)}</Link></li>
                  </ul>
                </AsideBox>
              )}
              <AsideBox title="Corrección">
                <p className="small"><Link href={`/participa?ficha=${w.slug}`}>Corregir o completar esta ficha</Link></p>
              </AsideBox>
            </>
          }
        />
      </article>
      {province && <SigueExplorando province={province.slug} exclude={{ type: "work", slug: w.slug }} />}
    </>
  );
}
