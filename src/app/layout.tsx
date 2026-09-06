import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { Anton, Space_Grotesk, Space_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Masthead } from "@/components/layout/Masthead";
import { Footer } from "@/components/layout/Footer";
import { t } from "@/content/es-CL";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";

const fontDisplay = Anton({ subsets: ["latin"], weight: "400", variable: "--font-display", display: "swap" });
const fontText = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-text", display: "swap" });
const fontMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${SITE_NAME} · Artes escénicas de la Región de Valparaíso`, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: { siteName: SITE_NAME, locale: "es_CL", type: "website" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#f5f2ea", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  return (
    <html lang="es-CL" className={`${fontDisplay.variable} ${fontText.variable} ${fontMono.variable}`}>
      <body>
        <a href="#contenido" className="skip">{t.skip}</a>
        <Masthead />
        <main id="contenido">{children}</main>
        <Footer />
        {plausible && <Script defer data-domain={plausible} src="https://plausible.io/js/script.js" strategy="afterInteractive" />}
      </body>
    </html>
  );
}
