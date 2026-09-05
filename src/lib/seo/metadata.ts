import type { Metadata } from "next";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

interface PageMeta {
  title: string;
  description: string;
  path: string;
  /** false → noindex (fichas pendientes, territorios vacíos). */
  index?: boolean;
}

/** Metadata base para cualquier página: título, descripción, canonical, OG, robots. */
export function pageMetadata({ title, description, path, index = true }: PageMeta): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} · ${SITE_NAME}`, description, url, siteName: SITE_NAME, locale: "es_CL", type: "website" },
    twitter: { card: "summary_large_image", title: `${title} · ${SITE_NAME}`, description },
    robots: index ? { index: true, follow: true } : { index: false, follow: true },
  };
}
