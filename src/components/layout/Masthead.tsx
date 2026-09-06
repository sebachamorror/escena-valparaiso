import Link from "next/link";
import { NAV } from "@/lib/site";
import { t } from "@/content/es-CL";
import styles from "./layout.module.css";
import { MobileMenu } from "./MobileMenu";

export function Masthead() {
  return (
    <header className={`${styles.masthead} site-masthead`}>
      <div className={`wrap ${styles.bar}`}>
        <Link href="/" className={styles.brand} aria-label="QUINTA ESCENA, inicio">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-quinta-escena.png" alt="QUINTA ESCENA" className={styles.brandLogo} />
        </Link>
        <nav className={styles.nav} aria-label="Secciones">
          <ul className={styles.navList}>
            {NAV.map((n) => (
              <li key={n.href}><Link href={n.href}>{n.label}</Link></li>
            ))}
          </ul>
        </nav>
        <div className={styles.tools}>
          <Link href="/buscar" className={styles.iconBtn} aria-label={t.search}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
            <span>{t.search}</span>
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
