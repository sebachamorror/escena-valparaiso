import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AsideBox, Block, FichaLayout } from "@/components/entity/FichaLayout";
import { SigueExplorando } from "@/components/entity/SigueExplorando";
import { SourceList } from "@/components/verification/SourceList";
import { ArtistCard } from "@/components/cards/ArtistCard";
import { CompanyCard } from "@/components/cards/CompanyCard";
import { WorkCard } from "@/components/cards/WorkCard";
import { PostaTimeline } from "@/components/dcc/PostaTimeline";
import { Markdown } from "@/lib/markdown";
import { communeName, communeUrl, getProvince, provinceShortName, provinceUrl } from "@/lib/data/territories";
import { disciplineName } from "@/lib/data/vocab";
import { getArtist, getCompany, getWork } from "@/lib/queries/entities";
import { episodeUrl, episodeUrlSlug, EPISODE_STATUS_LABEL, getEpisodeByUrlSlug, getPosta, listEpisodes } from "@/lib/queries/series";
import { pageMetadata } from "@/lib/seo/metadata";
import dcc from "@/components/dcc/dcc.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return listEpisodes().map((e) => ({ slug: episodeUrlSlug(e) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = getEpisodeByUrlSlug(slug);
  if (!e) return {};
  return pageMetadata({
    title: `Episodio ${e.number}: ${communeName(e.commune)} · ${e.narrative_axis} · De Cuento en Cuento`,
    description: `${e.tramo}. ${disciplineName(e.discipline)} en ${communeName(e.commune)}, ${getProvince(e.province)?.name ?? ""}. Locación natural: ${e.natural_location ?? "por definir"}.`,
    path: episodeUrl(e),
  });
}

