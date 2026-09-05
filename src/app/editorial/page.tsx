import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { t } from "@/content/es-CL";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Editorial",
  description: "Entrevistas, perfiles, críticas, crónicas, investigaciones y memoria de las artes escénicas de la Región de Valparaíso.",
  path: "/editorial",
});

export default function Page() {
  return (
    <div className="wrap">
      <PageHeader eyebrow="Editorial" title="Editorial" lead="La editorial explica: quién es esta persona, por qué importa este festival, qué pasó con aquel teatro. Entrevistas, críticas, columnas, investigaciones, perfiles, ensayos, noticias, crónicas y memoria. Toda afirmación con fuente." crumbs={[{ name: "Editorial", href: "/editorial" }]} />
      <div style={{ marginBottom: "var(--s-8)" }}>
        <EmptyState text={t.empty.posts} proposeLabel="Proponer una historia" proposeHref="/participa?tipo=historia" />
      </div>
    </div>
  );
}
