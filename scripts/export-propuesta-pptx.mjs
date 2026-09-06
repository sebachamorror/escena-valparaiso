#!/usr/bin/env node
/**
 * Genera una versión .pptx de src/app/propuesta/content.json para subir a Canva
 * y editar manualmente ahí. Misma fuente de datos que la página web y el PDF
 * (src/app/propuesta/page.tsx): un cambio en content.json actualiza los tres.
 *
 * Uso: node scripts/export-propuesta-pptx.mjs
 * Salida: PDF/Propuesta_Difusion_Digital_QUINTA_ESCENA_2027.pptx
 */
import pptxgen from "pptxgenjs";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const content = JSON.parse(readFileSync(path.join(ROOT, "src/app/propuesta/content.json"), "utf8"));
const OUT = path.join(ROOT, "PDF/Propuesta_Difusion_Digital_QUINTA_ESCENA_2027.pptx");

// Tokens (src/styles/tokens.css), en hex sin '#' para pptxgenjs.
const C = {
  ink: "14141A", ink2: "3A3A42", ink3: "6B6B74", paper: "FFFFFF", paper2: "F3F3F1", lineStrong: "A8A8A2",
  pink: "FF4FA0", pinkInk: "57062F", lime: "C3F53A", limeInk: "2B3A02", gold: "FFC93C", goldInk: "4A3200",
  sky: "4FC7FA", skyInk: "012C3D", violet: "9B6BF2", mint: "3FDBA0", mintInk: "023324",
};
const CARD_BG = { gold: C.gold, sky: C.sky, lime: C.lime, violet: C.violet, pink: C.pink, ink: C.ink, mint: C.mint, null: C.paper };
const CARD_INK = { gold: C.goldInk, sky: C.skyInk, lime: C.limeInk, violet: "FFFFFF", pink: C.pinkInk, ink: C.paper, mint: C.mintInk, null: C.ink };

const F_DISPLAY = "Anton";
const F_TEXT = "Space Grotesk";
const F_MONO = "Space Mono";

const PAGE_W = 8.27, PAGE_H = 11.69; // A4 vertical, en pulgadas — misma proporción que el PDF
const MARGIN = 0.55;
const CONTENT_W = PAGE_W - MARGIN * 2;

// Proporción real (alto/ancho) de cada maqueta ilustrativa, para escalarlas sin recortarlas.
const MOCKUP_RATIO = { instagram: 1400 / 693, youtube: 1066 / 1600 };

const pptx = new pptxgen();
pptx.defineLayout({ name: "A4P", width: PAGE_W, height: PAGE_H });
pptx.layout = "A4P";

/** Quita "**negrita**" y "[texto](url)" para pptx (se deja el texto plano). */
function plain(text) {
  return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1");
}

