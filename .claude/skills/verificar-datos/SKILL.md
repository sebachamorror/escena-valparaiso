---
name: verificar-datos
description: Aplicar los criterios de verificación de QUINTA ESCENA a un registro (compañía, artista, obra, espacio, evento, convocatoria, archivo, episodio): revisar cada fuente, confirmar territorio y actividad, calcular confidence_score con la rúbrica, fijar verification_status, next_review_at y nota, y decidir si es publicable. Usar antes de publicar cualquier dato y en cada re-verificación.
---

# Verificar datos

Referencia: `docs/CRITERIOS_VERIFICACION.md` y `docs/INVESTIGACION.md` §4.

## Entrada
Uno o más archivos de `data/` (o registros del panel) en estado `pendiente` o `requiere_actualizacion`.

## Procedimiento
1. **Abrir cada fuente** listada. Confirmar que dice lo que el registro afirma y anotar el campo que respalda (`entity_sources.field`). Fuente que no abre: intentar copia archivada; si no existe, se degrada a nivel 3.
2. **Territorio:** confirmar comuna con fuente de nivel 1 o 2. Si solo se deduce, `commune` pasa a `null` y el registro no es publicable.
3. **Actividad:** buscar señal de los últimos 12 meses (función, publicación, adjudicación, prensa). Sin señal: `status: "desconocido"`.
4. **Datos personales:** eliminar cualquier RUT, dirección particular, teléfono o correo personal. Contactos no autorizados → `contact_authorized: false` y no se publican.
5. **Imágenes:** cada `media` con autor, licencia y autorización; si falta, se retira del registro.
6. **Duplicados:** buscar por nombre, variantes y comuna en `data/` y en la cola.
7. **Score** con la rúbrica:
   - 90–100: nivel 1 propio u oficial con actividad ≤ 12 meses, o validación directa.
   - 70–89: al menos una nivel 1 y una nivel 2, actividad ≤ 24 meses.
   - 50–69: una sola fuente confiable o fuentes > 24 meses.
   - 0–49: solo nivel 3, contradicciones o sin fuente.
8. **Estado:** `verificado` si score ≥ 70 y sin contradicciones; `rechazado` si no existe, no es de la región, duplicado o sin fuente válida; si falta información, sigue `pendiente` con nota de qué falta.
9. **Fechas:** `verified_at` (hoy), `verified_by`, `next_review_at` según tabla de vencimientos.
10. **Publicable:** solo `verificado` + score ≥ 70; `published` lo activa una persona del equipo.

## Salida
El mismo archivo actualizado (`verification.*`), una línea en `docs/PROGRESO.md` si es un lote, y tareas nuevas en la cola por cada dato faltante que valga la pena buscar. Correr `python3 scripts/validar_datos.py`.

## Nunca
Subir el score por "parecer" cierto; completar un campo vacío con memoria propia; aceptar una red de terceros como fuente única.
