import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { t } from "@/content/es-CL";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Espacios escénicos",
  description: "Teatros, centros culturales, salas y espacios escénicos de la Región de Valparaíso, con dirección oficial y fuente.",
  path: "/espacios",
});

export default function Page() {
  return (
    <div className="wrap">
      <PageHeader eyebrow="Espacios" title="Espacios escénicos" lead="Teatros, centros culturales, salas, espacios independientes, escuelas, museos, espacios públicos y lugares no convencionales, con dirección oficial, comuna, capacidad, accesibilidad y programación. Sin coordenadas inventadas." crumbs={[{ name: "Espacios", href: "/espacios" }]} />
      <div style={{ marginBottom: "var(--s-8)" }}>
        <EmptyState text={t.empty.venues} proposeLabel="Proponer un espacio" proposeHref="/participa?tipo=espacio" />
      </div>
    </div>
  );
}
