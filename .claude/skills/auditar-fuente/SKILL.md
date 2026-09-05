---
name: auditar-fuente
description: Evaluar una fuente (URL, documento, testimonio) para ESCENA VALPARAÍSO: identificar publicador y tipo, asignar nivel (1 oficial/institucional, 2 prensa/académica, 3 secundaria), vigencia, fiabilidad, qué campos puede respaldar, y registrarla en data/sources con fecha de consulta y copia archivada. Usar antes de aceptar una fuente nueva o cuando una fuente parezca dudosa.
---

# Auditar fuente

## Preguntas
1. **Quién publica.** Organismo, medio, institución, la propia entidad, un tercero. ¿Se identifica autor y fecha?
2. **Tipo y nivel.** `oficial`, `institucional` (nivel 1); `prensa`, `academico` (nivel 2); `red-social` de la propia entidad (nivel 1 para existencia y actividad; nivel 2 para lo demás); `directorio`, `red de terceros`, `agregador` (nivel 3); `documento-proyecto` (documentos internos de De Cuento en Cuento: nivel 1 para datos de la serie, nivel 2 para trayectorias porque citan a otros); `testimonio` (nivel 3 salvo consentimiento y contexto).
3. **Vigencia.** Fecha de publicación; ¿describe presente o pasado? Una fuente de 2019 no prueba actividad en 2026.
4. **Consistencia.** ¿Coincide con otras fuentes? Contradicciones se registran.
5. **Qué respalda.** Lista de campos (existencia, territorio, disciplina, integrantes, obras, premios, fondos, contacto, fechas).
6. **Riesgos.** Contenido generado, copia de otra fuente sin crédito, página sin fecha, dominio sospechoso, información personal que no debe replicarse.
7. **Archivo.** Guardar copia en Wayback Machine (`archived_url`) si la fuente es frágil (redes, prensa pequeña).

## Salida
Objeto `source` para incluir en el registro:
```json
{ "url": "", "title": "", "publisher": "", "type": "institucional", "level": 1, "accessed_at": "AAAA-MM-DD", "archived_url": null, "supports": ["existence", "commune", "discipline"], "notes": "" }
```
Y, si la fuente se rechaza, la razón en la nota de verificación del registro.

## Nunca
Aceptar resultados de imágenes, agregadores o "se sabe que" como fuente. Copiar textos completos. Replicar datos personales aunque la fuente los publique.
