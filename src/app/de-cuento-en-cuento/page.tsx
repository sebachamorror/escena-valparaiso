import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, SectionHead } from "@/components/layout/PageHeader";
import { EpisodeCard } from "@/components/cards/EpisodeCard";
import { RouteStrip } from "@/components/dcc/RouteStrip";
import { PostaTimeline } from "@/components/dcc/PostaTimeline";
import { SourceList } from "@/components/verification/SourceList";
import { Markdown } from "@/lib/markdown";
import { disciplineName } from "@/lib/data/vocab";
import { getArtist } from "@/lib/queries/entities";
import { getPosta, getSeries, listEpisodes } from "@/lib/queries/series";
import { pageMetadata } from "@/lib/seo/metadata";
import dcc from "@/components/dcc/dcc.module.css";

export const metadata: Metadata = pageMetadata({
  title: "De Cuento en Cuento · serie original",
  description: "Un juglar recorre la Región de Valparaíso en un furgón amarillo llamado Molière para descubrir a quienes mantienen vivas sus artes escénicas. Siete capítulos, siete provincias, de la cordillera al mar.",
  path: "/de-cuento-en-cuento",
});

export default function SeriesPage() {
  const s = getSeries();
  const episodes = listEpisodes();
  const posta = getPosta();
  const outputs = s.committed_outputs as Record<string, number | number[] | string>;

  return (
    <>
      <div className={dcc.band}>
        <div className={`wrap ${dcc.bandInner}`}>
          <p className={dcc.kicker}>Serie original de ESCENA VALPARAÍSO · Temporada {s.season} · {s.status === "planificada" ? "en preparación" : s.status}</p>
          <h1 className={dcc.title} style={{ marginTop: "var(--s-3)" }}>De Cuento <em>en</em> Cuento</h1>
          <p className={dcc.descriptor} style={{ marginTop: "var(--s-2)" }}>{s.descriptor}</p>
          <p className="lead" style={{ marginTop: "var(--s-4)", color: "inherit" }}>{s.subtitle}</p>
          <RouteStrip episodes={episodes} />
          <ol className={dcc.structure} style={{ marginTop: "var(--s-5)" }} aria-label="Estructura de cada capítulo">
            {s.episode_structure.map((x) => <li key={x}>{x}</li>)}
          </ol>
        </div>
      </div>

      <div className="wrap">
        <section className="section" aria-labelledby="que-es">
          <div className="grid-2" style={{ alignItems: "start" }}>
            <div>
              <SectionHead id="que-es" title="Qué es" />
              <Markdown className="prose" text={s.description_md} />
              <p className="prose">Disciplinas de las personas protagonistas: {s.disciplines.map(disciplineName).join(", ").toLowerCase()}. Lenguajes del juglar: {s.series_tags.map(disciplineName).join(" y ").toLowerCase()}.</p>
              <ul className="chips" style={{ marginTop: "var(--s-4)" }}>
                {s.campaign_questions.map((q) => <li key={q} className="chip" style={{ textTransform: "none", letterSpacing: 0 }}>{q}</li>)}
              </ul>
            </div>
            <div>
              <SectionHead title="El dispositivo" />
              <dl className="dl">
                <dt>Molière</dt><dd>{s.device.vehicle}</dd>
                <dt>La Caja</dt><dd>{s.device.box}</dd>
                <dt>Sillas</dt><dd>{s.device.chairs}</dd>
              </dl>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="episodios">
          <SectionHead id="episodios" title="Siete capítulos" sub="De la cordillera al mar. Partida y retorno desde San Antonio." action={<Link href="/de-cuento-en-cuento/protagonistas" className="link-more">Protagonistas</Link>} />
          <div className="grid-3">
            {episodes.map((e) => <EpisodeCard key={e.slug} e={e} protagonistName={e.protagonist_artist ? getArtist(e.protagonist_artist)?.name : null} />)}
          </div>
        </section>

        <section className="section" aria-labelledby="posta">
          <SectionHead id="posta" title="La Posta" sub="Un objeto y un mensaje viajan en Molière hasta el siguiente territorio." action={<Link href="/de-cuento-en-cuento/la-posta" className="link-more">Las siete entregas</Link>} />
          <PostaTimeline handovers={posta.handovers.slice(0, 3)} />
          <p><Link href="/de-cuento-en-cuento/la-posta" className="btn btn-sm">Ver la posta completa</Link></p>
        </section>

        <section className="section" aria-labelledby="compromisos">
          <SectionHead id="compromisos" title="Lo que la serie compromete" sub="Fuente: propuesta de difusión vigente." />
          <dl className="dl">
            <dt>Capítulos</dt><dd>{String(outputs.episodes)} de {Array.isArray(outputs.episode_duration_min) ? outputs.episode_duration_min.join(" a ") : ""} minutos</dd>
            <dt>Cápsulas</dt><dd>al menos {String(outputs.capsules_min)} verticales</dd>
            <dt>Audio</dt><dd>{String(outputs.audio_versions)} versiones</dd>
            <dt>Posta</dt><dd>{String(outputs.posta_handovers)} entregas, {String(outputs.objects_in_moliere)} objetos incorporados a Molière</dd>
            <dt>Accesibilidad</dt><dd>subtítulos en el {String(outputs.subtitles_pct)}% de los contenidos; lengua de señas en al menos {String(outputs.sign_language_episodes_min)} capítulos</dd>
            <dt>Plataforma</dt><dd>operativa al menos {String(outputs.platform_min_years_after)} años después de terminado el proyecto</dd>
          </dl>
          <div style={{ marginTop: "var(--s-6)" }}><SourceList sources={s.sources} id="fuentes-serie" /></div>
        </section>
      </div>
    </>
  );
}
