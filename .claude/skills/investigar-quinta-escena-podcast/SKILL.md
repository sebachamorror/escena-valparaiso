---
name: investigar-quinta-escena-podcast
description: Completar y mantener los datos de la serie Quinta Escena Podcast (episodios, protagonistas, agrupaciones, territorios, locaciones, objetos, La Posta, cápsulas, audios, transcripciones) usando únicamente los documentos del proyecto (propuesta vigente, ruta.py, investigación madre, cartas de compromiso) y fuentes públicas citadas en ellos, sin datos personales sensibles, en JSON conforme a data/schemas/episode.schema.json.
---

# Investigar Quinta Escena Podcast

Referencia: `docs/QUINTA_ESCENA_PODCAST.md`.

## Fuentes autorizadas, en orden
1. Cartas de compromiso firmadas (`~/Documents/Proyectos 2026 - 2027/01 POSTULACIONES 2027/15 Difusion Digital (por definir)/4 Cartas/Entrevistados/`): mandan sobre persona, comuna, disciplina y agrupación.
2. `2 Documentos de postulacion/_fuentes de los PDF/ruta.py`: fuente única de verdad de los capítulos (número, tramo, locación natural, eje, hito verificable, fuentes citadas).
3. Propuesta de difusión vigente (`Quinta Escena Podcast.docx`): estructura, dispositivo, productos comprometidos, accesibilidad.
4. `3 Investigacion y contenido/De Cuento - INVESTIGACION MADRE.docx`: trayectorias con fuentes públicas citadas.
5. Fuentes públicas citadas en los anteriores (SIGPA, Fondos de Cultura, prensa), para obtener URL y fecha de consulta.

Si un documento contradice una carta, el documento está mal. La carpeta `_archivo` está superada: no usar como fuente de datos.

## Qué se registra
- `serie.json`: título, subtítulo, descripción, región, temporada, estado, productos comprometidos.
- `episodios.json`: por episodio, número, slug, título provisional, tramo, comuna, provincia, protagonista (slug de artista), agrupación (slug de compañía o `null` si es a título personal), disciplina, locación natural (nombre; coordenadas solo con fuente), eje narrativo, estado (`planificado`, `grabado`, `publicado`), URLs de video y audio cuando existan, subtítulos y lengua de señas, transcripción.
- `posta.json`: siete entregas en orden Los Andes → Putaendo → La Ligua → Quillota → Villa Alemana → Viña del Mar → San Antonio; objeto y mensaje `null` hasta que ocurran.
- Fichas de artistas y compañías en sus colecciones (usar las skills correspondientes), con `series: ["quinta-escena-podcast"]`.

## Qué no se registra
RUT, direcciones de sedes (`sede_direccion` está vacío en `ruta.py` y aunque se completara es dato privado), teléfonos, correos personales, kilómetros y presupuesto, estado de firma de las cartas (dato interno de gestión).

## Reglas
- Los perfiles quedan `pendiente` hasta que cada persona valide su ficha (compromiso de la propuesta).
- Cada hito de trayectoria se guarda con su fuente; si la fuente citada no tiene URL localizable, `url: null` y `type: "documento-proyecto"` con nota.
- Las discrepancias entre brief y documentos se anotan en `docs/QUINTA_ESCENA_PODCAST.md` §9, no se resuelven inventando.
