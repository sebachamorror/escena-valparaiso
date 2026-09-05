import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { CompanyCard } from "@/components/cards/CompanyCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { listCommunes, getProvince, provinceShortName } from "@/lib/data/territories";
import { listCompanies } from "@/lib/queries/entities";
import { pageMetadata } from "@/lib/seo/metadata";
import { previewEnabled } from "@/lib/data/visibility";

export const metadata: Metadata = pageMetadata({
  title: "Compañías de teatro y artes escénicas de la Región de Valparaíso",
  description: "Compañías, colectivos y agrupaciones de teatro, títeres, circo, narración oral y danza de las 38 comunas de la Región de Valparaíso, con fuentes verificadas.",
  path: "/companias",
});

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<{ comuna?: string }> }) {
  const { comuna } = await searchParams;
  const all = listCompanies();
  const filtered = comuna ? all.filter((c) => c.commune === comuna || c.other_communes.includes(comuna)) : all;
  const communesWithData = listCommunes().filter((c) => all.some((x) => x.commune === c.slug));

  return (
    <div className="wrap">
      <PageHeader
        eyebrow="Compañías"
        title="Compañías y agrupaciones"
        lead="Profesionales, independientes, comunitarias, universitarias, colectivos. Nadie queda fuera por formato o tamaño. Cada ficha muestra de dónde viene su información."
        crumbs={[{ name: "Compañías", href: "/companias" }]}
      >
        {communesWithData.length > 0 && (
          <ul className="chips" style={{ marginTop: "var(--s-4)" }} aria-label="Filtrar por comuna">
            <li><Link className="chip" href="/companias" aria-current={!comuna ? "page" : undefined} style={!comuna ? { background: "var(--ink)", color: "var(--paper)" } : undefined}>Todas</Link></li>
            {communesWithData.map((c) => (
              <li key={c.slug}>
                <Link className="chip" href={`/companias?comuna=${c.slug}`} aria-current={comuna === c.slug ? "page" : undefined} style={comuna === c.slug ? { background: "var(--ink)", color: "var(--paper)" } : undefined}>
                  {c.name} · {provinceShortName(getProvince(c.province)!)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PageHeader>
      {previewEnabled() && all.length > 0 && (
        <p className="note" style={{ marginBottom: "var(--s-5)" }}>Modo previsualización: estas fichas están en verificación y no se han publicado.</p>
      )}
      {filtered.length ? (
        <div className="grid-3" style={{ marginBottom: "var(--s-8)" }}>{filtered.map((c) => <CompanyCard key={c.slug} c={c} />)}</div>
      ) : (
        <EmptyState text="Todavía no hay compañías publicadas en este filtro. Solo aparecen fichas verificadas con fuentes." proposeHref="/participa?tipo=compania" proposeLabel="Proponer una compañía" />
      )}
    </div>
  );
}
