import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { ArtistCard } from "@/components/cards/ArtistCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { communeName } from "@/lib/data/territories";
import { disciplineName } from "@/lib/data/vocab";
import { getArtist, getCompany } from "@/lib/queries/entities";
import { episodeUrl, listEpisodes } from "@/lib/queries/series";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Protagonistas · Quinta Escena Podcast",
  description: "Las siete personas y agrupaciones de las artes escénicas familiares que protagonizan la primera temporada de Quinta Escena Podcast en la Región de Valparaíso.",
  path: "/quinta-escena-podcast/protagonistas",
});

export default function ProtagonistsPage() {
  const episodes = listEpisodes();
  const rows = episodes.map((e) => ({ e, artist: e.protagonist_artist ? getArtist(e.protagonist_artist) : undefined, company: e.protagonist_company ? getCompany(e.protagonist_company) : undefined }));
  const visible = rows.filter((r) => r.artist);

  return (
    <div className="wrap">
      <PageHeader
        eyebrow="Quinta Escena Podcast"
        title="Siete protagonistas"
        lead="Una persona o agrupación por provincia continental. Cada ficha se valida con la propia persona antes de publicarse; el contacto solo aparece si lo autoriza."
        crumbs={[{ name: "Quinta Escena Podcast", href: "/quinta-escena-podcast" }, { name: "Protagonistas", href: "/quinta-escena-podcast/protagonistas" }]}
      />
      {visible.length ? (
        <ol className="rule-list" style={{ marginBottom: "var(--s-8)" }}>
          {rows.map(({ e, artist, company }) => (
            <li key={e.slug} style={{ display: "grid", gap: "var(--s-3)", paddingBlock: "var(--s-5)" }}>
              <p className="eyebrow"><Link href={episodeUrl(e)} style={{ textDecoration: "none" }}>Episodio {e.number} · {e.tramo} · {communeName(e.commune)}</Link> · {disciplineName(e.discipline)}</p>
              {artist ? (
                <div className="grid-2">
                  <ArtistCard a={artist} />
                  {company ? (
                    <p className="small" style={{ alignSelf: "center" }}>Con <Link href={`/companias/${company.slug}`}>{company.name}</Link>.</p>
                  ) : e.related.find((r) => r.type === "company") ? (
                    <p className="small" style={{ alignSelf: "center" }}>A título personal. Integrante de <Link href={`/companias/${e.related.find((r) => r.type === "company")!.slug}`}>{getCompany(e.related.find((r) => r.type === "company")!.slug)?.name ?? ""}</Link>.</p>
                  ) : (
                    <p className="small muted" style={{ alignSelf: "center" }}>A título personal.</p>
                  )}
                </div>
              ) : (
                <p className="muted">Protagonista por anunciar públicamente.</p>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState text="Los perfiles de las siete personas protagonistas se publican después de que cada una valide su ficha." proposeLabel="Ver la serie" proposeHref="/quinta-escena-podcast" />
      )}
    </div>
  );
}
