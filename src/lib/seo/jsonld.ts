import { absoluteUrl, SITE_NAME } from "@/lib/site";
import type { Artist, Company, Work } from "@/lib/data/types";
import { communeName } from "@/lib/data/territories";
import { craftName, disciplineName } from "@/lib/data/vocab";
import { plainText } from "@/lib/markdown";

type JsonLd = Record<string, unknown>;

function sameAs(social: { instagram?: string | null; facebook?: string | null; tiktok?: string | null; youtube?: string | null }, website?: string | null): string[] {
  return [website, social.instagram, social.facebook, social.tiktok, social.youtube].filter((u): u is string => !!u);
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    inLanguage: "es-CL",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("/buscar")}?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.href),
    })),
  };
}

export function companyJsonLd(c: Company): JsonLd {
  const out: JsonLd = {
    "@context": "https://schema.org",
    "@type": "PerformingGroup",
    name: c.name,
    url: absoluteUrl(`/companias/${c.slug}`),
    description: plainText(c.description_md, 300) || undefined,
    location: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: communeName(c.commune), addressRegion: "Región de Valparaíso", addressCountry: "CL" } },
    genre: c.disciplines.map(disciplineName),
  };
  if (c.founded_year) out.foundingDate = String(c.founded_year);
  const links = sameAs(c.social, c.website);
  if (links.length) out.sameAs = links;
  return out;
}

export function artistJsonLd(a: Artist): JsonLd {
  const out: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: a.name,
    url: absoluteUrl(`/artistas/${a.slug}`),
    description: plainText(a.bio_md, 300) || undefined,
    jobTitle: a.crafts.map(craftName).join(", "),
    homeLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: communeName(a.commune), addressRegion: "Región de Valparaíso", addressCountry: "CL" } },
  };
  if (a.artistic_name) out.alternateName = a.artistic_name;
  const links = sameAs(a.social, a.website);
  if (links.length) out.sameAs = links;
  return out;
}

export function workJsonLd(w: Work): JsonLd {
  const out: JsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: w.title,
    url: absoluteUrl(`/obras/${w.slug}`),
    description: plainText(w.synopsis_md, 300) || undefined,
    genre: w.disciplines.map(disciplineName),
    inLanguage: "es",
  };
  if (w.authorship) out.author = { "@type": "Person", name: w.authorship };
  if (w.direction) out.director = { "@type": "Person", name: w.direction };
  return out;
}
