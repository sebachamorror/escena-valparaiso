import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { ArtistCard } from "@/components/cards/ArtistCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { craftName, listCrafts } from "@/lib/data/vocab";
import { listArtists } from "@/lib/queries/entities";
import { pageMetadata } from "@/lib/seo/metadata";
import { previewEnabled } from "@/lib/data/visibility";

export const metadata: Metadata = pageMetadata({
  title: "Artistas escénicos de la Región de Valparaíso",
  description: "Actores, actrices, directores, dramaturgas, titiriteros, payasos, narradoras orales, músicos escénicos, técnicos y gestoras de la Región de Valparaíso, con fuentes verificadas.",
  path: "/artistas",
});

export default async function ArtistsPage({ searchParams }: { searchParams: Promise<{ oficio?: string }> }) {
  const { oficio } = await searchParams;
  const all = listArtists();
  const filtered = oficio ? all.filter((a) => a.crafts.includes(oficio)) : all;
  const craftsWithData = listCrafts().filter((c) => all.some((a) => a.crafts.includes(c.slug)));

  return (
    <div className="wrap">
      <PageHeader
        eyebrow="Artistas"
        title="Quienes hacen la escena"
        lead="Personas y oficios, no «actores del sector». Cada ficha se valida con la propia persona antes de publicarse y muestra solo contacto público o autorizado."
        crumbs={[{ name: "Artistas", href: "/artistas" }]}
      >
        {craftsWithData.length > 0 && (
          <ul className="chips" style={{ marginTop: "var(--s-4)" }} aria-label="Filtrar por oficio">
            <li><Link className="chip" href="/artistas" style={!oficio ? { background: "var(--ink)", color: "var(--paper)" } : undefined}>Todos</Link></li>
            {craftsWithData.map((c) => (
              <li key={c.slug}><Link className="chip" href={`/artistas?oficio=${c.slug}`} style={oficio === c.slug ? { background: "var(--ink)", color: "var(--paper)" } : undefined}>{c.name}</Link></li>
            ))}
          </ul>
        )}
      </PageHeader>
      {previewEnabled() && all.length > 0 && (
        <p className="note" style={{ marginBottom: "var(--s-5)" }}>Modo previsualización: estas fichas están en verificación y se validarán con cada persona antes de publicarse.</p>
      )}
      {filtered.length ? (
        <div className="grid-3" style={{ marginBottom: "var(--s-8)" }}>{filtered.map((a) => <ArtistCard key={a.slug} a={a} />)}</div>
      ) : (
        <EmptyState text={oficio ? `Todavía no hay fichas publicadas con el oficio ${craftName(oficio).toLowerCase()}.` : "Todavía no hay artistas publicados. Solo aparecen fichas verificadas con fuentes."} proposeHref="/participa?tipo=artista" proposeLabel="Proponer a alguien" />
      )}
    </div>
  );
}
