"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { t } from "@/content/es-CL";
import { track } from "@/lib/analytics/track";
import type { SearchDoc, SearchType } from "@/lib/search/types";
import { SEARCH_TYPE_LABEL } from "@/lib/search/types";
import { search } from "@/lib/search/query";
import styles from "./search.module.css";

const TYPES: SearchType[] = ["company", "artist", "work", "episode", "territory", "craft"];

export function SearchClient({ docs, initialQuery }: { docs: SearchDoc[]; initialQuery: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(initialQuery);
  const [types, setTypes] = useState<SearchType[]>([]);

  useEffect(() => { setQ(params.get("q") ?? ""); }, [params]);

  const groups = useMemo(() => search(docs, q, types), [docs, q, types]);
  const total = groups.reduce((n, g) => n + g.hits.length, 0);

  useEffect(() => {
    if (q.trim().length < 2) return;
    const id = setTimeout(() => track("search", { query: q.trim(), results: total, types: types.join(",") || "all" }), 600);
    return () => clearTimeout(id);
  }, [q, total, types]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.replace(q ? `/buscar?q=${encodeURIComponent(q)}` : "/buscar");
  }

  function toggle(tp: SearchType) {
    setTypes((cur) => (cur.includes(tp) ? cur.filter((x) => x !== tp) : [...cur, tp]));
  }

  return (
    <div>
      <form onSubmit={submit} role="search" className={`${styles.form} ${styles.big}`}>
        <label htmlFor="q" className="sr-only">{t.searchLabel}</label>
        <input id="q" name="q" type="search" className={styles.input} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchPlaceholder} autoComplete="off" autoFocus />
        <button type="submit" className="btn btn-primary">{t.search}</button>
      </form>
      <div className={styles.filters} role="group" aria-label="Filtrar por tipo">
        {TYPES.map((tp) => (
          <button key={tp} type="button" className={`chip ${styles.filter} ${types.includes(tp) ? styles.filterOn : ""}`} aria-pressed={types.includes(tp)} onClick={() => toggle(tp)}>
            {SEARCH_TYPE_LABEL[tp]}
          </button>
        ))}
      </div>
      <p className={styles.status} aria-live="polite">
        {q.trim().length === 0
          ? "Escribe el nombre de una compañía, artista, obra, comuna o oficio."
          : total === 0
            ? <>Nada con «{q}». Prueba con otra palabra o <Link href="/participa">cuéntanos a quién falta</Link>.</>
            : `${total} ${total === 1 ? "resultado" : "resultados"} para «${q}»`}
      </p>
      {groups.map((g) => (
        <section key={g.type} className={styles.group} aria-label={SEARCH_TYPE_LABEL[g.type]}>
          <h2>{SEARCH_TYPE_LABEL[g.type]} <span>{g.hits.length}</span></h2>
          <ul className="rule-list">
            {g.hits.map((h) => (
              <li key={h.url} className={styles.hit}>
                <Link href={h.url}>{h.title}</Link>
                <span>{h.subtitle}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
