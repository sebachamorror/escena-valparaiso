import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { TerritoryCard } from "@/components/cards/TerritoryCard";
import { communesOfProvince, communeUrl, getRegion, listProvinces, provinceShortName, provinceUrl } from "@/lib/data/territories";
import { countsForCommune, countsForProvince } from "@/lib/queries/entities";
import { episodesInCommune, episodesInProvince } from "@/lib/queries/series";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Territorios · 8 provincias y 38 comunas de la Región de Valparaíso",
  description: "Índice territorial de las artes escénicas de la Región de Valparaíso: compañías, artistas, obras, espacios, cartelera y episodios por provincia y comuna, incluidas Isla de Pascua y Juan Fernández.",
  path: "/territorios",
});

export default function TerritoriesPage() {
  const region = getRegion();
  const provinces = listProvinces();
  return (
    <div className="wrap">
      <PageHeader
        eyebrow={`${region.name} · código ${region.cut_code}`}
        title="Explora por territorio"
        lead="Se navega por territorio antes que por categoría. Las ocho provincias, incluida Isla de Pascua, existen desde el primer día. División oficial según la Biblioteca del Congreso Nacional y SUBDERE."
        crumbs={[{ name: "Territorios", href: "/territorios" }]}
      >
        <p style={{ marginTop: "var(--s-4)" }}><Link href="/mapa" className="btn btn-sm btn-sea">Ver en el mapa</Link></p>
      </PageHeader>
      {provinces.map((p) => {
        const communes = communesOfProvince(p.slug);
        const counts = countsForProvince(p.slug, episodesInProvince(p.slug).length);
        return (
          <section key={p.slug} className="section" style={{ paddingTop: "var(--s-5)" }} aria-labelledby={`prov-${p.slug}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "var(--s-3)", marginBottom: "var(--s-4)" }}>
              <div>
                <p className="eyebrow">Provincia {p.cut_code}{p.insular ? " · insular" : ""}</p>
                <h2 id={`prov-${p.slug}`}><Link href={provinceUrl(p.slug)} style={{ textDecoration: "none" }}>{provinceShortName(p)}</Link></h2>
              </div>
              <p className="num small muted">{communes.length} {communes.length === 1 ? "comuna" : "comunas"}{counts.total ? ` · ${counts.total} registros` : ""}</p>
            </div>
            <div className="grid">
              {communes.map((c) => (
                <TerritoryCard key={c.slug} href={communeUrl(c.slug)} name={c.name} kind="Comuna" insular={c.insular} counts={countsForCommune(c.slug, episodesInCommune(c.slug).length)} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
