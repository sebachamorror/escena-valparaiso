import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PostaTimeline } from "@/components/dcc/PostaTimeline";
import { getPosta } from "@/lib/queries/series";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "La Posta · De Cuento en Cuento",
  description: "Siete entregas y siete recepciones: al final de cada encuentro, el artista entrega un objeto y un mensaje que viajan en Molière hasta el siguiente territorio de la Región de Valparaíso.",
  path: "/de-cuento-en-cuento/la-posta",
});

export default function PostaPage() {
  const posta = getPosta();
  return (
    <div className="wrap">
      <PageHeader
        eyebrow="De Cuento en Cuento"
        title="La Posta"
        lead="Al final de cada encuentro, la persona protagonista entrega un objeto vinculado a su práctica y un mensaje para quien sigue. El objeto viaja en Molière; el mensaje se presenta al siguiente artista. Siete agentes de siete territorios que no se conocían."
        crumbs={[{ name: "De Cuento en Cuento", href: "/de-cuento-en-cuento" }, { name: "La Posta", href: "/de-cuento-en-cuento/la-posta" }]}
      />
      <p className="note note-sea" style={{ marginBottom: "var(--s-6)" }}>Objeto y mensaje se publican cuando ocurren, nunca antes. Hoy las siete entregas están pendientes.</p>
      <PostaTimeline handovers={posta.handovers} />
    </div>
  );
}
