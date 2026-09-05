import { t } from "@/content/es-CL";
import { formatDate } from "@/lib/format";
import type { Source } from "@/lib/data/types";
import { SOURCE_TYPE_LABEL } from "@/lib/data/vocab";
import styles from "@/components/ui/ui.module.css";

/** Lista de fuentes con publicador, tipo, nivel y fecha de consulta (transparencia). */
export function SourceList({ sources, id }: { sources: Source[]; id?: string }) {
  if (!sources.length) return null;
  return (
    <section aria-labelledby={id ?? "fuentes"}>
      <h2 id={id ?? "fuentes"} className="eyebrow" style={{ fontFamily: "var(--mono)", fontSize: "var(--t-xs)", marginBottom: "var(--s-3)" }}>
        {t.verification.sources}
      </h2>
      <ol className={styles.sources}>
        {sources.map((s, i) => (
          <li key={i} className={styles.source}>
            <span>
              {s.url ? (
                <a href={s.url} target="_blank" rel="noopener noreferrer" className={styles.ext}>{s.title}</a>
              ) : (
                s.title
              )}
            </span>
            <span className={styles.sourceMeta}>
              <span className={styles.sourceLevel} title={`Nivel ${s.level}`}>N{s.level}</span>
              {s.publisher} · {SOURCE_TYPE_LABEL[s.type] ?? s.type}
              {s.role ? ` · ${s.role}` : ""} · {t.verification.consulted} {formatDate(s.accessed_at)}
              {!s.url && " · sin URL pública registrada"}
            </span>
            {s.notes && <span className="small muted">{s.notes}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}
