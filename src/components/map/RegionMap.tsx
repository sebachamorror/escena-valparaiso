import { geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import { loadRegionGeo, type CommuneFeature, type RegionGeo } from "@/lib/geo/load";
import { communeUrl, provinceShortName, getProvince } from "@/lib/data/territories";
import type { TerritoryCounts } from "@/lib/queries/entities";
import styles from "./map.module.css";

interface Props {
  /** Conteos por slug de comuna (capa "quiénes lo hacen"). */
  counts: Record<string, TerritoryCounts>;
  /** Provincia enfocada: se acerca a ella y atenúa el resto. */
  focusProvince?: string;
  /** Comuna resaltada. */
  currentCommune?: string;
  /** Muestra etiquetas de provincia. */
  labels?: boolean;
  width?: number;
  height?: number;
}

const DIFROL = "Autorizada su circulación por Resolución Nº 87 del 2023 de la Dirección Nacional de Fronteras y Límites del Estado.";

function bucket(n: number): string {
  if (n >= 4) return styles.c3;
  if (n >= 2) return styles.c2;
  if (n >= 1) return styles.c1;
  return "";
}

function countText(c: TerritoryCounts | undefined): string {
  if (!c || !c.total) return "sin registros todavía";
  const parts: string[] = [];
  if (c.companies) parts.push(`${c.companies} ${c.companies === 1 ? "compañía" : "compañías"}`);
  if (c.artists) parts.push(`${c.artists} ${c.artists === 1 ? "artista" : "artistas"}`);
  if (c.works) parts.push(`${c.works} ${c.works === 1 ? "obra" : "obras"}`);
  if (c.episodes) parts.push(`${c.episodes} ${c.episodes === 1 ? "episodio" : "episodios"}`);
  return parts.join(", ");
}

interface InsetSpec { fc: FeatureCollection<Geometry>; label: string; x: number; y: number; slug: string }

/**
 * Mapa regional en SVG, renderizado en el servidor con la geometría oficial (DPA 2023).
 * Cada comuna es un enlace enfocable con nombre accesible y conteo. Isla de Pascua y
 * Juan Fernández van en recuadros con escala propia en la vista regional; como provincia
 * o comuna insular enfocada, la isla pasa a ser el contenido principal del mapa.
 * Sin JavaScript para el primer pintado.
 */
export function RegionMap({ counts, focusProvince, currentCommune, labels = true, width = 640, height = 700 }: Props) {
  const geo = loadRegionGeo();
  if (!geo) return null;

  const pad = 18;
  const islandLayers: { fc: RegionGeo["islaDePascua"]; label: string; slug: string }[] = [
    { fc: geo.juanFernandez, label: "Juan Fernández", slug: "juan-fernandez" },
    { fc: geo.islaDePascua, label: "Isla de Pascua · Rapa Nui", slug: "isla-de-pascua" },
  ];

  // Comunas continentales de la provincia enfocada (vacío si la provincia es insular, como Isla de Pascua).
  const mainlandFocus = focusProvince ? geo.communes.features.filter((f) => f.properties.province_slug === focusProvince) : geo.communes.features;
  // Islas que pertenecen a la provincia enfocada (Juan Fernández en la Provincia de Valparaíso).
  const focusIslands = focusProvince ? islandLayers.filter((l) => l.fc.features[0]?.properties.province_slug === focusProvince) : [];
  // Cuando la provincia enfocada no tiene comunas continentales (Isla de Pascua), la isla es el contenido principal.
  const islandIsMain = !!focusProvince && mainlandFocus.length === 0;
  const mainFeatures = islandIsMain ? focusIslands.flatMap((l) => l.fc.features) : mainlandFocus;

  const baseFc: FeatureCollection<Geometry> = { type: "FeatureCollection", features: mainFeatures };
  const hasBase = mainFeatures.length > 0;
  const leftPad = focusProvince ? pad : pad + 150;
  const bottomPad = focusProvince ? pad : pad + 40;
  const projection = hasBase ? geoMercator().fitExtent([[leftPad, pad], [width - pad, height - bottomPad]], baseFc) : null;
  const path = projection ? geoPath(projection) : null;

  // Recuadros insulares: en la vista regional, siempre ambas islas; en una provincia enfocada
  // con comunas continentales, solo las islas que pertenecen a esa provincia (Juan Fernández en Valparaíso).
  const insetW = 130;
  const insetH = 96;
  const insetList = !focusProvince ? islandLayers : islandIsMain ? [] : focusIslands;
  const insets: InsetSpec[] = insetList.map((l, i) => ({ ...l, x: pad, y: height - pad - insetH * (insetList.length - i) - i * 12 }));

  const renderCommune = (f: CommuneFeature, d: string | null, dim: boolean) => {
    if (!d) return null;
    const c = counts[f.properties.slug];
    const isCurrent = currentCommune === f.properties.slug;
    const label = `${f.properties.name}: ${countText(c)}`;
    return (
      <a key={f.properties.slug} href={communeUrl(f.properties.slug)} className={`${styles.link} ${dim ? styles.dim : ""}`} aria-label={label}>
        <path d={d} className={`${styles.commune} ${bucket(c?.total ?? 0)} ${isCurrent ? styles.current : ""}`}>
          <title>{label}</title>
        </path>
      </a>
    );
  };

  if (!hasBase || !path) return null;

  return (
    <figure className={styles.figure}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label={focusProvince ? `Mapa de la ${getProvince(focusProvince)?.name ?? "provincia"}` : "Mapa de la Región de Valparaíso por comunas"}
      >
        <rect x="0" y="0" width={width} height={height} className={styles.sea} />
        <g>
          {mainFeatures.map((f) => renderCommune(f, path(f), !!focusProvince && !islandIsMain && f.properties.province_slug !== focusProvince))}
        </g>
        {!islandIsMain && (
          <>
            <path d={path(geo.provinceMesh) ?? undefined} className={styles.provinceMesh} />
            <path d={path(geo.outline) ?? undefined} className={styles.outline} />
          </>
        )}
        {labels && !focusProvince && geo.provinces.features.map((p) => {
          const [x, y] = path.centroid(p);
          if (!Number.isFinite(x)) return null;
          const prov = getProvince(p.properties.slug);
          return (
            <text key={p.properties.slug} x={x} y={y} textAnchor="middle" className={styles.label}>
              {prov ? provinceShortName(prov) : p.properties.name}
            </text>
          );
        })}
        {labels && focusProvince && mainFeatures.map((f) => {
          const [x, y] = path.centroid(f);
          if (!Number.isFinite(x)) return null;
          return <text key={f.properties.slug} x={x} y={y + 12} textAnchor="middle" className={`${styles.label} ${styles.labelSmall}`}>{f.properties.name}</text>;
        })}
        {insets.map((ins) => {
          const p = geoMercator().fitExtent([[ins.x + 10, ins.y + 18], [ins.x + insetW - 10, ins.y + insetH - 8]], ins.fc);
          const ipath = geoPath(p);
          return (
            <g key={ins.slug}>
              <rect x={ins.x} y={ins.y} width={insetW} height={insetH} className={styles.inset} />
              <text x={ins.x + 6} y={ins.y + 11} className={styles.insetLabel}>{ins.label}</text>
              {ins.fc.features.map((f) => renderCommune(f as CommuneFeature, ipath(f), false))}
            </g>
          );
        })}
      </svg>
      <figcaption className={styles.caption}>
        <div className={styles.legend} aria-label="Leyenda">
          <span><i style={{ background: "var(--paper-2)" }} /> sin registros</span>
          <span><i style={{ background: "var(--gold)" }} /> 1</span>
          <span><i style={{ background: "var(--sky)" }} /> 2 a 3</span>
          <span><i style={{ background: "var(--pink)" }} /> 4 o más</span>
          {currentCommune && <span><i style={{ background: "var(--violet)" }} /> esta comuna</span>}
        </div>
        <span>Geometría: División Política Administrativa 2023, SUBDERE e IDE Chile, SIRGAS Chile 1:50.000, simplificada. Las islas Desventuradas (comuna de Valparaíso) no se dibujan. {DIFROL}</span>
      </figcaption>
    </figure>
  );
}
