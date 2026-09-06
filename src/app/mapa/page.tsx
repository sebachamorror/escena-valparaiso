import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { TerritoryCard } from "@/components/cards/TerritoryCard";
import { RegionMap } from "@/components/map/RegionMap";
import { loadRegionGeo } from "@/lib/geo/load";
import { communesOfProvince, listCommunes, listProvinces, provinceShortName, provinceUrl } from "@/lib/data/territories";
import { countsForCommune, countsForProvince } from "@/lib/queries/entities";
import { episodesInCommune, episodesInProvince } from "@/lib/queries/series";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Mapa de las artes escénicas de la Región de Valparaíso",
  description: "Mapa regional de compañías, artistas, espacios, cartelera, contenidos y episodios de Quinta Escena Podcast por provincia y comuna, con Isla de Pascua y Juan Fernández.",
  path: "/mapa",
});

const LAYERS = ["Qué está pasando", "Quiénes lo hacen", "Dónde trabajan", "Qué contenidos existen", "Quinta Escena Podcast", "Espacios escénicos"];

export default function MapPage() {
  const geo = loadRegionGeo();
  const counts = Object.fromEntries(listCommunes().map((c) => [c.slug, countsForCommune(c.slug, episodesInCommune(c.slug).length)]));
  return (
    <div className="wrap">
      <PageHeader
        eyebrow="Mapa regional"
        title="El mapa es un índice"
        lead="Un mapa exclusivo de la Región de Valparaíso, con seis capas y las ocho provincias. Se dibuja únicamente con la división político-administrativa oficial de Chile; ninguna coordenada se inventa."
        crumbs={[{ name: "Mapa", href: "/mapa" }]}
      >
        <ul className="chips" style={{ marginTop: "var(--s-4)" }} aria-label="Capas del mapa">
          {LAYERS.map((l, i) => <li key={l} className="chip" aria-disabled="true">{i + 1} · {l}</li>)}
        </ul>
      </PageHeader>
      {geo ? (
        <div style={{ marginBottom: "var(--s-7)" }}>
          <RegionMap counts={counts} />
          <p className="small muted" style={{ marginTop: "var(--s-3)" }}>Toca o enfoca una comuna para ver sus registros y entrar a su página. La lista de abajo es el mismo mapa en forma de texto.</p>
        </div>
      ) : (
        <p className="note" style={{ marginBottom: "var(--s-6)" }}>
          La geometría oficial de comunas todavía no se ha descargado ni registrado en <code>public/geo/FUENTES.md</code>. Mientras tanto, este índice territorial es el mismo mapa en forma de lista.
        </p>
      )}
      <div className="grid" style={{ marginBottom: "var(--s-8)" }}>
        {listProvinces().map((p) => (
          <TerritoryCard key={p.slug} href={provinceUrl(p.slug)} name={provinceShortName(p)} kind="Provincia" insular={p.insular} sub={`${communesOfProvince(p.slug).length} comunas`} counts={countsForProvince(p.slug, episodesInProvince(p.slug).length)} />
        ))}
      </div>
      <p><Link href="/territorios" className="btn">Índice completo de comunas</Link></p>
    </div>
  );
}
