---
name: buscar-cartelera
description: Levantar funciones y actividades escénicas de la Región de Valparaíso con fecha, hora, lugar y fuente oficial verificada, sin copiar carteleras de agregadores, en JSON conforme a data/schemas/event.schema.json. Usar para "qué hay hoy / esta semana / este mes" por comuna, provincia, disciplina o público.
---

# Buscar cartelera

## Cuándo usar
Para levantar o actualizar funciones próximas. La cartelera es una función editorial y de descubrimiento: prioriza calidad y exactitud sobre volumen.

## Fuentes válidas para una función
Solo **nivel 1**: programación oficial del espacio (sitio, redes oficiales), de la compañía, del municipio o del festival; sistema de venta enlazado desde una de esas fuentes. Un agregador o red de terceros sirve como pista, nunca como fuente de fecha.

## Pasos
1. Recorrer los espacios y compañías verificados del territorio (`data/venues/`, `data/companies/`) y los teatros y centros culturales municipales.
2. Para cada actividad: título, obra (slug si existe), compañía (slug si existe), tipo (`funcion`, `temporada`, `festival`, `taller`, `encuentro`), fechas y horas exactas en ISO 8601 con zona `-03:00`/`-04:00` según corresponda, espacio (slug) o lugar con dirección, comuna, precio o gratuidad, reservas o entradas (URL), accesibilidad declarada, público.
3. Verificar la fecha en la fuente oficial **el mismo día del levantamiento**; registrar `last_checked_at`.
4. Si la obra o compañía no existe en `data/`, crear tarea en la cola en vez de inventar la relación.
5. No registrar funciones pasadas salvo para historial de una obra ya documentada.

## Salida
`data/events/<slug>.json` con `occurrences[]`. `source` obligatoria por evento. `verification.status = "pendiente"`; el verificador confirma antes de publicar. Las funciones vencidas se ocultan automáticamente.

## Reglas
- Nunca copiar textos completos de sinopsis; resumir con crédito o enlazar.
- Si la fuente no da hora, `starts_at` con fecha y `time_unknown: true`.
- Precio: texto tal como lo publica la fuente (`"$5.000 general"`), `is_free` solo si la fuente lo dice.
- Registrar accesibilidad solo si la fuente la declara.