/** Divide texto en "runs" con negrita real y enlaces reales para addText. */
function richRuns(text, opts = {}) {
  const regex = /\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const runs = [];
  let lastIndex = 0;
  let m;
  while ((m = regex.exec(text))) {
    if (m.index > lastIndex) runs.push({ text: text.slice(lastIndex, m.index), options: { ...opts } });
    if (m[1] !== undefined) {
      runs.push({ text: m[1], options: { ...opts, bold: true } });
    } else {
      runs.push({ text: m[2], options: { ...opts, hyperlink: { url: m[3] }, underline: true } });
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) runs.push({ text: text.slice(lastIndex), options: { ...opts } });
  return runs;
}

function estimateLines(text, charsPerLine) {
  return Math.max(1, Math.ceil(plain(text).length / charsPerLine));
}

/** Mapa conceptual de la portada: el isotipo al centro recibiendo información desde los canales y las personas que la producen. */
function renderConceptMap(slide, map, top) {
  const nodes = map.nodes;
  const cx = MARGIN + CONTENT_W / 2;
  const centerR = 0.55;
  const nodeR = 1.55;
  const nodeW = 1.4;
  const nodeH = 0.5;
  const cy = top + nodeR + nodeH / 2;
  const step = 360 / nodes.length;
  const polar = (r, deg) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  nodes.forEach((n, i) => {
    const deg = i * step;
    const pos = polar(nodeR, deg);
    const from = polar(nodeR - nodeH / 2 - 0.08, deg);
    const to = polar(centerR + 0.12, deg);
    const fill = CARD_BG[n.bg ?? "null"];
    const textColor = CARD_INK[n.bg ?? "null"];
    const lx = Math.min(from.x, to.x), ly = Math.min(from.y, to.y);
    const lw = Math.max(Math.abs(to.x - from.x), 0.02), lh = Math.max(Math.abs(to.y - from.y), 0.02);
    slide.addShape(pptx.ShapeType.line, {
      x: lx, y: ly, w: lw, h: lh,
      flipH: to.x < from.x, flipV: to.y < from.y,
      line: { color: C.ink2, width: 1.5, endArrowType: "triangle" },
    });
    slide.addShape(pptx.ShapeType.roundRect, {
      x: pos.x - nodeW / 2, y: pos.y - nodeH / 2, w: nodeW, h: nodeH, rectRadius: 0.09,
      fill: { color: fill }, line: { color: C.ink, width: 1.5 },
    });
    slide.addText(n.label, {
      x: pos.x - nodeW / 2, y: pos.y - nodeH / 2, w: nodeW, h: nodeH,
      fontFace: F_MONO, fontSize: 10, bold: true, color: textColor, align: "center", valign: "middle",
    });
  });

  slide.addShape(pptx.ShapeType.ellipse, { x: cx - centerR, y: cy - centerR, w: centerR * 2, h: centerR * 2, fill: { color: C.paper }, line: { color: C.ink, width: 2.25 } });
  const logoR = centerR - 0.12;
  slide.addImage({ path: path.join(ROOT, "public/logo-quinta-escena.png"), x: cx - logoR, y: cy - logoR, w: logoR * 2, h: logoR * 2 });

  let yy = cy + nodeR + nodeH / 2 + 0.2;
  if (map.caption) {
    slide.addText(map.caption.toUpperCase(), { x: MARGIN, y: yy, w: CONTENT_W, h: 0.35, fontFace: F_MONO, fontSize: 9, color: C.ink3, align: "center" });
    yy += 0.35;
  }
  return yy;
}

// ---- Portada ----
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  slide.addText(content.cover.eyebrow.toUpperCase(), { x: MARGIN, y: 1.1, w: CONTENT_W, h: 0.5, fontFace: F_MONO, fontSize: 10, color: C.ink, bold: true, charSpacing: 1 });
  slide.addText(content.cover.titleLines.join("\n"), { x: MARGIN, y: 1.6, w: CONTENT_W, h: 1.8, fontFace: F_DISPLAY, fontSize: 34, color: C.ink, lineSpacing: 36 });
  slide.addText(content.cover.subtitle, { x: MARGIN, y: 3.5, w: CONTENT_W, h: 0.5, fontFace: F_TEXT, fontSize: 15, color: C.ink2 });
  slide.addText(content.cover.tagline, { x: MARGIN, y: 4.15, w: CONTENT_W, h: 0.5, fontFace: F_TEXT, italic: true, fontSize: 15, color: C.ink });
  slide.addShape(pptx.ShapeType.line, { x: MARGIN, y: 4.85, w: CONTENT_W, h: 0, line: { color: C.lineStrong, width: 0.75 } });
  let my = 5.15;
  for (const [k, v] of content.cover.meta) {
    slide.addText(k.toUpperCase(), { x: MARGIN, y: my, w: 2.2, h: 0.35, fontFace: F_MONO, fontSize: 9, color: C.ink3 });
    slide.addText(v.toUpperCase(), { x: MARGIN + 2.2, y: my, w: CONTENT_W - 2.2, h: 0.35, fontFace: F_MONO, fontSize: 9, color: C.ink, align: "right" });
    my += 0.42;
  }
  if (content.cover.conceptMap) renderConceptMap(slide, content.cover.conceptMap, my + 0.35);
}

let pageIndex = 2;
for (const page of content.pages) {
  const slide = pptx.addSlide();
  const closing = !!page.closing;
  slide.background = { color: closing ? C.pink : C.paper };
  const ink = closing ? C.pinkInk : C.ink;
  const ink3 = closing ? C.pinkInk : C.ink3;

  slide.addShape(pptx.ShapeType.ellipse, { x: MARGIN, y: 0.55, w: 0.4, h: 0.4, fill: { color: C.gold }, line: { color: C.ink, width: 1.5 } });
  slide.addText(String(page.num), { x: MARGIN, y: 0.55, w: 0.4, h: 0.4, fontFace: F_MONO, fontSize: 11, bold: true, color: C.goldInk, align: "center", valign: "middle" });
  slide.addText(page.kicker.toUpperCase(), { x: MARGIN + 0.55, y: 0.55, w: CONTENT_W - 0.55 - 1, h: 0.4, fontFace: F_MONO, fontSize: 10, color: ink, bold: true, valign: "middle", charSpacing: 1 });
  slide.addText(`${pageIndex} / ${content.totalPages}`, { x: PAGE_W - MARGIN - 1, y: 0.55, w: 1, h: 0.4, fontFace: F_MONO, fontSize: 9, color: ink3, align: "right", valign: "middle" });

  const titleLines = estimateLines(page.title, 42);
  slide.addText(plain(page.title).toUpperCase(), { x: MARGIN, y: 1.05, w: CONTENT_W, h: 0.5 * titleLines, fontFace: F_DISPLAY, fontSize: 22, color: ink });
  let y = 1.05 + 0.5 * titleLines + 0.1;

  if (page.lead) {
    const lines = estimateLines(page.lead, 95);
    slide.addText(richRuns(page.lead, { fontFace: F_TEXT, fontSize: 13, color: ink }), { x: MARGIN, y, w: CONTENT_W, h: 0.28 * lines + 0.1 });
    y += 0.28 * lines + 0.25;
  }

  for (const block of page.blocks) {
    y = renderBlock(slide, block, y, ink, ink3);
  }

  pageIndex++;
}

