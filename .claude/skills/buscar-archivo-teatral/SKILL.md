---
name: buscar-archivo-teatral
description: Levantar la historia de las artes escénicas de la Región de Valparaíso para el Archivo, la Editorial y la Memoria: fotografías históricas, afiches, programas, libretos, videos, entrevistas, documentos, testimonios, compañías desaparecidas, festivales históricos, espacios desaparecidos y memoria oral, con procedencia, derechos y fuentes, en JSON conforme a data/schemas/archive_item.schema.json.
---

# Buscar archivo teatral

## Cuándo usar
Para la sexta investigación (historia regional) y cada vez que una ficha mencione algo que ya no existe.

## Fuentes
Nivel 1: Biblioteca Nacional Digital y Memoria Chilena; Archivo Nacional; bibliotecas y museos regionales; Museo de Historia Natural de Valparaíso y museos municipales; universidades (UV, PUCV, UPLA) y sus archivos; Fundación TeatroMuseo del Títere y el Payaso; Consejo de Monumentos Nacionales; SIGPA; municipios (archivos, casas de la cultura). Nivel 2: prensa histórica digitalizada (El Mercurio de Valparaíso, La Unión, La Estrella), tesis, libros. Nivel 3: colecciones privadas y testimonios (siempre identificados y consentidos).

## Pasos
1. Identificar el objeto o hecho: título, tipo (`archive_kinds`), fecha o rango, autor, procedencia (quién lo conserva), territorio.
2. Derechos: dominio público, licencia, autorización escrita, o "consulta en sala" (se describe, no se reproduce).
3. Descripción propia con contexto: qué era, quiénes participaron, por qué importa.
4. Relación con entidades actuales (compañía heredera, espacio, artista) o creación de entidades históricas (`status: "desaparecida"`).
5. Fuentes con fecha.

## Salida
`data/archive/<slug>.json`. Si el objeto es un festival o espacio desaparecido, además `data/events/` o `data/venues/` con `status` correspondiente. Pistas editoriales para `docs/EDITORIAL.md` (crónica, memoria).

## Reglas
- No reproducir imágenes sin derechos: se registra la referencia y dónde consultarla.
- Testimonios: nombre, fecha, consentimiento y forma de registro.
- Fechas inciertas: `date_text` ("c. 1985") y `date_start`/`date_end` aproximados con `date_precision`.
