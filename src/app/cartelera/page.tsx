import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { EventCard } from "@/components/cards/EventCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { t } from "@/content/es-CL";
import { previewEnabled } from "@/lib/data/visibility";
import { listProvinces, provinceShortName, provinceUrl } from "@/lib/data/territories";
import { listUpcomingOccurrences } from "@/lib/queries/events";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Cartelera de teatro y artes escénicas de la Región de Valparaíso",
  description: "Funciones y actividades de teatro, títeres, circo, narración oral y danza hoy, esta semana y este mes en las 38 comunas de la Región de Valparaíso, con fuente oficial.",
  path: "/cartelera",
});

export default function CarteleraPage() {
  const upcoming = listUpcomingOccurrences();

  return (
    <div className="wrap">
      <PageHeader
        eyebrow="Cartelera"
        title="Qué está pasando"
        lead="Funciones y actividades con fecha, hora, lugar y fuente oficial del espacio o de la compañía. Nunca copiamos carteleras de agregadores; ninguna función vencida queda visible."
        crumbs={[{ name: "Cartelera", href: "/cartelera" }]}
      />
      {previewEnabled() && upcoming.length > 0 && (
        <p className="note" style={{ marginBottom: "var(--s-5)" }}>Modo previsualización: estas funciones están en verificación y no se han publicado.</p>
      )}
      {upcoming.length ? (
        <div className="grid-3" style={{ marginBottom: "var(--s-8)" }}>{upcoming.map((o) => <EventCard key={`${o.event.slug}-${o.occurrence.starts_at}`} item={o} />)}</div>
      ) : (
        <div style={{ marginBottom: "var(--s-8)" }}>
          <EmptyState title="Próximas funciones" text={t.empty.events} proposeLabel="Avisar de una función" proposeHref="/participa?tipo=actividad" />
        </div>
      )}
      <section aria-labelledby="por-provincia">
        <h2 id="por-provincia" style={{ fontSize: "var(--t-lg)", marginBottom: "var(--s-3)" }}>Cartelera por provincia</h2>
        <ul className="chips">
          {listProvinces().map((p) => <li key={p.slug}><Link className="chip" href={`${provinceUrl(p.slug)}#cartelera`}>{provinceShortName(p)}</Link></li>)}
        </ul>
      </section>
    </div>
  );
}
