---
name: buscar-festivales
description: Documentar festivales, encuentros y muestras de artes escénicas de la Región de Valparaíso (vigentes e históricos), con ediciones, organizadores, territorio, fechas y fuentes, produciendo eventos (event.schema.json), convocatorias asociadas y entradas de archivo cuando el festival ya no existe.
---

# Buscar festivales

## Cuándo usar
Para levantar festivales y encuentros escénicos de la región: los vigentes (cartelera y convocatorias) y los históricos (archivo y memoria).

## Fuentes
Nivel 1: sitio y redes del festival; municipio o Gobierno Regional (7% FNDR); Fondos de Cultura (línea festivales); espacios sede. Nivel 2: prensa regional, publicaciones académicas. Pistas conocidas del proyecto: Festival de Teatro y Todas las Artes Valle del Liwa (Petorca), Festival Litoral Teatral (San Antonio), Festival Ventolera y Festival Caleta de Títeres (Valparaíso, ATTICH V), Teatro Container, Puerto a Puerta Valparaíso (OANI / Teatro Container), gira regional de teatro familiar 2021.

## Pasos
1. Nombre oficial y variantes; organizador (compañía, fundación, municipio); comuna(s) sede.
2. Ediciones: año de inicio, número de ediciones, última edición confirmada.
3. Disciplinas y público.
4. Financiamiento declarado (fondo, año) si la fuente lo publica.
5. Compañías participantes de la última edición (pistas para `buscar-companias-teatro`).
6. Convocatoria abierta a compañías: fechas y bases (crear `call`).
7. Estado: vigente (edición en 24 meses), en pausa, desaparecido (crear `archive_item` tipo `festival-historico`).
8. Fuentes con fecha.

## Salida
- Festival vigente: `data/events/<slug>.json` (`kind: "festival"`) con ocurrencias de la edición próxima o última, y organizador enlazado.
- Convocatoria: `data/calls/<slug>.json`.
- Histórico: `data/archive/<slug>.json`.
- Tareas nuevas en la cola por cada compañía o espacio detectado.
