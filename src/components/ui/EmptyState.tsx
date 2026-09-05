import Link from "next/link";
import type { ReactNode } from "react";
import { t } from "@/content/es-CL";
import styles from "./ui.module.css";

interface Props {
  title?: ReactNode;
  text: ReactNode;
  /** Enlace de participación; por defecto /participa. */
  proposeHref?: string;
  proposeLabel?: string;
  extra?: ReactNode;
}

/** Estado vacío honesto con llamada a participar (docs/SOUL.md: "Aún no tenemos este dato. ¿Lo conoces?"). */
export function EmptyState({ title, text, proposeHref = "/participa", proposeLabel, extra }: Props) {
  return (
    <div className={styles.empty} role="status">
      {title && <p className="eyebrow">{title}</p>}
      <p>{text}</p>
      <div className={styles.emptyActions}>
        <Link href={proposeHref} className="btn btn-sm btn-sea">{proposeLabel ?? `${t.empty.know} ${t.empty.propose.toLowerCase()}`}</Link>
        {extra}
      </div>
    </div>
  );
}
