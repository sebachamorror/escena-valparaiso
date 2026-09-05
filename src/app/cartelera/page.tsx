import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { t } from "@/content/es-CL";
import { listProvinces, provinceShortName, provinceUrl } from "@/lib/data/territories";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Cartelera de teatro y artes escénicas de la Región de Valparaíso",
  description: "Funciones y actividades de teatro, títeres, circo, narración oral y danza hoy, esta semana y este mes en las 38 comunas de la Región de Valparaíso, con fuente oficial.",
  path: "/cartelera",
});

const VIEWS = ["Hoy", "Esta semana", "Este mes", "Por comuna", "Por disciplina", "Por público"];

export default function CarteleraPage() {
  return (
    <div className="wrap">
      <PageHeader
        eyebrow="Cartelera"
        title="Qué está pasando"
        lead="Funciones y actividades con fecha, hora, lugar y fuente oficial del espacio o de la compañía. Nunca copiamos carteleras de agregadores; ninguna función vencida queda visible."
        crumbs={[{ name: "Cartelera", href: "/cartelera" }]}
      >
        <ul className="chips" style={{ marginTop: "var(--s-4)" }} aria-label="Vistas de la cartelera">
          {VIEWS.map((v) => <li key={v} className="chip" aria-disabled="true">{v}</li>)}
        </ul>
      </PageHeader>
      <div style={{ display: "grid", gap: "var(--s-6)", marginBottom: "var(--s-8)" }}>
        <EmptyState title="Próximas funciones" text={t.empty.events} proposeLabel="Avisar de una función" proposeHref="/participa?tipo=actividad" />
        <section aria-labelledby="por-provincia">
          <h2 id="por-provincia" style={{ fontSize: "var(--t-lg)", marginBottom: "var(--s-3)" }}>Cartelera por provincia</h2>
          <ul className="chips">
            {listProvinces().map((p) => <li key={p.slug}><Link className="chip" href={`${provinceUrl(p.slug)}#cartelera`}>{provinceShortName(p)}</Link></li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}
