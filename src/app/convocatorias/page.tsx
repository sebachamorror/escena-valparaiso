import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { t } from "@/content/es-CL";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Convocatorias para artistas escénicos",
  description: "Fondos, residencias, festivales, talleres, audiciones, becas y llamados para artistas escénicos de la Región de Valparaíso, con fechas y bases oficiales.",
  path: "/convocatorias",
});

export default function Page() {
  return (
    <div className="wrap">
      <PageHeader eyebrow="Convocatorias" title="Convocatorias para artistas escénicos" lead="Fondos concursables, residencias, festivales con convocatoria, talleres, audiciones, laboratorios, becas y llamados. Cada una con organismo, fechas, beneficiarios, requisitos y enlace oficial. Abiertas, próximas, cerradas y archivadas." crumbs={[{ name: "Convocatorias", href: "/convocatorias" }]} />
      <div style={{ marginBottom: "var(--s-8)" }}>
        <EmptyState text={t.empty.calls} proposeLabel="Avisar de una convocatoria" proposeHref="/participa?tipo=actividad" />
      </div>
    </div>
  );
}
