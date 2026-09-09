#!/usr/bin/env python3
"""
Exporta el catastro a CSV (catastro/datos/csv/*.csv) y GeoJSON (catastro/datos/geo/catastro.geojson).

Uso: python3 scripts/catastro/exportar.py

CSV: una fila por registro; listas unidas con " | "; null -> "NO ENCONTRADO"; las referencias
se exportan como id y, en una columna paralela `<campo>_nombre`, como nombre legible.
GeoJSON: compañías, espacios, festivales y funciones con coordenadas del espacio (si existen) o
el punto interior de la comuna (precision = commune_centroid). Nunca se inventan coordenadas.
"""
import csv
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lib  # noqa: E402

CSV_DIR = lib.DATOS / "csv"
GEO_DIR = lib.DATOS / "geo"


def name_of(data, col, rid):
    rec = lib.find_by_id(data[col], rid) if rid else None
    if not rec:
        return lib.NOT_FOUND
    return rec.get(lib.NAME_FIELD.get(col) or "id") or rec.get("id")


def export_csv(data):
    CSV_DIR.mkdir(parents=True, exist_ok=True)
    for col, fields in lib.FIELDS.items():
        refs = lib.REFS.get(col, {})
        header = []
        for f in fields:
            header.append(f)
            if f in refs:
                header.append(f + "_nombre")
            if f == "comuna":
                header.append("comuna_nombre")
        with (CSV_DIR / f"{col}.csv").open("w", newline="", encoding="utf-8") as fh:
            w = csv.writer(fh)
            w.writerow(header)
            for rec in data[col]:
                row = []
                for f in fields:
                    v = rec.get(f)
                    if f == "contradicciones":
                        v = "; ".join(f"{c['campo']}: '{c['valor_existente']}' vs '{c['valor_nuevo']}'" for c in (v or [])) or None
                    row.append(lib.csv_value(v))
                    if f in refs:
                        target = refs[f]
                        if isinstance(v, list):
                            row.append(lib.csv_value([name_of(data, target, x) for x in v]))
                        else:
                            row.append(name_of(data, target, v) if v else lib.NOT_FOUND)
                    if f == "comuna":
                        row.append(lib.commune_name(v) if v else lib.NOT_FOUND)
                w.writerow(row)
    # funciones legibles adicionales
    print(f"CSV exportados en {CSV_DIR.relative_to(lib.ROOT)} ({len(lib.FIELDS)} archivos)")


def point_for(data, rec, col):
    """(lng, lat, precision, base) o None."""
    if col == "espacios" and rec.get("lat") is not None and rec.get("lng") is not None:
        return rec["lng"], rec["lat"], "exact", "espacio"
    if col == "funciones" and rec.get("espacio"):
        esp = lib.find_by_id(data["espacios"], rec["espacio"])
        if esp and esp.get("lat") is not None and esp.get("lng") is not None:
            return esp["lng"], esp["lat"], "exact", "espacio"
    slug = rec.get("comuna")
    c = lib.communes().get(slug) if slug else None
    if c and c.get("lat") is not None:
        return c["lng"], c["lat"], "commune_centroid", "comuna"
    return None


def export_geojson(data):
    GEO_DIR.mkdir(parents=True, exist_ok=True)
    feats = []
    for col in ("companias", "espacios", "festivales", "funciones"):
        for rec in data[col]:
            if rec.get("estado") in ("DUPLICADO", "DESCARTADO"):
                continue
            pt = point_for(data, rec, col)
            if not pt:
                continue
            lng, lat, precision, base = pt
            props = {
                "id": rec["id"], "coleccion": col,
                "nombre": rec.get("nombre") or name_of(data, "obras", rec.get("obra")),
                "comuna": rec.get("comuna"), "comuna_nombre": lib.commune_name(rec.get("comuna")),
                "provincia": lib.province_of(rec.get("comuna")),
                "estado": rec.get("estado"), "geo_precision": precision, "geo_base": base,
            }
            if col == "companias":
                props["tipo"] = rec.get("tipo")
                props["disciplinas"] = rec.get("disciplinas")
            if col == "espacios":
                props["tipo_espacio"] = rec.get("tipo_espacio")
                props["administracion"] = rec.get("administracion")
            if col == "funciones":
                props["fecha"] = rec.get("fecha")
                props["compania"] = name_of(data, "companias", rec.get("compania"))
                props["espacio"] = name_of(data, "espacios", rec.get("espacio"))
            feats.append({"type": "Feature", "geometry": {"type": "Point", "coordinates": [lng, lat]},
                          "properties": props})
    fc = {"type": "FeatureCollection", "features": feats,
          "meta": {"generado": lib.today(),
                   "nota": "Puntos con geo_precision=commune_centroid usan el punto interior comunal de "
                           "data/territories/comunas.json; no son ubicaciones exactas."}}
    (GEO_DIR / "catastro.geojson").write_text(json.dumps(fc, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"GeoJSON: {len(feats)} puntos en {GEO_DIR.relative_to(lib.ROOT)}/catastro.geojson")


def main():
    data = lib.load_all()
    export_csv(data)
    export_geojson(data)
    return 0


if __name__ == "__main__":
    sys.exit(main())
