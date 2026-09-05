import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { WorkCard } from "@/components/cards/WorkCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCompany, listWorks } from "@/lib/queries/entities";
import { pageMetadata } from "@/lib/seo/metadata";
import { previewEnabled } from "@/lib/data/visibility";

export const metadata: Metadata = pageMetadata({
  title: "Obras de teatro y artes escénicas de la Región de Valparaíso",
  description: "Montajes, espectáculos y obras de compañías y artistas de la Región de Valparaíso: título, autoría, dirección, elenco, historia y funciones.",
  path: "/obras",
});

export default function WorksPage() {
  const works = listWorks();
  return (
    <div className="wrap">
      <PageHeader eyebrow="Obras" title="Obras y espectáculos" lead="Qué se monta, quién lo hace, desde cuándo y dónde se ha presentado. Las funciones próximas viven en la cartelera." crumbs={[{ name: "Obras", href: "/obras" }]} />
      {previewEnabled() && works.length > 0 && <p className="note" style={{ marginBottom: "var(--s-5)" }}>Modo previsualización: fichas en verificación, no publicadas.</p>}
      {works.length ? (
        <div className="grid-3" style={{ marginBottom: "var(--s-8)" }}>
          {works.map((w) => <WorkCard key={w.slug} w={w} companyName={w.companies[0] ? getCompany(w.companies[0])?.name : undefined} />)}
        </div>
      ) : (
        <EmptyState text="Todavía no hay obras publicadas." proposeHref="/participa?tipo=obra" proposeLabel="Proponer una obra" />
      )}
    </div>
  );
}
