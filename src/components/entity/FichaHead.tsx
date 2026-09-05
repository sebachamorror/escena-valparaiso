import type { ReactNode } from "react";
import { VerificationBadge } from "@/components/verification/VerificationBadge";
import type { Verification } from "@/lib/data/types";
import styles from "./entity.module.css";

interface Props {
  eyebrow: string;
  title: string;
  subtitle?: string | null;
  facts?: ReactNode;
  verification: Verification;
  avatar?: ReactNode;
}

export function FichaHead({ eyebrow, title, subtitle, facts, verification, avatar }: Props) {
  return (
    <header className={styles.head}>
      <div className={styles.headTop}>
        {avatar}
        <div className={styles.headTitle}>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {subtitle && <p className={styles.sub}>{subtitle}</p>}
        </div>
      </div>
      {facts && <div className={styles.facts}>{facts}</div>}
      <VerificationBadge v={verification} withHelp />
    </header>
  );
}
