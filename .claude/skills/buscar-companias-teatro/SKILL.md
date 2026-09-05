---
name: buscar-companias-teatro
description: Investigar y documentar compañías de teatro y artes escénicas de la Región de Valparaíso con fuentes verificables, score de confianza y salida JSON conforme a data/schemas/company.schema.json. Usar cuando se pida encontrar, levantar, catastrar o completar compañías, colectivos o agrupaciones escénicas de una comuna, provincia o de toda la región.
---

# Buscar compañías de teatro

## Cuándo usar
Cuando haya que encontrar compañías (profesionales, independientes, comunitarias, universitarias, infantiles, familiares, de títeres, teatro físico, circo, narración oral, experimental, Lambe-Lambe, colectivos, agrupaciones) de la Región de Valparaíso, o completar la ficha de una ya conocida.

## Entradas
- Territorio objetivo (comuna o provincia, por `slug` de `data/territories/comunas.json`) o nombre de compañía.
- Disciplina(s) opcional(es) del vocabulario `data/schemas/vocabularios.json`.

## Fuentes, en orden
**Nivel 1 (oficiales):** sitio y redes oficiales de la compañía; municipalidad (departamento de cultura, agentes culturales, subvenciones); centros culturales y teatros (programación); universidades; Ministerio de las Culturas y Seremi Valparaíso; SIGPA; resultados de Fondos de Cultura (fondosdecultura.cl) y 7% FNDR del Gobierno Regional; Registro de organizaciones Ley 19.862; Catálogo de Compañías de Teatro Tradicional de Títeres Región de Valparaíso (Servicio Nacional del Patrimonio Cultural, 2025).
**Nivel 2 (prensa y academia):** El Mercurio de Valparaíso, El Observador, El Proa, Diario El Trabajo, El Andino, La Estrella, medios nacionales, revistas especializadas, publicaciones universitarias.
**Nivel 3 (secundarias):** directorios, agregadores, redes de terceros. Nunca como única fuente.

## Consultas útiles
`"compañía de teatro" <comuna>` · `teatro <comuna> Fondart` · `titiriteros <comuna>` · `site:fondosdecultura.cl <comuna> artes escénicas` · `site:<municipio>.cl teatro` · `festival teatro <provincia>` · `"teatro familiar" <comuna>` · `"Lambe Lambe" Valparaíso`.

## Pasos (por compañía)
1. Buscar el nombre y sus variantes.
2. Verificar comuna de sede con fuente (no deducir de dónde se presenta).
3. Confirmar disciplina(s).
4. Confirmar actividad reciente (últimos 12 meses); si no hay, `status: "desconocido"`.
5. Registrar fuente primaria.
6. Registrar fuente secundaria.
7. Sitio web.
8. Redes oficiales (Instagram, Facebook, TikTok, YouTube).
9. Integrantes, solo si la compañía los publica.
10. Obras (título, año, autoría, dirección).
11. Festivales en que participó.
12. Fondos adjudicados (fondo, año, folio si la fuente lo da).
13. Espacios donde trabaja o se presenta.
14. Relación territorial (origen, comunas de circulación).
15. Guardar cada fuente con `url`, `title`, `publisher`, `type`, `level`, `accessed_at` (hoy).

## Salida
Un archivo `data/companies/<slug>.json` válido contra `company.schema.json`, con `verification.status = "pendiente"` y `confidence_score` según la rúbrica de `docs/INVESTIGACION.md` (§4). Campos sin dato: `null`. Nunca inventar correo, teléfono, año o enlace.

Además: agregar o actualizar la entrada en `data/research_queue.json` (`status: "done"` o `"discarded"` con motivo) y anotar nuevas pistas (otras compañías, espacios, festivales) como tareas `pending`.

## Reglas
- Sin datos personales sensibles.
- Una página antigua no prueba actividad.
- Si dos fuentes se contradicen, registrar ambas en `verification.note` y dejar el campo en `null`.
- Correr `python3 scripts/validar_datos.py` antes de terminar.
