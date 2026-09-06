---
name: buscar-oficios-escenicos
description: Reunir y documentar contenido sobre los 17 oficios escénicos (actuación, dramaturgia, dirección, iluminación, sonido, escenografía, vestuario, utilería, maquillaje, títeres, producción, gestión, mediación, técnica, música escénica, circo, narración oral) en la Región de Valparaíso: artículos, videos, entrevistas, tutoriales, perfiles profesionales y episodios de Quinta Escena Podcast, con fuentes y derechos claros.
---

# Buscar oficios escénicos

## Cuándo usar
Para poblar `/oficios/<oficio>` y para etiquetar contenido existente por oficio.

## Qué se busca por oficio
- Personas de la región que lo ejercen (pistas para `buscar-artistas-escenicos`).
- Contenido publicado con licencia o autorización posible: entrevistas, artículos, videos (YouTube de la propia persona o institución), tutoriales, charlas.
- Formación relacionada en la región (pistas para `/formacion`).
- Episodios o cápsulas de Quinta Escena Podcast donde el oficio se muestra (`data/quinta-escena-podcast/episodios.json`).
- Vocabulario y herramientas propias del oficio, para la introducción de la página.

## Fuentes
Nivel 1: canales y sitios de las propias personas e instituciones; universidades; Ministerio; SIGPA (para oficios tradicionales como títeres). Nivel 2: prensa y academia. No se republica contenido de terceros: se enlaza con crédito.

## Salida
- `data/editorial/oficio-<slug>.md` con frontmatter (`category: "investigacion"`, `crafts: [<slug>]`) y una introducción propia con fuentes.
- Relaciones `crafts_content` expresadas en los JSON de artistas, posts y episodios (`crafts: [...]`).
- Tareas en la cola para personas y formaciones detectadas.

## Reglas
- Solo enlazar videos cuyo titular sea identificable.
- No describir técnicas como "la forma correcta"; atribuir a quien lo dice.
