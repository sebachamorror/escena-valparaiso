import Link from "next/link";
import { SearchForm } from "@/components/search/SearchForm";

export default function NotFound() {
  return (
    <div className="wrap section">
      <p className="eyebrow">Error 404</p>
      <h1 style={{ marginTop: "var(--s-3)" }}>Esta página no existe o todavía no está publicada.</h1>
      <p className="lead" style={{ marginTop: "var(--s-4)" }}>
        Puede ser una ficha en verificación, un enlace antiguo o un error de escritura. Busca lo que necesitas o explora por territorio.
      </p>
      <div style={{ marginTop: "var(--s-5)", maxWidth: 560 }}><SearchForm /></div>
      <p style={{ marginTop: "var(--s-5)" }}>
        <Link href="/territorios" className="btn">Explorar por territorio</Link>{" "}
        <Link href="/" className="btn">Volver al inicio</Link>
      </p>
    </div>
  );
}
