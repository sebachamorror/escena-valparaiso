import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProposalForm } from "@/components/participate/ProposalForm";
import { listCommunes, listProvinces } from "@/lib/data/territories";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Participa · ¿A quién deberíamos conocer en tu territorio?",
  description: "Propón una compañía, artista, obra, espacio, festival, actividad, documento, fotografía o historia de las artes escénicas de tu comuna. Toda propuesta pasa por revisión y verificación antes de publicarse.",
  path: "/participa",
});

export default async function ParticipatePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  return (
    <div className="wrap">
      <PageHeader
        eyebrow="Participa"
        title="¿A quién deberíamos conocer en tu territorio?"
        lead="Quien no está registrado en ninguna parte no puede ser catalogado. Rompemos ese círculo contigo: cuéntanos de una compañía, una persona, una obra, un espacio, un festival, una función o una historia. Revisamos cada propuesta, buscamos fuentes y la publicamos verificada."
        crumbs={[{ name: "Participa", href: "/participa" }]}
      />
      <div style={{ maxWidth: 720, marginBottom: "var(--s-8)" }}>
        <ProposalForm
          provinces={listProvinces().map((p) => ({ slug: p.slug, name: p.name }))}
          communes={listCommunes().map((c) => ({ slug: c.slug, name: c.name, province: c.province }))}
          initial={{ kind: sp.tipo, commune: sp.comuna, province: sp.provincia, ficha: sp.ficha }}
        />
      </div>
    </div>
  );
}
