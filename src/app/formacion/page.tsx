import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { t } from "@/content/es-CL";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Formación",
  description: "Talleres, escuelas, cursos y recursos de formación en artes escénicas en la Región de Valparaíso.",
  path: "/formacion",
});

export default function Page() {
  return (
    <div className="wrap">
      <PageHeader eyebrow="Formación" title="Formación" lead="Talleres, escuelas, seminarios, cursos, clases magistrales, recursos, metodologías y bibliografía para aprender y enseñar los oficios escénicos en la región." crumbs={[{ name: "Formación", href: "/formacion" }]} />
      <div style={{ marginBottom: "var(--s-8)" }}>
        <EmptyState text={t.empty.training} proposeLabel="Proponer un taller o escuela" proposeHref="/participa?tipo=actividad" />
      </div>
    </div>
  );
}
