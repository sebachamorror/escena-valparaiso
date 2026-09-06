import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { pageMetadata } from "@/lib/seo/metadata";
import { PUBLISH_THRESHOLD } from "@/lib/data/visibility";

export const metadata: Metadata = pageMetadata({
  title: "Datos, fuentes y verificación",
  description: "Cómo QUINTA ESCENA documenta y verifica cada dato: niveles de fuente, estados de verificación, umbral de publicación, datos personales, imágenes y derecho a corrección.",
  path: "/datos",
});

export default function DataPage() {
  return (
    <div className="wrap">
      <PageHeader eyebrow="Transparencia" title="Datos, fuentes y verificación" lead="Cada dato muestra de dónde viene y cuándo se consultó. Nada se publica sin fuente ni sin pasar un umbral de confianza." crumbs={[{ name: "Datos", href: "/datos" }]} />
      <div className="prose" style={{ display: "grid", gap: "var(--s-5)", marginBottom: "var(--s-8)" }}>
        <section>
          <h2>Nunca inventamos</h2>
          <p>Artistas, compañías, obras, fechas, premios, fondos, ubicaciones, teléfonos, correos ni enlaces. Si un dato no existe, el campo queda vacío y lo decimos: «Aún no tenemos este dato. ¿Lo conoces?».</p>
        </section>
        <section>
          <h2>Niveles de fuente</h2>
          <p><strong>Nivel 1</strong>: fuentes oficiales e institucionales (sitio y redes oficiales de la propia entidad, municipalidades, teatros, universidades, Ministerio de las Culturas, SIGPA, Fondos de Cultura, Registro Ley 19.862). <strong>Nivel 2</strong>: prensa y publicaciones académicas. <strong>Nivel 3</strong>: directorios y agregadores, nunca como única fuente.</p>
        </section>
        <section>
          <h2>Estados de verificación</h2>
          <p>Toda ficha nace <em>pendiente</em>. Un verificador revisa cada fuente, confirma territorio y actividad reciente, calcula un puntaje de confianza de 0 a 100 y fija la próxima revisión. Se publica solo con estado <em>verificado</em> y puntaje igual o superior a {PUBLISH_THRESHOLD}. Si una fuente vence, la ficha pasa a <em>en revisión</em>; cartelera y convocatorias vencidas se ocultan.</p>
        </section>
        <section>
          <h2>Personas</h2>
          <p>Las fichas de personas se validan con las propias personas antes de publicarse. No guardamos RUT, direcciones particulares ni teléfonos personales. El contacto aparece solo si es público y profesional, o si la persona lo autorizó por escrito. Las sedes de artistas y compañías no se geolocalizan sin autorización: por defecto, solo la comuna.</p>
        </section>
        <section>
          <h2>Imágenes</h2>
          <p>Cada imagen lleva autor, fuente, licencia y crédito visible. No usamos resultados de buscadores de imágenes ni material protegido sin permiso. Cuando no hay foto con licencia, dejamos un espacio digno.</p>
        </section>
        <section>
          <h2>Corrección y retiro</h2>
          <p>Cualquier persona o entidad puede pedir corrección o retiro de su información desde su ficha. Se atiende en menos de 7 días; mientras tanto la ficha queda en revisión. <Link href="/participa">Escríbenos desde Participa.</Link></p>
        </section>
      </div>
    </div>
  );
}
