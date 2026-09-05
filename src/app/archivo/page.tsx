import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { t } from "@/content/es-CL";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Archivo",
  description: "Memoria de las artes escénicas de la Región de Valparaíso: compañías desaparecidas, festivales históricos, espacios cerrados, afiches, programas y testimonios.",
  path: "/archivo",
});

export default function Page() {
  return (
    <div className="wrap">
      <PageHeader eyebrow="Archivo" title="Archivo" lead="El archivo recuerda. Fotografías, afiches, programas, libretos, videos, entrevistas, documentos y testimonios; compañías desaparecidas, festivales históricos, espacios cerrados y memoria oral, con procedencia y derechos." crumbs={[{ name: "Archivo", href: "/archivo" }]} />
      <div style={{ marginBottom: "var(--s-8)" }}>
        <EmptyState text={t.empty.archive} proposeLabel="Aportar al archivo" proposeHref="/participa?tipo=documento" />
      </div>
    </div>
  );
}
