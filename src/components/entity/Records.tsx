import type { FestivalParticipation, FundingAward, Recognition } from "@/lib/data/types";
import { formatCLP } from "@/lib/format";
import styles from "./entity.module.css";

export function RecognitionList({ items }: { items: Recognition[] }) {
  if (!items.length) return null;
  return (
    <ul className={styles.records}>
      {items.map((r, i) => (
        <li key={i} className={styles.record}>
          <strong>{r.title}</strong>
          <span className={styles.recordMeta}>{r.org}{r.year ? ` · ${r.year}` : ""}</span>
        </li>
      ))}
    </ul>
  );
}

export function FundingList({ items }: { items: FundingAward[] }) {
  if (!items.length) return null;
  return (
    <ul className={styles.records}>
      {items.map((f, i) => (
        <li key={i} className={styles.record}>
          <strong>{f.fund_name}</strong>
          <span className={styles.recordMeta}>
            {f.org}{f.year ? ` · ${f.year}` : ""}{f.folio ? ` · folio ${f.folio}` : ""}{f.amount_clp ? ` · ${formatCLP(f.amount_clp)}` : ""}
          </span>
          {f.note && <span className="small muted">{f.note}</span>}
        </li>
      ))}
    </ul>
  );
}

export function FestivalList({ items }: { items: FestivalParticipation[] }) {
  if (!items.length) return null;
  return (
    <ul className={styles.records}>
      {items.map((f, i) => (
        <li key={i} className={styles.record}>
          <strong>{f.festival_name}</strong>
          <span className={styles.recordMeta}>{f.year ?? ""}{f.place ? ` · ${f.place}` : ""}</span>
        </li>
      ))}
    </ul>
  );
}

export function TextList({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul className={styles.records}>
      {items.map((s, i) => <li key={i} className={styles.record}>{s}</li>)}
    </ul>
  );
}
