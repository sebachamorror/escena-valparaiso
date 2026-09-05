import type { ReactNode } from "react";
import styles from "./entity.module.css";

export function FichaLayout({ main, aside }: { main: ReactNode; aside: ReactNode }) {
  return (
    <div className={styles.ficha}>
      <div className={styles.main}>{main}</div>
      <aside className={styles.aside}>{aside}</aside>
    </div>
  );
}

export function AsideBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.asideBox}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function Block({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return (
    <section className={styles.block} aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  );
}
