"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NAV, NAV_TRANSVERSAL } from "@/lib/site";
import { t } from "@/content/es-CL";
import styles from "./layout.module.css";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      openerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        className={`${styles.iconBtn} ${styles.menuBtn}`}
        aria-expanded={open}
        aria-controls="menu-principal"
        onClick={() => setOpen(true)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
        <span>{t.menu}</span>
      </button>
      {open && (
        <div id="menu-principal" className={styles.panel} role="dialog" aria-modal="true" aria-label={t.menu}>
          <div className={styles.panelTop}>
            <span className="eyebrow">ESCENA VALPARAÍSO</span>
            <button ref={closeRef} type="button" className={styles.iconBtn} onClick={() => setOpen(false)}>
              {t.close}
            </button>
          </div>
          <nav aria-label="Secciones">
            <ul className={styles.panelList}>
              {NAV.map((n) => (
                <li key={n.href}><Link href={n.href} onClick={() => setOpen(false)}>{n.label}</Link></li>
              ))}
            </ul>
            <ul className={`${styles.panelList} ${styles.panelSecondary}`} style={{ borderTop: 0 }}>
              {NAV_TRANSVERSAL.map((n) => (
                <li key={n.href}><Link href={n.href} onClick={() => setOpen(false)}>{n.label}</Link></li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
