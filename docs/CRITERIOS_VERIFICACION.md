# Criterios de verificación

Esto es crítico: **nunca se publica información sin fuente.**

## 1. Qué guarda cada registro

- fuente primaria (nivel 1) y fuente secundaria (nivel 2 o 3), cada una con URL, título, publicador, tipo, nivel y **fecha de consulta**;
- estado de verificación;
- `confidence_score` (0–100);
- responsable de revisión (`verified_by`), fecha (`verified_at`) y nota;
- próxima revisión (`next_review_at`).

## 2. Estados

| Estado | Significado | Quién lo fija |
|---|---|---|
| `pendiente` | Registro creado por investigación o propuesta ciudadana; no publicable | investigador o sistema |
| `verificado` | Fuentes revisadas, score ≥ 70, sin contradicciones; publicable | verificador o admin |
| `requiere_actualizacion` | Estuvo verificado; venció `next_review_at` o una fuente cambió; sigue visible con aviso "en revisión" salvo cartelera y convocatorias, que se ocultan | sistema o verificador |
| `rechazado` | No existe, no corresponde a la región, duplicado o sin fuente válida; no publicable | verificador o admin |

Transiciones: `pendiente → verificado | rechazado`; `verificado → requiere_actualizacion → verificado | rechazado`.

## 3. Umbral

Publicable solo si `verification_status = verificado` **y** `confidence_score ≥ 70` **y** `published = true`. La publicación es una acción explícita de una persona del equipo.

## 4. Criterios por tipo de dato

| Dato | Se verifica con | Vence |
|---|---|---|
| Existencia de la entidad | Fuente nivel 1 (propia u oficial) | 12 meses |
| Territorio (comuna) | Fuente nivel 1 o 2 que nombre la comuna; nunca deducido del área de circulación | 12 meses |
| Estado activo | Señal de actividad en los últimos 12 meses | 12 meses |
| Disciplina | Fuente propia o catálogo oficial | 24 meses |
| Integrantes | Publicados por la propia entidad | 12 meses |
| Obras, año, dirección, autoría | Programa, ficha oficial, prensa | sin vencimiento; se amplía |
| Premios, reconocimientos, SIGPA | Fuente oficial del organismo | sin vencimiento |
| Fondos adjudicados | Resultados publicados por Fondos de Cultura, GORE o municipio (folio y año) | sin vencimiento |
| Contacto (correo, sitio, redes) | Publicado por la propia entidad o autorizado por escrito | 6 meses |
| Función de cartelera | Fuente oficial del espacio o compañía con fecha, hora y lugar; nunca de agregadores | 7 días antes de la función; se oculta al vencer |
| Convocatoria | Bases o página oficial con fechas de apertura y cierre | al cierre |
| Coordenadas | Dirección oficial + geocodificación registrada, o coordenada proporcionada por la entidad | 24 meses |
| Imagen | Autor, licencia y autorización registrados en `media` | sin vencimiento |
| Dato histórico (archivo) | Documento, testimonio identificado o publicación; se indica procedencia y derechos | sin vencimiento |

## 5. Fuentes aceptables y no aceptables

Aceptables: las de nivel 1 y 2 de `INVESTIGACION.md`; redes oficiales de la propia entidad; documentos del proyecto De Cuento en Cuento; testimonios identificados y consentidos.

No aceptables como única fuente: agregadores de eventos, directorios de terceros, redes de terceros, resultados de imágenes, páginas sin fecha ni autor, generadores de contenido, memoria del investigador.

## 6. Checklist del verificador

1. Cada fuente abre y dice lo que el registro afirma.
2. Fecha de consulta registrada; copia archivada si la fuente es frágil.
3. Territorio confirmado por fuente, no deducido.
4. Señal de actividad reciente confirmada (o `status = desconocido`).
5. Sin datos personales sensibles.
6. Contactos solo públicos o autorizados.
7. Imágenes con crédito y licencia.
8. Score calculado con la rúbrica; nota con lo que falta.
9. `next_review_at` fijado.
10. Duplicados revisados (nombre, variantes, misma comuna).

## 7. Corrección y retiro

Cualquier persona o entidad puede pedir corrección o retiro de su información desde su ficha. Se atiende en menos de 7 días; el registro pasa a `requiere_actualizacion` mientras se resuelve.

## 8. Registro

Toda verificación queda en `verification_log (entity_type, entity_id, from_status, to_status, score, verified_by, at, note)`.
