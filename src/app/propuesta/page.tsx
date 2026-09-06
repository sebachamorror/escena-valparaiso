import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
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

/** "**negrita**" -> <b>negrita</b> y "[texto](url)" -> <a>texto</a>. Mantiene el JSON como texto plano editable. */
function Rich({ text }: { text: string }) {
  const regex = /\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    if (match[1] !== undefined) {
      nodes.push(<b key={key++}>{match[1]}</b>);
    } else {
      nodes.push(
        <a key={key++} href={match[3]} target="_blank" rel="noopener noreferrer">{match[2]}</a>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return <>{nodes}</>;
}

type ConceptNode = { label: string; bg: string | null };

function conceptNodeColors(bg: string | null) {
  if (bg === null) return { fill: "var(--paper)", text: "var(--ink)", stroke: "var(--ink)" };
  if (bg === "ink") return { fill: "var(--ink)", text: "var(--paper)", stroke: "var(--ink)" };
  return { fill: `var(--${bg})`, text: `var(--${bg}-ink)`, stroke: "var(--ink)" };
}

/** Mapa conceptual de la portada: el isotipo al centro, recibiendo información desde los canales y las personas que la producen. */
function ConceptMap({ caption, nodes }: { caption: string; nodes: ConceptNode[] }) {
  const size = 460;
  const c = size / 2;
  const centerR = 68;
  const nodeR = 178;
  const nodeW = 138;
  const nodeH = 56;
  const logoSize = (centerR - 12) * 2;
  const step = 360 / nodes.length;
  const polar = (r: number, deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: c + r * Math.cos(rad), y: c + r * Math.sin(rad) };
  };
  return (
    <div className={styles.conceptMap}>
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={caption}>
        <defs>
          <marker id="conceptArrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-2)" />
          </marker>
        </defs>
        {nodes.map((n, i) => {
          const deg = i * step;
          const pos = polar(nodeR, deg);
          const from = polar(nodeR - nodeH / 2 - 6, deg);
          const to = polar(centerR + 10, deg);
          const { fill, text, stroke } = conceptNodeColors(n.bg);
          const words = n.label.split(" ");
          return (
            <g key={n.label}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="var(--ink-2)" strokeWidth={2.5} opacity={0.8} markerEnd="url(#conceptArrow)" />
              <rect x={pos.x - nodeW / 2} y={pos.y - nodeH / 2} width={nodeW} height={nodeH} rx={12} fill={fill} stroke={stroke} strokeWidth={2.5} />
              <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--mono)" fontWeight={700} fontSize={words.length > 1 ? 13 : 15} fill={text}>
                {words.length > 1 ? (
                  <>
                    <tspan x={pos.x} dy="-0.4em">{words[0]}</tspan>
                    <tspan x={pos.x} dy="1.15em">{words.slice(1).join(" ")}</tspan>
                  </>
                ) : n.label}
              </text>
            </g>
          );
        })}
        <circle cx={c} cy={c} r={centerR} fill="var(--paper)" stroke="var(--ink)" strokeWidth={3} />
        <image href="/logo-quinta-escena.png" x={c - logoSize / 2} y={c - logoSize / 2} width={logoSize} height={logoSize} />
      </svg>
      <p className={styles.conceptMapCaption}>{caption}</p>
    </div>
  );
}

type Block =
  | { type: "p"; text: string; class?: string }
  | { type: "h3"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] }
  | { type: "flow"; items: string[] }
  | { type: "table"; headers: [string, string]; rows: [string, string][] }
  | { type: "cards"; columns: number; items: { title: string; text: string; bg?: string | null; color?: string }[] }
  | { type: "shot"; src: string; path: string; alt: string; caption: string; mockupNote?: boolean; heightMm?: number }
  | { type: "placeholder"; text: string }
  | { type: "twoColLists"; left: { heading: string; items: string[] }; right: { heading: string; items: string[] } }
  | { type: "logos"; items: { src: string; label: string }[] }
  | { type: "mockups"; items: { src: string; label: string }[] }
  | { type: "people"; caption?: string; items: { src: string; name: string; role: string; bg?: string | null }[] };

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
        <div className="scroll-x">
          <table className={styles.table}>
            <thead><tr><th>{block.headers[0]}</th><th>{block.headers[1]}</th></tr></thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row[0]}><td><Rich text={row[0]} /></td><td><Rich text={row[1]} /></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "cards":
      return (
        <div className={styles.stepGrid} style={{ "--cols": block.columns } as CSSProperties}>
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
          <div className={styles.shotWrap} style={block.heightMm ? ({ "--shot-h": `${block.heightMm}mm` } as CSSProperties) : undefined}>
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
    case "logos":
      return (
        <div className={styles.logoRow}>
          {block.items.map((it) => (
            <figure key={it.src} className={styles.logoItem}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.src} alt={`Isotipo QUINTA ESCENA — ${it.label}`} />
              <figcaption>{it.label}</figcaption>
            </figure>
          ))}
        </div>
      );
    case "mockups":
      return (
        <div className={styles.mockupGrid}>
          {block.items.map((it) => (
            <figure key={it.src} className={styles.mockupFrame}>
              <p className={styles.mockupBanner}>Concepto ilustrativo</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.src} alt={`Maqueta ilustrativa: ${it.label}`} />
              <figcaption>{it.label}</figcaption>
            </figure>
          ))}
        </div>
      );
    case "people":
      return (
        <div>
          <div className={styles.peopleGrid}>
            {block.items.map((it) => (
              <figure key={it.name} className={styles.person}>
                <div className={styles.personPhoto} style={{ boxShadow: `4px 4px 0 ${bgVar(it.bg) ?? "var(--ink)"}` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.src} alt={it.name} />
                </div>
                <figcaption>
                  <span className={styles.personName}>{it.name}</span>
                  <span className={styles.personRole}>{it.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          {block.caption && <p className={styles.peopleCaption}>{block.caption}</p>}
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
        <div className={`wrap ${styles.coverGrid}`}>
          <div className={styles.coverText}>
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
          <ConceptMap caption={content.cover.conceptMap.caption} nodes={content.cover.conceptMap.nodes} />
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
