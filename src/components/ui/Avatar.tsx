import { initials } from "@/lib/format";
import styles from "./ui.module.css";

/** Retrato o, cuando no hay imagen con licencia, un espacio digno con iniciales. */
export function Avatar({ name, size = 56, square = false }: { name: string; size?: number; square?: boolean }) {
  return (
    <span
      className={`${styles.avatar} ${square ? styles.avatarSquare : ""}`}
      style={{ "--size": `${size}px` } as React.CSSProperties}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
