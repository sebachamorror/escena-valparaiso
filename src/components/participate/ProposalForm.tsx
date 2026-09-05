"use client";

import { useMemo, useState } from "react";
import { track } from "@/lib/analytics/track";
import styles from "./participate.module.css";

const KINDS: { slug: string; label: string }[] = [
  { slug: "compania", label: "Compañía" }, { slug: "artista", label: "Artista" }, { slug: "obra", label: "Obra" },
  { slug: "espacio", label: "Espacio" }, { slug: "festival", label: "Festival" }, { slug: "actividad", label: "Función o actividad" },
  { slug: "documento", label: "Documento" }, { slug: "fotografia", label: "Fotografía" }, { slug: "historia", label: "Historia" },
];

interface Props {
  provinces: { slug: string; name: string }[];
  communes: { slug: string; name: string; province: string }[];
  initial: { kind?: string; commune?: string; province?: string; ficha?: string };
}

/** Formulario de propuesta ciudadana (data/schemas/contribution.schema.json). Sin login. */
export function ProposalForm({ provinces, communes, initial }: Props) {
  const [kind, setKind] = useState(KINDS.some((k) => k.slug === initial.kind) ? initial.kind! : "compania");
  const initialCommune = communes.find((c) => c.slug === initial.commune);
  const [province, setProvince] = useState(initialCommune?.province ?? initial.province ?? "");
  const [commune, setCommune] = useState(initialCommune?.slug ?? "");
  const [state, setState] = useState<{ status: "idle" | "sending" | "ok" | "error"; message?: string }>({ status: "idle" });
  const communeOptions = useMemo(() => communes.filter((c) => !province || c.province === province), [communes, province]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    if (data.website_hp) return; // honeypot
    setState({ status: "sending" });
    try {
      const res = await fetch("/api/participa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = (await res.json()) as { ok: boolean; message: string };
      setState({ status: json.ok ? "ok" : "error", message: json.message });
      if (json.ok) { track("proposal_submitted", { kind: String(data.kind), territory: String(data.commune || data.province) }); form.reset(); }
    } catch {
      setState({ status: "error", message: "No pudimos enviar la propuesta. Inténtalo de nuevo en unos minutos." });
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {initial.ficha && <input type="hidden" name="ficha" value={initial.ficha} />}
      <fieldset className={styles.field} style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ fontWeight: 600, fontSize: "var(--t-sm)", marginBottom: "var(--s-2)" }}>¿Qué propones?</legend>
        <div className={styles.kinds}>
          {KINDS.map((k) => (
            <label key={k.slug} className={styles.kind}>
              <input type="radio" name="kind" value={k.slug} checked={kind === k.slug} onChange={() => setKind(k.slug)} />
              {k.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.field}>
        <label htmlFor="name">Nombre de la compañía, persona, obra, espacio o actividad</label>
        <input id="name" name="name" className={styles.input} required maxLength={200} />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="province">Provincia</label>
          <select id="province" name="province" className={styles.select} value={province} onChange={(e) => { setProvince(e.target.value); setCommune(""); }} required>
            <option value="">Elegir provincia</option>
            {provinces.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="commune">Comuna</label>
          <select id="commune" name="commune" className={styles.select} value={commune} onChange={(e) => setCommune(e.target.value)} required>
            <option value="">Elegir comuna</option>
            {communeOptions.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="proposal">Cuéntanos</label>
        <textarea id="proposal" name="proposal" className={styles.textarea} required minLength={20} maxLength={4000} placeholder="Qué hace, desde cuándo, con quién, dónde. Todo lo que sepas ayuda a verificar." />
        <small>Entre 20 y 4.000 caracteres.</small>
      </div>

      <div className={styles.field}>
        <label htmlFor="provided_source">Fuente (opcional)</label>
        <input id="provided_source" name="provided_source" className={styles.input} placeholder="Sitio web, red social oficial, nota de prensa, programa…" maxLength={500} />
        <small>Un enlace o una referencia donde podamos comprobar la información.</small>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="proposer_name">Tu nombre (opcional)</label>
          <input id="proposer_name" name="proposer_name" className={styles.input} maxLength={120} autoComplete="name" />
        </div>
        <div className={styles.field}>
          <label htmlFor="proposer_contact">Tu correo (opcional)</label>
          <input id="proposer_contact" name="proposer_contact" type="email" className={styles.input} maxLength={200} autoComplete="email" />
          <small>Solo para preguntarte algo sobre la propuesta.</small>
        </div>
      </div>

      <label className={styles.check}>
        <input type="checkbox" name="contact_consent" value="1" />
        <span>Autorizo que me contacten por esta propuesta. Mis datos no se publican.</span>
      </label>

      <div style={{ position: "absolute", left: -9999 }} aria-hidden="true">
        <label>No llenar<input type="text" name="website_hp" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div>
        <button type="submit" className="btn btn-primary" disabled={state.status === "sending"}>
          {state.status === "sending" ? "Enviando…" : "Enviar propuesta"}
        </button>
      </div>

      {state.status === "ok" && <p className={`${styles.result} ${styles.ok}`} role="status">{state.message}</p>}
      {state.status === "error" && <p className={`${styles.result} ${styles.err}`} role="alert">{state.message}</p>}
    </form>
  );
}
