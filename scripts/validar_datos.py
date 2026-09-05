#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Valida los datos de ESCENA VALPARAÍSO contra sus esquemas y reglas editoriales.

Sin dependencias externas (Python 3.8+). Implementa el subconjunto de JSON Schema
draft-07 que usan los esquemas de data/schemas: type, required, properties, items,
enum, const, pattern, minimum, maximum, minLength, minItems, anyOf, $ref (local y a
_definitions.schema.json).

Reglas adicionales:
  - slugs únicos por colección y coherentes con el nombre de archivo;
  - comunas y provincias referidas existen en data/territories/comunas.json;
  - referencias cruzadas (companies, artists, works, episodes) resuelven;
  - vocabularios (disciplinas, oficios, públicos) existen en vocabularios.json;
  - published => verification.status == 'verificado' y confidence_score >= 70;
  - status verificado => verified_at presente;
  - toda fuente con accessed_at; ninguna cadena con patrón de RUT.

Uso:  python3 scripts/validar_datos.py [--strict]
Salida: resumen por colección y lista de errores; código de salida 1 si hay errores.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
SCHEMAS = os.path.join(DATA, "schemas")

RUT_RE = re.compile(r"\b\d{1,2}\.\d{3}\.\d{3}-[\dkK]\b")

COLLECTIONS = {
    "companies": "company.schema.json",
    "artists": "artist.schema.json",
    "works": "work.schema.json",
    "venues": "venue.schema.json",
    "events": "event.schema.json",
    "calls": "call.schema.json",
    "archive": "archive_item.schema.json",
}


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


class Validator:
    def __init__(self, schemas_dir):
        self.schemas = {}
        for name in os.listdir(schemas_dir):
            if name.endswith(".schema.json"):
                self.schemas[name] = load(os.path.join(schemas_dir, name))
        self.errors = []

    def resolve(self, ref, current):
        if "#" in ref:
            file_part, frag = ref.split("#", 1)
        else:
            file_part, frag = ref, ""
        doc = current if not file_part else self.schemas[file_part]
        node = doc
        for seg in [s for s in frag.split("/") if s]:
            node = node[seg]
        return node, doc

    def check(self, inst, schema, doc, path, out):
        if "$ref" in schema:
            target, tdoc = self.resolve(schema["$ref"], doc)
            return self.check(inst, target, tdoc, path, out)
        if "anyOf" in schema:
            for opt in schema["anyOf"]:
                sub = []
                self.check(inst, opt, doc, path, sub)
                if not sub:
                    return
            out.append("%s: no cumple ninguna alternativa (anyOf)" % path)
            return
        if "const" in schema and inst != schema["const"]:
            out.append("%s: debe ser %r" % (path, schema["const"]))
        t = schema.get("type")
        if t:
            types = t if isinstance(t, list) else [t]
            ok = False
            for tt in types:
                if tt == "null" and inst is None: ok = True
                elif tt == "string" and isinstance(inst, str): ok = True
                elif tt == "integer" and isinstance(inst, int) and not isinstance(inst, bool): ok = True
                elif tt == "number" and isinstance(inst, (int, float)) and not isinstance(inst, bool): ok = True
                elif tt == "boolean" and isinstance(inst, bool): ok = True
                elif tt == "array" and isinstance(inst, list): ok = True
                elif tt == "object" and isinstance(inst, dict): ok = True
            if not ok:
                out.append("%s: tipo esperado %s, recibido %s" % (path, types, type(inst).__name__))
                return
        if "enum" in schema and inst not in schema["enum"]:
            out.append("%s: valor %r fuera de enum" % (path, inst))
        if isinstance(inst, str):
            if "pattern" in schema and not re.search(schema["pattern"], inst):
                out.append("%s: %r no cumple patrón %s" % (path, inst, schema["pattern"]))
            if "minLength" in schema and len(inst) < schema["minLength"]:
                out.append("%s: cadena demasiado corta" % path)
        if isinstance(inst, (int, float)) and not isinstance(inst, bool):
            if "minimum" in schema and inst < schema["minimum"]:
                out.append("%s: %r < mínimo %r" % (path, inst, schema["minimum"]))
            if "maximum" in schema and inst > schema["maximum"]:
                out.append("%s: %r > máximo %r" % (path, inst, schema["maximum"]))
        if isinstance(inst, list):
            if "minItems" in schema and len(inst) < schema["minItems"]:
                out.append("%s: requiere al menos %d elementos" % (path, schema["minItems"]))
            if "items" in schema:
                for i, el in enumerate(inst):
                    self.check(el, schema["items"], doc, "%s[%d]" % (path, i), out)
        if isinstance(inst, dict):
            for req in schema.get("required", []):
                if req not in inst:
                    out.append("%s: falta campo requerido '%s'" % (path, req))
            for key, sub in schema.get("properties", {}).items():
                if key in inst:
                    self.check(inst[key], sub, doc, "%s.%s" % (path, key), out)

    def validate(self, inst, schema_name, label):
        out = []
        schema = self.schemas[schema_name]
        self.check(inst, schema, schema, label, out)
        return out


