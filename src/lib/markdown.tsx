import type { ReactNode } from "react";

/**
 * Renderizador mínimo de Markdown para los campos *_md de data/.
 * Soporta párrafos, *cursiva*, **negrita**, [enlace](url) y saltos de línea.
 * No admite HTML. Suficiente para descripciones y trayectorias; el cuerpo
 * editorial largo (posts) usará un parser completo en la Fase 8.
 */

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(INLINE)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(text.slice(last, idx));
    const tok = m[0];
    const key = `${keyPrefix}-${i++}`;
    if (tok.startsWith("**")) out.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("*")) out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    else {
      const lm = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(tok);
      if (lm) out.push(<a key={key} href={lm[2]} rel="noopener noreferrer" target="_blank">{lm[1]}</a>);
      else out.push(tok);
    }
    last = idx + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ text, className }: { text: string | null | undefined; className?: string }) {
  if (!text) return null;
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className={className}>
      {paragraphs.map((p, pi) => (
        <p key={pi}>
          {p.split("\n").flatMap((line, li, arr) => {
            const nodes = renderInline(line, `${pi}-${li}`);
            return li < arr.length - 1 ? [...nodes, <br key={`br-${pi}-${li}`} />] : nodes;
          })}
        </p>
      ))}
    </div>
  );
}

/** Versión en texto plano (para metadatos y descripciones). */
export function plainText(text: string | null | undefined, max = 160): string {
  if (!text) return "";
  const t = text.replace(/\*\*?([^*]+)\*\*?/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}
