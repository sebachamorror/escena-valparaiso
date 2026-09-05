import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchClient } from "@/components/search/SearchClient";
import { buildSearchIndex } from "@/lib/search/index";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Buscar",
  description: "Busca compañías, artistas, obras, comunas, provincias y oficios de las artes escénicas de la Región de Valparaíso.",
  path: "/buscar",
});

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const docs = buildSearchIndex();
  return (
    <div className="wrap">
      <PageHeader eyebrow="Buscar" title="¿A quién buscas?" crumbs={[{ name: "Buscar", href: "/buscar" }]} />
      <div style={{ marginBottom: "var(--s-8)" }}>
        <Suspense fallback={<p className="muted">Cargando el buscador…</p>}>
          <SearchClient docs={docs} initialQuery={q} />
        </Suspense>
      </div>
    </div>
  );
}
