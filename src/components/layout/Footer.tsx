import Link from "next/link";
import { NAV, NAV_TRANSVERSAL, SITE_TAGLINE } from "@/lib/site";
import styles from "./layout.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.footerGrid}`}>
        <div>
          <p className={styles.footerTitle}>QUINTA ESCENA</p>
          <p className="small muted" style={{ maxWidth: "42ch" }}>
            {SITE_TAGLINE} Infraestructura cultural digital para las artes escénicas de las 38 comunas y 8 provincias de la Región de Valparaíso.
          </p>
          <p style={{ marginTop: "var(--s-4)" }}>
            <Link href="/participa" className="btn btn-sm">¿A quién deberíamos conocer en tu territorio?</Link>
          </p>
        </div>
        <div>
          <p className="eyebrow" style={{ marginBottom: "var(--s-3)" }}>Secciones</p>
          <ul className={styles.footerList}>
            {NAV.map((n) => <li key={n.href}><Link href={n.href}>{n.label}</Link></li>)}
          </ul>
        </div>
        <div>
          <p className="eyebrow" style={{ marginBottom: "var(--s-3)" }}>Herramientas</p>
          <ul className={styles.footerList}>
            {NAV_TRANSVERSAL.map((n) => <li key={n.href}><Link href={n.href}>{n.label}</Link></li>)}
            <li><Link href="/datos">Datos, fuentes y verificación</Link></li>
          </ul>
        </div>
      </div>
      <div className={`wrap ${styles.footerBottom}`}>
        <span>QUINTA ESCENA · Región de Valparaíso, Chile</span>
        <span>Cada dato muestra su fuente y su fecha de consulta. Nada se publica sin verificar.</span>
        <span>Quinta Escena Podcast es su primera serie original.</span>
      </div>
    </footer>
  );
}