function renderBlock(slide, block, y, ink, ink3) {
  const gap = 0.22;
  switch (block.type) {
    case "p": {
      const lines = estimateLines(block.text, 100);
      const h = 0.24 * lines;
      slide.addText(richRuns(block.text, { fontFace: F_TEXT, fontSize: 12, color: ink }), { x: MARGIN, y, w: CONTENT_W, h });
      return y + h + gap;
    }
    case "h3": {
      slide.addText(block.text, { x: MARGIN, y, w: CONTENT_W, h: 0.35, fontFace: F_TEXT, fontSize: 15, bold: true, color: ink });
      return y + 0.35 + gap * 0.6;
    }
    case "quote": {
      const lines = estimateLines(block.text, 85);
      const h = 0.28 * lines;
      slide.addShape(pptx.ShapeType.rect, { x: MARGIN, y, w: 0.06, h, fill: { color: C.gold } });
      slide.addText(block.text, { x: MARGIN + 0.25, y, w: CONTENT_W - 0.25, h, fontFace: F_TEXT, italic: true, fontSize: 13, color: ink });
      return y + h + gap;
    }
    case "list": {
      const h = 0.32 * block.items.length;
      slide.addText(block.items.map((it) => ({ text: plain(it), options: { bullet: { code: "25A0" }, fontFace: F_TEXT, fontSize: 12, color: ink, breakLine: true, paraSpaceAfter: 6 } })), { x: MARGIN, y, w: CONTENT_W, h });
      return y + h + gap;
    }
    case "flow": {
      slide.addText(block.items.join("   →   ").toUpperCase(), { x: MARGIN, y, w: CONTENT_W, h: 0.5, fontFace: F_MONO, fontSize: 9.5, color: ink });
      return y + 0.5 + gap * 0.6;
    }
    case "table": {
      const rows = [
        [{ text: block.headers[0].toUpperCase(), options: { bold: true, fontFace: F_MONO, fontSize: 9, color: ink3, fill: { color: C.paper } } },
         { text: block.headers[1].toUpperCase(), options: { bold: true, fontFace: F_MONO, fontSize: 9, color: ink3, fill: { color: C.paper } } }],
        ...block.rows.map(([a, b]) => [
          { text: plain(a), options: { bold: true, fontFace: F_TEXT, fontSize: 10.5, color: ink } },
          { text: plain(b), options: { fontFace: F_TEXT, fontSize: 10.5, color: ink } },
        ]),
      ];
      const h = 0.3 + block.rows.length * 0.42;
      slide.addTable(rows, { x: MARGIN, y, w: CONTENT_W, colW: [CONTENT_W * 0.28, CONTENT_W * 0.72], border: { type: "solid", color: "DCDCD8", pt: 0.75 }, autoPage: false, valign: "top", h });
      return y + h + gap;
    }
    case "cards": {
      const cols = block.columns;
      const gapX = 0.15;
      const cw = (CONTENT_W - gapX * (cols - 1)) / cols;
      const ch = 1.5;
      block.items.forEach((it, i) => {
        const bg = CARD_BG[it.bg ?? "null"];
        const fg = it.color ? it.color.replace("var(--paper)", C.paper).replace("#fff", "FFFFFF") : CARD_INK[it.bg ?? "null"];
        const x = MARGIN + (i % cols) * (cw + gapX);
        const rowY = y + Math.floor(i / cols) * (ch + gapX);
        slide.addShape(pptx.ShapeType.roundRect, { x, y: rowY, w: cw, h: ch, rectRadius: 0.06, fill: { color: bg }, line: { color: C.ink, width: 1.5 } });
        slide.addText(it.title, { x: x + 0.15, y: rowY + 0.12, w: cw - 0.3, h: 0.35, fontFace: F_DISPLAY, fontSize: 15, color: fg });
        slide.addText(it.text, { x: x + 0.15, y: rowY + 0.5, w: cw - 0.3, h: ch - 0.6, fontFace: F_TEXT, fontSize: 9, color: fg });
      });
      const rowsCount = Math.ceil(block.items.length / cols);
      return y + rowsCount * (ch + gapX) + gap;
    }
    case "shot": {
      const barH = 0.34;
      slide.addShape(pptx.ShapeType.rect, { x: MARGIN, y, w: CONTENT_W, h: barH, fill: { color: C.paper2 }, line: { color: C.ink, width: 1.25 } });
      [0, 1, 2].forEach((i) => slide.addShape(pptx.ShapeType.ellipse, { x: MARGIN + 0.12 + i * 0.16, y: y + barH / 2 - 0.04, w: 0.08, h: 0.08, fill: { color: C.lineStrong } }));
      const url = `quinta-escena.cl${block.path === "/" ? "" : block.path}`;
      slide.addText(url, { x: MARGIN + 0.65, y, w: 3.5, h: barH, fontFace: F_MONO, fontSize: 9, color: C.ink3, valign: "middle" });
      if (block.mockupNote) {
        slide.addShape(pptx.ShapeType.roundRect, { x: MARGIN + CONTENT_W - 1.1, y: y + 0.04, w: 1.0, h: barH - 0.08, rectRadius: 0.08, fill: { color: C.gold }, line: { color: C.ink, width: 1 } });
        slide.addText("MOCKUP", { x: MARGIN + CONTENT_W - 1.1, y: y + 0.04, w: 1.0, h: barH - 0.08, fontFace: F_MONO, fontSize: 8, bold: true, color: C.goldInk, align: "center", valign: "middle" });
      }
      const imgH = 3.1;
      slide.addImage({ path: path.join(ROOT, "public", block.src), x: MARGIN, y: y + barH, w: CONTENT_W, h: imgH, sizing: { type: "crop", w: CONTENT_W, h: imgH } });
      slide.addShape(pptx.ShapeType.rect, { x: MARGIN, y, w: CONTENT_W, h: barH + imgH, fill: { color: "FFFFFF", transparency: 100 }, line: { color: C.ink, width: 1.5 } });
      let yy = y + barH + imgH + 0.1;
      if (block.caption) {
        slide.addText(block.caption.toUpperCase(), { x: MARGIN, y: yy, w: CONTENT_W, h: 0.3, fontFace: F_MONO, fontSize: 8, color: ink3 });
        yy += 0.3;
      }
      return yy + gap * 0.6;
    }
    case "placeholder": {
      const h = 1.5;
      slide.addShape(pptx.ShapeType.rect, { x: MARGIN, y, w: CONTENT_W, h, fill: { color: C.paper2 }, line: { color: C.lineStrong, width: 1.25, dashType: "dash" } });
      slide.addText("ESPACIO PARA FOTOGRAFÍA", { x: MARGIN + 0.3, y: y + 0.35, w: CONTENT_W - 0.6, h: 0.3, fontFace: F_MONO, fontSize: 9, bold: true, color: C.ink3 });
      slide.addText(block.text, { x: MARGIN + 0.3, y: y + 0.7, w: CONTENT_W - 0.6, h: 0.7, fontFace: F_TEXT, fontSize: 11, color: C.ink2 });
      return y + h + gap;
    }
    case "logos": {
      const n = block.items.length;
      const size = 1.1;
      const gapX = (CONTENT_W - n * size) / (n - 1 || 1);
      block.items.forEach((it, i) => {
        const x = MARGIN + i * (size + gapX);
        slide.addImage({ path: path.join(ROOT, "public", it.src), x, y, w: size, h: size });
        slide.addText(it.label, { x: x - 0.2, y: y + size + 0.05, w: size + 0.4, h: 0.4, fontFace: F_MONO, fontSize: 7.5, color: ink3, align: "center" });
      });
      return y + size + 0.5 + gap;
    }
    case "mockups": {
      const targetH = 2.9;
      const gapX = 0.25;
      const widths = block.items.map((it) => targetH / (it.src.includes("youtube") ? MOCKUP_RATIO.youtube : MOCKUP_RATIO.instagram));
      const totalW = widths.reduce((a, b) => a + b, 0) + gapX * (widths.length - 1);
      let x = MARGIN + Math.max(0, (CONTENT_W - totalW) / 2);
      const bannerH = 0.28;
      let maxH = 0;
      block.items.forEach((it, i) => {
        const cw = widths[i];
        slide.addShape(pptx.ShapeType.rect, { x, y, w: cw, h: bannerH, fill: { color: C.gold }, line: { color: C.ink, width: 1.25 } });
        slide.addText("CONCEPTO ILUSTRATIVO", { x, y, w: cw, h: bannerH, fontFace: F_MONO, fontSize: 6.5, bold: true, color: C.goldInk, align: "center", valign: "middle" });
        slide.addImage({ path: path.join(ROOT, "public", it.src), x, y: y + bannerH, w: cw, h: targetH });
        slide.addShape(pptx.ShapeType.rect, { x, y, w: cw, h: bannerH + targetH, fill: { color: "FFFFFF", transparency: 100 }, line: { color: C.ink, width: 1.5 } });
        slide.addText(it.label.toUpperCase(), { x, y: y + bannerH + targetH + 0.05, w: cw, h: 0.25, fontFace: F_MONO, fontSize: 7, color: ink3, align: "center" });
        maxH = Math.max(maxH, bannerH + targetH + 0.3);
        x += cw + gapX;
      });
      return y + maxH + gap;
    }
    case "people": {
      const cols = 5;
      const cellW = CONTENT_W / cols;
      const photoSize = 0.95;
      const nameH = 0.26, roleH = 0.42;
      const rowH = photoSize + nameH + roleH + 0.15;
      block.items.forEach((it, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cellX = MARGIN + col * cellW;
        const x = cellX + (cellW - photoSize) / 2;
        const rowY = y + row * rowH;
        const accent = CARD_BG[it.bg ?? "null"] === C.paper ? C.ink : CARD_BG[it.bg ?? "null"];
        slide.addShape(pptx.ShapeType.ellipse, { x: x + 0.05, y: rowY + 0.05, w: photoSize, h: photoSize, fill: { color: accent }, line: { type: "none" } });
        slide.addImage({ path: path.join(ROOT, "public", it.src), x, y: rowY, w: photoSize, h: photoSize, rounding: true });
        slide.addShape(pptx.ShapeType.ellipse, { x, y: rowY, w: photoSize, h: photoSize, fill: { type: "none" }, line: { color: C.ink, width: 1.5 } });
        slide.addText(it.name, { x: cellX, y: rowY + photoSize + 0.04, w: cellW, h: nameH, fontFace: F_TEXT, bold: true, fontSize: 8.5, color: ink, align: "center" });
        slide.addText(it.role.toUpperCase(), { x: cellX, y: rowY + photoSize + 0.04 + nameH, w: cellW, h: roleH, fontFace: F_MONO, fontSize: 6, color: ink3, align: "center" });
      });
      const rows = Math.ceil(block.items.length / cols);
      let yy = y + rows * rowH;
      if (block.caption) {
        slide.addText(block.caption.toUpperCase(), { x: MARGIN, y: yy, w: CONTENT_W, h: 0.3, fontFace: F_MONO, fontSize: 7, color: ink3 });
        yy += 0.3;
      }
      return yy + gap * 0.6;
    }
    case "twoColLists": {
      const colW = (CONTENT_W - 0.3) / 2;
      const maxItems = Math.max(block.left.items.length, block.right.items.length);
      const h = 0.35 + maxItems * 0.32;
      slide.addText(block.left.heading, { x: MARGIN, y, w: colW, h: 0.3, fontFace: F_TEXT, bold: true, fontSize: 13, color: ink });
      slide.addText(block.left.items.map((it) => ({ text: it, options: { bullet: { code: "25A0" }, breakLine: true, paraSpaceAfter: 4 } })), { x: MARGIN, y: y + 0.35, w: colW, h: h - 0.35, fontFace: F_TEXT, fontSize: 10.5, color: ink });
      slide.addText(block.right.heading, { x: MARGIN + colW + 0.3, y, w: colW, h: 0.3, fontFace: F_TEXT, bold: true, fontSize: 13, color: ink });
      slide.addText(block.right.items.map((it) => ({ text: it, options: { bullet: { code: "25A0" }, breakLine: true, paraSpaceAfter: 4 } })), { x: MARGIN + colW + 0.3, y: y + 0.35, w: colW, h: h - 0.35, fontFace: F_TEXT, fontSize: 10.5, color: ink });
      return y + h + gap;
    }
    default:
      return y;
  }
}

await pptx.writeFile({ fileName: OUT });
console.log("Generado:", OUT);