def walk_strings(obj):
    if isinstance(obj, str):
        yield obj
    elif isinstance(obj, list):
        for x in obj:
            for s in walk_strings(x):
                yield s
    elif isinstance(obj, dict):
        for v in obj.values():
            for s in walk_strings(v):
                yield s


def main():
    strict = "--strict" in sys.argv
    v = Validator(SCHEMAS)
    errors = []
    warnings = []

    # territorios
    terr_path = os.path.join(DATA, "territories", "comunas.json")
    terr = load(terr_path)
    errors += v.validate(terr, "territory.schema.json", "territories/comunas.json")
    communes = {c["slug"]: c for c in terr["communes"]}
    provinces = {p["slug"]: p for p in terr["provinces"]}
    for c in terr["communes"]:
        if c["province"] not in provinces:
            errors.append("territories: comuna %s apunta a provincia inexistente %s" % (c["slug"], c["province"]))
    print("territorios: %d provincias, %d comunas" % (len(provinces), len(communes)))

    vocab = load(os.path.join(SCHEMAS, "vocabularios.json"))
    disciplines = {d["slug"] for d in vocab["disciplines"]}
    crafts = {d["slug"] for d in vocab["crafts"]}
    audiences = {d["slug"] for d in vocab["audiences"]}

    records = {}  # (collection, slug) -> record
    for coll, schema_name in COLLECTIONS.items():
        folder = os.path.join(DATA, coll)
        if not os.path.isdir(folder):
            continue
        files = sorted(f for f in os.listdir(folder) if f.endswith(".json"))
        for fn in files:
            path = os.path.join(folder, fn)
            try:
                rec = load(path)
            except Exception as e:  # noqa
                errors.append("%s/%s: JSON inválido (%s)" % (coll, fn, e))
                continue
            label = "%s/%s" % (coll, fn)
            errors += v.validate(rec, schema_name, label)
            slug = rec.get("slug")
            if slug and slug + ".json" != fn:
                errors.append("%s: slug '%s' no coincide con el nombre de archivo" % (label, slug))
            if (coll, slug) in records:
                errors.append("%s: slug duplicado" % label)
            records[(coll, slug)] = rec
            # reglas editoriales
            ver = rec.get("verification", {})
            if rec.get("published"):
                if ver.get("status") != "verificado" or ver.get("confidence_score", 0) < 70:
                    errors.append("%s: published=true exige status verificado y score >= 70" % label)
            if ver.get("status") == "verificado" and not ver.get("verified_at"):
                errors.append("%s: verificado sin verified_at" % label)
            for i, s in enumerate(rec.get("sources", [])):
                if not s.get("accessed_at"):
                    errors.append("%s: sources[%d] sin accessed_at" % (label, i))
                if not s.get("url") and s.get("type") != "documento-proyecto":
                    warnings.append("%s: sources[%d] sin URL" % (label, i))
            for s in walk_strings(rec):
                if RUT_RE.search(s):
                    errors.append("%s: contiene un patrón de RUT; eliminar" % label)
                    break
            # territorio
            for key in ("commune",):
                val = rec.get(key)
                if val and val not in communes:
                    errors.append("%s: comuna desconocida '%s'" % (label, val))
            for key in ("other_communes", "communes"):
                for val in rec.get(key, []) or []:
                    if val not in communes:
                        errors.append("%s: comuna desconocida '%s' en %s" % (label, val, key))
            pl = rec.get("place")
            if isinstance(pl, dict) and pl.get("commune") not in communes:
                errors.append("%s: place.commune desconocida" % label)
            # vocabularios
            for d in rec.get("disciplines", []) or []:
                if d not in disciplines:
                    errors.append("%s: disciplina desconocida '%s'" % (label, d))
            for d in rec.get("crafts", []) or []:
                if d not in crafts:
                    errors.append("%s: oficio desconocido '%s'" % (label, d))
            for d in rec.get("audiences", []) or []:
                if d not in audiences:
                    errors.append("%s: público desconocido '%s'" % (label, d))
            if rec.get("audience") and rec["audience"] not in audiences:
                errors.append("%s: público desconocido '%s'" % (label, rec["audience"]))
        print("%s: %d archivos" % (coll, len(files)))

    # referencias cruzadas
    def exists(coll, slug):
        return (coll, slug) in records

    for (coll, slug), rec in records.items():
        label = "%s/%s.json" % (coll, slug)
        for m in rec.get("members", []) or []:
            if not exists("artists", m["artist"]):
                errors.append("%s: members → artista inexistente '%s'" % (label, m["artist"]))
        for c in rec.get("companies", []) or []:
            cs = c["company"] if isinstance(c, dict) else c
            if not exists("companies", cs):
                errors.append("%s: companies → compañía inexistente '%s'" % (label, cs))
        for w in rec.get("works", []) or []:
            ws = w["work"] if isinstance(w, dict) else w
            if not exists("works", ws):
                errors.append("%s: works → obra inexistente '%s'" % (label, ws))
        for cr in rec.get("credits", []) or []:
            if cr.get("artist") and not exists("artists", cr["artist"]):
                errors.append("%s: credits → artista inexistente '%s'" % (label, cr["artist"]))
        for vslug in rec.get("venues", []) or []:
            if not exists("venues", vslug):
                errors.append("%s: venues → espacio inexistente '%s'" % (label, vslug))

    # serie y episodios
    dcc = os.path.join(DATA, "de-cuento-en-cuento")
    if os.path.isdir(dcc):
        episodes = load(os.path.join(dcc, "episodios.json"))
        ep_slugs = set()
        for i, ep in enumerate(episodes):
            label = "de-cuento-en-cuento/episodios.json[%d]" % i
            errors += v.validate(ep, "episode.schema.json", label)
            ep_slugs.add(ep.get("slug"))
            if ep.get("commune") not in communes:
                errors.append("%s: comuna desconocida" % label)
            if ep.get("province") not in provinces:
                errors.append("%s: provincia desconocida" % label)
            if ep.get("commune") in communes and communes[ep["commune"]]["province"] != ep.get("province"):
                errors.append("%s: la comuna %s no pertenece a la provincia %s" % (label, ep["commune"], ep["province"]))
            if ep.get("protagonist_artist") and not exists("artists", ep["protagonist_artist"]):
                errors.append("%s: protagonista inexistente" % label)
            if ep.get("protagonist_company") and not exists("companies", ep["protagonist_company"]):
                errors.append("%s: compañía protagonista inexistente" % label)
            if ep.get("discipline") not in disciplines:
                errors.append("%s: disciplina desconocida" % label)
            for s in walk_strings(ep):
                if RUT_RE.search(s):
                    errors.append("%s: contiene un patrón de RUT" % label)
                    break
        posta = load(os.path.join(dcc, "posta.json"))
        for h in posta["handovers"]:
            for key in ("from_episode", "to_episode"):
                if h.get(key) and h[key] not in ep_slugs:
                    errors.append("posta.json entrega %s: episodio desconocido %s" % (h["n"], h[key]))
        for (coll, slug), rec in records.items():
            for e in rec.get("episodes", []) or []:
                if e not in ep_slugs:
                    errors.append("%s/%s.json: episodio desconocido '%s'" % (coll, slug, e))
        print("de-cuento-en-cuento: %d episodios, %d entregas de La Posta" % (len(episodes), len(posta["handovers"])))

    # cola
    rq_path = os.path.join(DATA, "research_queue.json")
    if os.path.exists(rq_path):
        rq = load(rq_path)
        ids = set()
        for i, t in enumerate(rq):
            label = "research_queue.json[%d]" % i
            errors += v.validate(t, "research_task.schema.json", label)
            if t.get("id") in ids:
                errors.append("%s: id duplicado %s" % (label, t.get("id")))
            ids.add(t.get("id"))
            if t.get("territory") and t["territory"] not in communes:
                errors.append("%s: comuna desconocida '%s'" % (label, t["territory"]))
            if t.get("province") and t["province"] not in provinces:
                errors.append("%s: provincia desconocida '%s'" % (label, t["province"]))
        by_status = {}
        for t in rq:
            by_status[t["status"]] = by_status.get(t["status"], 0) + 1
        print("research_queue: %d tareas %s" % (len(rq), by_status))

    print()
    for w in warnings:
        print("AVISO   " + w)
    for e in errors:
        print("ERROR   " + e)
    print()
    print("%d errores, %d avisos" % (len(errors), len(warnings)))
    if errors or (strict and warnings):
        sys.exit(1)


if __name__ == "__main__":
    main()
