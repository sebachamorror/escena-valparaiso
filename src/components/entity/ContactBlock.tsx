import Link from "next/link";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { t } from "@/content/es-CL";
import type { Social } from "@/lib/data/types";
import styles from "./entity.module.css";

interface Props { website: string | null; social: Social; email: string | null; authorized: boolean; territory: string; slug: string }

const SOCIAL_LABEL: Record<keyof Social, string> = { instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok", youtube: "YouTube" };

/** Contacto solo si es público y profesional o está autorizado por escrito. */
export function ContactBlock({ website, social, email, authorized, territory, slug }: Props) {
  const links: { label: string; href: string; kind: "web" | "social" }[] = [];
  if (website) links.push({ label: "Sitio web", href: website, kind: "web" });
  for (const k of Object.keys(SOCIAL_LABEL) as (keyof Social)[]) {
    const u = social?.[k];
    if (u) links.push({ label: SOCIAL_LABEL[k], href: u, kind: "social" });
  }
  const showEmail = email && authorized;
  return (
    <>
      {links.length || showEmail ? (
        <ul className={styles.asideList}>
          {links.map((l) => (
            <li key={l.href}><ExternalLink href={l.href} kind={l.kind} territory={territory}>{l.label}</ExternalLink></li>
          ))}
          {showEmail && <li><a href={`mailto:${email}`}>{email}</a></li>}
        </ul>
      ) : (
        <p className="small muted">{t.contact.none}</p>
      )}
      <p className="small">
        <Link href={`/participa?ficha=${encodeURIComponent(slug)}`}>{t.contact.correct}</Link>
      </p>
    </>
  );
}
