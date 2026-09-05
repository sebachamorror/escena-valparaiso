---
name: investigar-territorio
description: Investigar una comuna o provincia completa de la Región de Valparaíso para ESCENA VALPARAÍSO: compañías, artistas, espacios, festivales, cartelera, convocatorias locales, formación, historia y actores institucionales, partiendo siempre de la lista oficial de comunas, con salida en la cola de investigación y fichas JSON con fuentes. Usar al abrir un territorio nuevo o al completar uno con pocos registros.
---

# Investigar territorio

## Punto de partida obligatorio
La lista oficial de comunas y provincias en `data/territories/comunas.json` (fuente: Biblioteca del Congreso Nacional, con fecha de consulta) y los códigos únicos territoriales cuando estén verificados. Si el territorio pedido no está en la lista, detenerse y revisar la fuente oficial antes de seguir. No limitar la investigación a las comunas "de interés inicial": las 38 comunas y las 8 provincias, incluida Isla de Pascua, son territorio de la plataforma.

## Orden de trabajo por comuna
1. **Institucional:** municipalidad (departamento o corporación de cultura, agentes culturales registrados, subvenciones, teatros y centros culturales municipales, casa de la cultura, biblioteca); Registro Ley 19.862 filtrado por comuna; SIGPA por comuna.
2. **Fondos:** adjudicatarios de Fondos de Cultura y 7% FNDR con domicilio en la comuna (artes escénicas).
3. **Espacios:** teatros, salas, centros culturales, escuelas con sala, plazas y espacios no convencionales usados por la escena (→ `buscar-espacios-escenicos`).
4. **Compañías y colectivos** (→ `buscar-companias-teatro`), incluyendo teatro escolar, universitario y comunitario.
5. **Artistas** que se declaran de la comuna (→ `buscar-artistas-escenicos`).
6. **Festivales y encuentros** vigentes e históricos (→ `buscar-festivales`).
7. **Cartelera** de los espacios encontrados (→ `buscar-cartelera`).
8. **Formación:** talleres municipales, escuelas, academias.
9. **Historia:** compañías, festivales y salas desaparecidas; prensa histórica (→ `buscar-archivo-teatral`).
10. **Redes locales:** agrupaciones, sindicatos, asambleas (por ejemplo ATTICH V en Valparaíso), redes de compañías.
11. **Educación:** DAEM, JUNJI e Integra (funciones escolares como señal de actividad de teatro familiar).
12. **Contactos institucionales** (encargado de cultura municipal) registrados como fuente potencial en la cola, nunca como dato publicado.

## Salida
- Un bloque de tareas en `data/research_queue.json` con `territory` = slug de la comuna y prioridad.
- Fichas JSON en las colecciones correspondientes con `verification.status = "pendiente"`.
- Un resumen en `docs/PROGRESO.md`: qué se encontró, qué no se encontró (decirlo explícitamente: "no se encontraron compañías documentadas en X con las fuentes revisadas"), y próximas pistas.

## Reglas
- La ausencia de resultados es un hallazgo y se registra; no se rellena con nombres de comunas vecinas.
- Fechas de consulta en todo.
- Provincias interiores (Los Andes, San Felipe de Aconcagua, Petorca, Quillota) tienen prioridad alta por estar menos documentadas.
