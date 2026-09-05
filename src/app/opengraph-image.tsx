import { ImageResponse } from "next/og";
import { SITE_TAGLINE } from "@/lib/site";

export const alt = "ESCENA VALPARAÍSO · Artes escénicas de la Región de Valparaíso";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f5f2ea", color: "#16181b", padding: 72, fontFamily: "Georgia, serif" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 24, letterSpacing: 6, color: "#6d727a", fontFamily: "monospace" }}>ARTES ESCÉNICAS DE LA REGIÓN</div>
          <div style={{ display: "flex", fontSize: 108, lineHeight: 1, marginTop: 24, letterSpacing: -2 }}>
            <span>ESCENA&nbsp;</span><span style={{ color: "#0f5b6e" }}>VALPARAÍSO</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "3px solid #16181b", paddingTop: 28 }}>
          <div style={{ fontSize: 34, maxWidth: 760 }}>{SITE_TAGLINE}</div>
          <div style={{ fontSize: 22, fontFamily: "monospace", color: "#6d727a" }}>38 comunas · 8 provincias</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
