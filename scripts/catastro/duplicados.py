#!/usr/bin/env python3
"""
Detecta y marca posibles duplicados (brief §12).

Uso:
  python3 scripts/catastro/duplicados.py                 # lista candidatos en todas las colecciones
  python3 scripts/catastro/duplicados.py companias       # solo una colección
  python3 scripts/catastro/duplicados.py --marcar COMP-0003 COMP-0017
      Marca COMP-0017 como DUPLICADO de COMP-0003 y fusiona en COMP-0003 sus fuentes, listas
      y campos vacíos (los valores distintos quedan en contradicciones). Reescribe las
      referencias de otras colecciones hacia el id conservado.

La detección usa dos criterios: misma clave de tokens (sin palabras genéricas como
"compañía", "teatro", "de") y similitud de texto >= 0.86. Nunca fusiona automáticamente.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lib  # noqa: E402
from agregar import merge_list, merge_scalar  # noqa: E402


def candidates(items, col):
    nf = lib.NAME_FIELD.get(col)
    if not nf:
        return []
    live = [r for r in items if r.get("estado") not in ("DUPLICADO", "DESCARTADO") and r.get(nf)]
    out = []
    for i, a in enumerate(live):
        for b in live[i + 1:]:
            ka, kb = lib.token_key(a[nf]), lib.token_key(b[nf])
            ratio = lib.similar_names(a[nf], b[nf])
            same_key = ka and ka == kb
            if same_key or ratio >= 0.86:
                same_commune = (a.get("comuna") == b.get("comuna")) or not a.get("comuna") or not b.get("comuna")
                out.append((a["id"], a[nf], b["id"], b[nf], round(ratio, 2), "clave" if same_key else "texto",
                            "misma comuna" if same_commune else f"comunas distintas: {a.get('comuna')} / {b.get('comuna')}"))
    return out


def mark(data, keep_id, dup_id):
    col = next((c for c in lib.COLLECTIONS if lib.is_id(keep_id, c)), None)
    if not col or not lib.is_id(dup_id, col):
        raise SystemExit("Ambos ids deben ser de la misma colección")
    keep = lib.find_by_id(data[col], keep_id)
    dup = lib.find_by_id(data[col], dup_id)
    if not keep or not dup:
        raise SystemExit("Id no encontrado")
    nf = lib.NAME_FIELD[col]
    if nf and dup.get(nf):
        merge_list(keep, "alias", [dup[nf]]) if "alias" in keep else None
    for field in lib.FIELDS[col]:
        if field in ("id", "estado", "fecha_descubrimiento", "duplicado_de", "contradicciones", nf):
            continue
        v = dup.get(field)
        if v in (None, "", []):
            continue
        if field in lib.LIST_FIELDS.get(col, set()) or field == "fuentes":
            merge_list(keep, field, v)
        elif field == "notas":
            keep["notas"] = ((keep.get("notas") or "") + " " + v).strip()
        else:
            merge_scalar(keep, field, v, dup.get("fuentes") or [])
    for c in dup.get("contradicciones") or []:
        keep.setdefault("contradicciones", []).append(c)
    dup["estado"] = "DUPLICADO"
    dup["duplicado_de"] = keep_id
    dup["fecha_ultima_verificacion"] = lib.today()
    # reescribir referencias
    for ocol in lib.COLLECTIONS:
        for field, target in lib.REFS[ocol].items():
            if target != col:
                continue
            for rec in data[ocol]:
                v = rec.get(field)
                if isinstance(v, list):
                    if dup_id in v:
                        rec[field] = [keep_id if x == dup_id else x for x in v]
                        seen, uniq = set(), []
                        for x in rec[field]:
                            if x not in seen:
                                uniq.append(x)
                                seen.add(x)
                        rec[field] = uniq
                elif v == dup_id:
                    rec[field] = keep_id
    print(f"{dup_id} marcado como DUPLICADO de {keep_id}")


def main(argv):
    data = lib.load_all()
    if "--marcar" in argv:
        i = argv.index("--marcar")
        mark(data, argv[i + 1], argv[i + 2])
        lib.save_all(data)
        return 0
    # financiamiento se omite por defecto: el mismo festival en distintos años es legítimamente distinto.
    cols = [a for a in argv if a in lib.COLLECTIONS] or [c for c in lib.COLLECTIONS if c != "financiamiento"]
    total = 0
    for col in cols:
        cs = candidates(data[col], col)
        if cs:
            print(f"## {col}: {len(cs)} candidatos")
            for c in cs:
                print("  ", " | ".join(str(x) for x in c))
        total += len(cs)
    print(f"{total} candidatos a duplicado. Revisar a mano y marcar con --marcar CONSERVAR DUPLICADO.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
