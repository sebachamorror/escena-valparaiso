import styles from "@/app/home.module.css";

/**
 * Motivo estructural de la portada: un corte transversal de la región, de la cordillera
 * (izquierda, arriba) al mar (derecha, abajo). No es un mapa ni una ilustración:
 * es la estructura del territorio que ordena la navegación de la serie y del sitio.
 */
export function HeroMotif() {
  return (
    <figure style={{ margin: 0 }}>
      <svg className={styles.motif} viewBox="0 0 600 260" role="img" aria-labelledby="motif-title" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <title id="motif-title">Corte transversal de la Región de Valparaíso: cordillera, valles, puerto y mar.</title>
        {/* Cordillera */}
        <path d="M0 96 L28 58 L52 84 L80 30 L108 70 L132 46 L160 92" stroke="currentColor" strokeWidth="2.2" />
        <path d="M0 122 L34 92 L66 112 L96 76 L128 104 L164 118" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
        {/* Valles */}
        <path d="M160 92 C 200 118, 230 136, 268 132 S 330 150, 372 158" stroke="currentColor" strokeWidth="2.2" />
        <path d="M164 118 C 210 140, 250 154, 300 156 S 356 172, 380 176" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
        {/* Puerto: cerros cortos y cortados */}
        <path d="M372 158 L392 146 L404 162 L424 150 L438 170 L458 160 L470 178" stroke="currentColor" strokeWidth="2.2" />
        {/* Mar */}
        <g className={styles.sea} stroke="currentColor">
          <path d="M470 178 L600 178" strokeWidth="2.6" />
          <path d="M486 198 L600 198" strokeWidth="1.6" opacity="0.7" />
          <path d="M502 218 L600 218" strokeWidth="1.2" opacity="0.5" />
          <path d="M518 238 L600 238" strokeWidth="1" opacity="0.35" />
        </g>
        {/* Nodos: las provincias del recorrido, sin posición geográfica */}
        <g fill="currentColor">
          <circle cx="80" cy="30" r="4" />
          <circle cx="268" cy="132" r="4" />
          <circle cx="424" cy="150" r="4" />
          <circle className={styles.sea} cx="600" cy="178" r="4" />
        </g>
      </svg>
      <figcaption className={styles.figcap}><span>Cordillera</span><span>Valles</span><span>Puerto</span><span>Mar</span></figcaption>
    </figure>
  );
}
