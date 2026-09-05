"use client";

import type { ReactNode } from "react";
import { track } from "@/lib/analytics/track";
import styles from "./ui.module.css";

interface Props { href: string; children: ReactNode; kind?: "web" | "social" | "call" | "booking"; territory?: string; className?: string }

/** Enlace externo con evento de analítica (external_click / social_click / call_click). */
export function ExternalLink({ href, children, kind = "web", territory, className }: Props) {
  const event = kind === "social" ? "social_click" : kind === "call" ? "call_click" : "external_click";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.ext} ${className ?? ""}`}
      onClick={() => track(event, { href, territory })}
    >
      {children}
    </a>
  );
}
