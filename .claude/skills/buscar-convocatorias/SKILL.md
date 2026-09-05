---
name: buscar-convocatorias
description: Levantar fondos concursables, residencias, festivales con convocatoria, talleres, audiciones, laboratorios, becas, llamados y seminarios para artistas escénicos de la Región de Valparaíso, con fechas de apertura y cierre, organismo, beneficiarios, monto, requisitos, enlace oficial y estado (abierta, próxima, cerrada, archivada), en JSON conforme a data/schemas/call.schema.json.
---

# Buscar convocatorias

## Cuándo usar
Para alimentar `/convocatorias` y para detectar fondos históricos que expliquen trayectorias de compañías.

## Fuentes
Nivel 1: fondosdecultura.cl (Fondo de Artes Escénicas y sus líneas, Fondart Regional, Becas Chile Crea), Gobierno Regional de Valparaíso (7% FNDR cultura), Seremi de las Culturas Valparaíso, municipios (subvenciones, fondos concursables comunales), universidades (residencias, diplomados), fundaciones y festivales (bases publicadas), Iberescena. Nivel 2: prensa que enlace a las bases.

## Pasos
1. Título oficial; organismo; tipo (`call_types`).
2. Descripción breve propia (no copiar bases); disciplina(s); territorio (comunal, regional, nacional, internacional).
3. `opens_at` y `closes_at` exactas desde las bases o la página oficial; si solo hay mes, `date_precision: "month"`.
4. Beneficiarios; monto si corresponde; requisitos principales (lista corta).
5. Enlace oficial (bases o página de postulación).
6. Estado: se calcula por fechas; `archivada` solo manual.
7. Fuente con fecha de consulta.

## Salida
`data/calls/<slug>.json`. Re-verificar las abiertas cada 7 días y al cierre.

## Reglas
- Nunca afirmar montos o fechas que no estén en la fuente oficial.
- Convocatorias sin fecha de cierre publicada: `closes_at: null` y nota "cierre no informado".
- Convocatorias cerradas hace más de 12 meses solo se registran si documentan la trayectoria de una entidad (con `status_override: "archivada"`).