export default async function EpisodePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = getEpisodeByUrlSlug(slug);
  if (!e) notFound();
  const all = listEpisodes();
  const prev = all.find((x) => x.number === e.number - 1);
  const next = all.find((x) => x.number === e.number + 1);
  const artist = e.protagonist_artist ? getArtist(e.protagonist_artist) : undefined;
  const company = e.protagonist_company ? getCompany(e.protagonist_company) : undefined;
  const relatedCompanies = e.related.filter((r) => r.type === "company").map((r) => getCompany(r.slug)).filter((c): c is NonNullable<typeof c> => !!c);
  const relatedWorks = e.related.filter((r) => r.type === "work").map((r) => getWork(r.slug)).filter((w): w is NonNullable<typeof w> => !!w);
  const province = getProvince(e.province);
  const handovers = getPosta().handovers.filter((h) => h.from_episode === e.slug || h.to_episode === e.slug);

  return (
    <>
      <div className={dcc.band}>
        <div className={`wrap ${dcc.bandInner}`} style={{ paddingBottom: "var(--s-5)" }}>
          <Breadcrumbs items={[{ name: "De Cuento en Cuento", href: "/de-cuento-en-cuento" }, { name: `Episodio ${e.number}`, href: episodeUrl(e) }]} />
          <p className={dcc.kicker} style={{ marginTop: "var(--s-5)" }}>Episodio {e.number} de 7 · {e.tramo} · {EPISODE_STATUS_LABEL[e.status] ?? e.status}</p>
          <h1 className={dcc.title} style={{ marginTop: "var(--s-2)" }}>{communeName(e.commune)}: <em>{e.narrative_axis}</em></h1>
          <p className="lead" style={{ marginTop: "var(--s-3)", color: "inherit" }}>
            {disciplineName(e.discipline)} en {communeName(e.commune)}{province ? `, ${province.name}` : ""}.
            {e.title_provisional ? " Título provisional." : ""}
          </p>
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: "var(--s-6)" }}>
        <FichaLayout
          main={
            <>
              {e.synopsis_md ? <Markdown className="prose lead" text={e.synopsis_md} /> : (
                <p className="note note-sea">La sinopsis, el video, el audio y la transcripción se publican cuando el capítulo se estrena. Producción prevista para 2027.</p>
              )}
              <Block title="Protagonista" id="protagonista">
                {artist ? (
                  <div className="grid-2">
                    <ArtistCard a={artist} />
                    {company && <CompanyCard c={company} />}
                    {!company && relatedCompanies.map((c) => <CompanyCard key={c.slug} c={c} />)}
                  </div>
                ) : (
                  <p className="muted">Protagonista por anunciar públicamente. Las fichas se publican cuando cada persona valida su información.</p>
                )}
              </Block>
              {relatedWorks.length > 0 && <Block title="Obras relacionadas" id="obras"><div className="grid-2">{relatedWorks.map((w) => <WorkCard key={w.slug} w={w} />)}</div></Block>}
              <Block title="Dónde se graba" id="locaciones">
                <dl className="dl">
                  <dt>Trabajo</dt><dd>{e.work_location_text ?? "Por definir"}</dd>
                  <dt>Naturaleza</dt><dd>{e.natural_location ?? "Por definir"}{e.natural_location ? " · video podcast" : ""}</dd>
                  <dt>Comuna</dt><dd><Link href={communeUrl(e.commune)}>{communeName(e.commune)}</Link>{province && <>, <Link href={provinceUrl(province.slug)}>Provincia de {provinceShortName(province)}</Link></>}</dd>
                </dl>
                <p className="small muted" style={{ marginTop: "var(--s-3)" }}>Las sedes no se geolocalizan: solo la comuna, salvo autorización de la persona.</p>
              </Block>
              {handovers.length > 0 && <Block title="La Posta en este capítulo" id="posta"><PostaTimeline handovers={handovers} /></Block>}
              <Block title="Accesibilidad" id="accesibilidad">
                <dl className="dl">
                  <dt>Subtítulos</dt><dd>{e.has_subtitles == null ? "Comprometidos en el 100% de los contenidos" : e.has_subtitles ? "Sí" : "No"}</dd>
                  <dt>Lengua de señas</dt><dd>{e.has_sign_language == null ? "Por definir (al menos 4 de 7 capítulos)" : e.has_sign_language ? "Sí" : "No"}</dd>
                  <dt>Transcripción</dt><dd>{e.transcript_md ? "Disponible" : "Se publica con el capítulo"}</dd>
                </dl>
              </Block>
              <SourceList sources={e.sources} />
            </>
          }
          aside={
            <>
              <AsideBox title="Recorrido">
                <ul style={{ listStyle: "none", display: "grid", gap: "var(--s-2)", fontSize: "var(--t-sm)" }}>
                  {prev && <li>← <Link href={episodeUrl(prev)}>Ep. {prev.number}: {communeName(prev.commune)}</Link></li>}
                  {next && <li>→ <Link href={episodeUrl(next)}>Ep. {next.number}: {communeName(next.commune)}</Link></li>}
                  <li><Link href="/de-cuento-en-cuento">Todos los capítulos</Link></li>
                  <li><Link href="/de-cuento-en-cuento/la-posta">La Posta</Link></li>
                </ul>
              </AsideBox>
              <AsideBox title="Territorio">
                <ul style={{ listStyle: "none", display: "grid", gap: "var(--s-1)", fontSize: "var(--t-sm)" }}>
                  <li><Link href={communeUrl(e.commune)}>Todo en {communeName(e.commune)}</Link></li>
                  {province && <li><Link href={provinceUrl(province.slug)}>Provincia de {provinceShortName(province)}</Link></li>}
                  <li><Link href={`/cartelera`}>Cartelera</Link></li>
                </ul>
              </AsideBox>
              <AsideBox title="Disciplina y oficio">
                <ul className="chips"><li><Link className="chip" href={`/buscar?q=${encodeURIComponent(disciplineName(e.discipline))}`}>{disciplineName(e.discipline)}</Link></li></ul>
              </AsideBox>
            </>
          }
        />
      </div>
      {province && <SigueExplorando province={province.slug} exclude={{ type: "episode", slug: e.slug }} />}
    </>
  );
}
