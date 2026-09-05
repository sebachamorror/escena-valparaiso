import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import styles from "./layout.module.css";

interface Props {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  crumbs?: Crumb[];
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, lead, crumbs, children }: Props) {
  return (
    <div className={styles.pageHead}>
      {crumbs && <Breadcrumbs items={crumbs} />}
      {eyebrow && <p className="eyebrow" style={{ marginTop: crumbs ? "var(--s-4)" : 0 }}>{eyebrow}</p>}
      <h1>{title}</h1>
      {lead && <p className="lead">{lead}</p>}
      {children}
    </div>
  );
}

export function SectionHead({ title, sub, action, id }: { title: ReactNode; sub?: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <div className={styles.sectionHead}>
      <div>
        <h2 id={id}>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {action}
    </div>
  );
}
