import { ImageResponse } from "next/og";
import { SITE_TAGLINE } from "@/lib/site";

export const alt = "QUINTA ESCENA · Artes escénicas de la Región de Valparaíso";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#ffffff", color: "#14141a", padding: 72, fontFamily: "Arial Black, Arial, sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 24, letterSpacing: 6, color: "#6b6b74", fontFamily: "monospace", fontWeight: 700 }}>ARTES ESCÉNICAS DE LA REGIÓN</div>
          <div style={{ display: "flex", fontSize: 108, lineHeight: 1, marginTop: 24, letterSpacing: -2, textTransform: "uppercase" }}>
            <span>QUINTA&nbsp;</span>
            <span style={{ background: "#ff4fa0", color: "#57062f", padding: "0 16px", borderRadius: 8 }}>ESCENA</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "6px solid #14141a", paddingTop: 28 }}>
          <div style={{ fontSize: 34, maxWidth: 760, fontFamily: "Georgia, serif" }}>{SITE_TAGLINE}</div>
          <div style={{ fontSize: 22, fontFamily: "monospace", fontWeight: 700, color: "#6b6b74" }}>38 comunas · 8 provincias</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
