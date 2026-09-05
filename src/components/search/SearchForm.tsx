import { t } from "@/content/es-CL";
import styles from "./search.module.css";

/** Formulario GET a /buscar; funciona sin JavaScript. */
export function SearchForm({ big = false, defaultValue = "" }: { big?: boolean; defaultValue?: string }) {
  return (
    <form action="/buscar" method="get" role="search" className={`${styles.form} ${big ? styles.big : ""}`}>
      <label htmlFor="q" className="sr-only">{t.searchLabel}</label>
      <input id="q" name="q" type="search" className={styles.input} placeholder={t.searchPlaceholder} defaultValue={defaultValue} autoComplete="off" />
      <button type="submit" className="btn btn-primary">{t.search}</button>
    </form>
  );
}
