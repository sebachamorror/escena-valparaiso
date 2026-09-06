import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import { PrintButton } from "./PrintButton";
import styles from "./propuesta.module.css";
import content from "./content.json";

export const metadata: Metadata = pageMetadata({
  title: "Propuesta de Difusión Digital 2027",
  description: "Propuesta de QUINTA ESCENA al Fondo de Artes Escénicas 2027, línea Difusión Digital: medio, plataforma web, mapa regional y Quinta Escena Podcast para las artes escénicas de la Región de Valparaíso.",
  path: "/propuesta",
  index: false,
});

const TOTAL_PAGES = content.totalPages;

/** "**negrita**" -> <b>negrita</b>, sin más sintaxis. Mantiene el JSON como texto plano editable. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return <>{parts.map((part, i) => (i % 2 === 1 ? <b key={i}>{part}</b> : part))}</>;
}

type Block =
  | { type: "p"; text: string; class?: string }
  | { type: "h3"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] }
  | { type: "flow"; items: string[] }
  | { type: "table"; headers: [string, string]; rows: [string, string][] }
  | { type: "cards"; columns: number; items: { title: string; text: string; bg?: string | null; color?: string }[] }
  | { type: "shot"; src: string; path: string; alt: string; caption: string; mockupNote?: boolean }
  | { type: "placeholder"; text: string }
  | { type: "twoColLists"; left: { heading: string; items: string[] }; right: { heading: string; items: string[] } };

function bgVar(bg?: string | null) {
  return bg ? `var(--${bg})` : undefined;
}

function Block({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return <p className={block.class}><Rich text={block.text} /></p>;
    case "h3":
      return <h3>{block.text}</h3>;
    case "quote":
      return <p className={styles.quote}><Rich text={block.text} /></p>;
    case "list":
      return (
        <ul className={styles.list}>
          {block.items.map((it) => <li key={it}><Rich text={it} /></li>)}
        </ul>
      );
    case "flow":
      return (
        <ul className={styles.flow}>
          {block.items.map((it, i) => <li key={it}>{i > 0 ? "→ " : ""}{it}</li>)}
        </ul>
      );
    case "table":
      return (
        <table className={styles.table}>
          <thead><tr><th>{block.headers[0]}</th><th>{block.headers[1]}</th></tr></thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row[0]}><td><Rich text={row[0]} /></td><td><Rich text={row[1]} /></td></tr>
            ))}
          </tbody>
        </table>
      );
    case "cards":
      return (
        <div className={styles.stepGrid} style={{ gridTemplateColumns: `repeat(${block.columns}, 1fr)` }}>
          {block.items.map((it) => (
            <div key={it.title} className={styles.step} style={{ background: bgVar(it.bg), color: it.color }}>
              <span className={styles.stepTitle}>{it.title}</span>
              <p className={styles.stepChannel}>{it.text}</p>
            </div>
          ))}
        </div>
      );
    case "shot": {
      const url = `quinta-escena.cl${block.path === "/" ? "" : block.path}`;
      return (
        <figure>
          <div className={styles.shotWrap}>
            <div className={styles.shotBar}>
              <span className={styles.shotDots}><span /><span /><span /></span>
              <span className={styles.shotUrl}>{url}</span>
              {block.mockupNote && <span className={styles.mockupTag}>Mockup</span>}
            </div>
            <img src={block.src} alt={block.alt} />
          </div>
          {block.caption && <figcaption className={styles.shotCaption}>{block.caption}</figcaption>}
        </figure>
      );
    }
    case "placeholder":
      return (
        <div className={styles.placeholder}>
          <span className={styles.placeholderLabel}>Espacio para fotografía</span>
          <p className={styles.placeholderText}>{block.text}</p>
        </div>
      );
    case "twoColLists":
      return (
        <div className={styles.twoCol}>
          <div>
            <h3>{block.left.heading}</h3>
            <ul className={styles.list}>{block.left.items.map((it) => <li key={it}>{it}</li>)}</ul>
          </div>
          <div>
            <h3>{block.right.heading}</h3>
            <ul className={styles.list}>{block.right.items.map((it) => <li key={it}>{it}</li>)}</ul>
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function PropuestaPage() {
  return (
    <>
      <div className={styles.toolbar}>
        <div className={`wrap ${styles.toolbarInner}`}>
          <p className="eyebrow" style={{ margin: 0 }}>Documento de propuesta · Fondo de Artes Escénicas 2027</p>
          <PrintButton />
        </div>
      </div>

      {/* Portada */}
      <div className={styles.cover}>
        <div className="wrap">
          <p className={`eyebrow ${styles.coverEyebrow}`}>{content.cover.eyebrow}</p>
          <h1 className={styles.coverTitle}>
            {content.cover.titleLines.map((line, i) => <span key={line}>{i > 0 && <br />}{line}</span>)}
          </h1>
          <p className={styles.coverSub}>{content.cover.subtitle}</p>
          <p className={styles.coverTag}>{content.cover.tagline}</p>
          <ul className={styles.coverMeta}>
            {content.cover.meta.map(([k, v]) => <li key={k}><span>{k}</span><b>{v}</b></li>)}
          </ul>
        </div>
      </div>

      {content.pages.map((page, i) => (
        <section key={page.id} className={`wrap ${styles.page} ${page.closing ? styles.closing : ""}`}>
          <span className={styles.pageNum}>{i + 2} / {TOTAL_PAGES}</span>
          <div className={styles.pageKicker}>
            <span className={styles.pageBadge}>{page.num}</span>
            <p className="eyebrow">{page.kicker}</p>
          </div>
          <h2 className={styles.pageTitle}>{page.title}</h2>
          {page.lead && <p className={`lead ${styles.pageLead}`}>{page.lead}</p>}
          <div className={styles.pageBody}>
            {(page.blocks as Block[]).map((block, bi) => <Block key={bi} block={block} />)}
          </div>
        </section>
      ))}
    </>
  );
}
