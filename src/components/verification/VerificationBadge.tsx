import { t } from "@/content/es-CL";
import { formatDate } from "@/lib/format";
import type { Verification } from "@/lib/data/types";
import styles from "@/components/ui/ui.module.css";

/** Estado de verificación visible en cada ficha (nunca "muestra" ni "demo"). */
export function VerificationBadge({ v, withHelp = false }: { v: Verification; withHelp?: boolean }) {
  const label = t.verification[v.status];
  const date = v.status === "verificado" ? formatDate(v.verified_at) : null;
  return (
    <div>
      <span className={`${styles.badge} ${styles[v.status]}`}>
        {label}{date ? ` · ${date}` : ""} · {v.confidence_score}/100
      </span>
      {withHelp && v.status !== "verificado" && (
        <p className="small muted" style={{ marginTop: "var(--s-2)", maxWidth: "60ch" }}>{t.verification.pendingHelp}</p>
      )}
    </div>
  );
}
