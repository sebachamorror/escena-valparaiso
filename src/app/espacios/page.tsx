import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { VenueCard } from "@/components/cards/VenueCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { t } from "@/content/es-CL";
import { previewEnabled } from "@/lib/data/visibility";
import { listVenues } from "@/lib/queries/venues";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Espacios escénicos",
  description: "Teatros, centros culturales, salas y espacios escénicos de la Región de Valparaíso, con dirección oficial y fuente.",
  path: "/espacios",
});

export default function EspaciosPage() {
  const venues = listVenues();
  return (
    <div className="wrap">
      <PageHeader eyebrow="Espacios" title="Espacios escénicos" lead="Teatros, centros culturales, salas, espacios independientes, escuelas, museos, espacios públicos y lugares no convencionales, con dirección oficial, comuna, capacidad, accesibilidad y programación. Sin coordenadas inventadas." crumbs={[{ name: "Espacios", href: "/espacios" }]} />
      {previewEnabled() && venues.length > 0 && (
        <p className="note" style={{ marginBottom: "var(--s-5)" }}>Modo previsualización: estas fichas están en verificación y no se han publicado.</p>
      )}
      {venues.length ? (
        <div className="grid-3" style={{ marginBottom: "var(--s-8)" }}>{venues.map((v) => <VenueCard key={v.slug} v={v} />)}</div>
      ) : (
        <EmptyState text={t.empty.venues} proposeLabel="Proponer un espacio" proposeHref="/participa?tipo=espacio" />
      )}
    </div>
  );
}
