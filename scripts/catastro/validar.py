#!/usr/bin/env python3
"""
Valida la integridad del catastro: ids únicos, referencias resolubles, comunas válidas,
estados y calidades del vocabulario, fechas ISO, todo registro con al menos una fuente.

Uso: python3 scripts/catastro/validar.py   (código de salida 1 si hay errores)
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lib  # noqa: E402

DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def main():
    data = lib.load_all()
    errors, warnings = [], []
    ids = {}
    for col in lib.PREFIXES:
        for rec in data[col]:
            rid = rec.get("id")
            if not lib.is_id(rid, col):
                errors.append(f"{col}: id inválido {rid!r}")
            if rid in ids:
                errors.append(f"id duplicado {rid} en {col} y {ids[rid]}")
            ids[rid] = col
    for col in lib.COLLECTIONS:
        for rec in data[col]:
            rid = rec.get("id")
            if rec.get("estado") not in lib.STATES:
                errors.append(f"{rid}: estado inválido {rec.get('estado')!r}")
            if not rec.get("fuentes") and rec.get("estado") not in ("DUPLICADO", "DESCARTADO"):
                warnings.append(f"{rid}: sin fuentes")
            for f in rec.get("fuentes") or []:
                if ids.get(f) != "fuentes":
                    errors.append(f"{rid}: fuente {f} no existe")
            for field, is_list in lib.COMMUNE_FIELDS.get(col, {}).items():
                vals = rec.get(field) or []
                for v in (vals if is_list else [vals] if vals else []):
                    if v not in lib.communes() or v.startswith("__"):
                        errors.append(f"{rid}: comuna inválida {v!r} en {field}")
            if "provincia" in rec and rec.get("comuna") and rec.get("provincia") != lib.province_of(rec["comuna"]):
                errors.append(f"{rid}: provincia {rec.get('provincia')!r} no corresponde a comuna {rec['comuna']}")
            for field, target in lib.REFS[col].items():
                vals = rec.get(field)
                for v in (vals if isinstance(vals, list) else [vals] if vals else []):
                    if ids.get(v) != target:
                        errors.append(f"{rid}: referencia {field}={v!r} no resuelve a {target}")
            for dfield in ("fecha", "fecha_fin", "fecha_descubrimiento", "fecha_ultima_verificacion"):
                v = rec.get(dfield)
                if v and not DATE_RE.match(str(v)):
                    errors.append(f"{rid}: fecha no ISO en {dfield}: {v!r}")
            if rec.get("estado") == "DUPLICADO" and not rec.get("duplicado_de"):
                errors.append(f"{rid}: DUPLICADO sin duplicado_de")
            nf = lib.NAME_FIELD.get(col)
            if nf and not rec.get(nf):
                errors.append(f"{rid}: sin {nf}")
            if col == "personas" and (rec.get("telefono") or rec.get("correo")):
                errors.append(f"{rid}: las personas no llevan teléfono ni correo (dato personal)")
    for s in data["fuentes"]:
        if s.get("calidad") not in lib.QUALITIES:
            errors.append(f"{s.get('id')}: calidad inválida {s.get('calidad')!r}")
        if not s.get("url") and not s.get("titulo"):
            errors.append(f"{s.get('id')}: fuente sin url ni título")
        if s.get("fecha_consulta") and not DATE_RE.match(str(s["fecha_consulta"])):
            errors.append(f"{s.get('id')}: fecha_consulta no ISO")
    for w in warnings:
        print("AVISO:", w)
    for e in errors:
        print("ERROR:", e)
    print(f"{len(errors)} errores, {len(warnings)} avisos")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
