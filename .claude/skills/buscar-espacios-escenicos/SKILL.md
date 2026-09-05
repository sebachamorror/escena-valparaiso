---
name: buscar-espacios-escenicos
description: Documentar espacios escénicos de la Región de Valparaíso (teatros, centros culturales, salas, espacios independientes, escuelas, museos, espacios públicos y lugares no convencionales) con dirección oficial, comuna, capacidad, contacto público, accesibilidad, programación y fuentes, en JSON conforme a data/schemas/venue.schema.json. Sin inventar coordenadas.
---

# Buscar espacios escénicos

## Cuándo usar
Para crear la base de espacios de la región o completar una ficha. También cuando una función de cartelera menciona un lugar que no existe en `data/venues/`.

## Fuentes
Nivel 1: sitio y redes del espacio; municipio (infraestructura cultural, centros culturales); Ministerio de las Culturas (catastro de infraestructura cultural, Red de Espacios Culturales); universidades; Consejo de Monumentos Nacionales si es patrimonio. Nivel 2: prensa. Nivel 3: mapas de terceros solo como pista de existencia.

## Pasos
1. Nombre oficial, nombre corto, tipo (`venue_types` del vocabulario), titular (municipal, universitario, privado, comunitario).
2. Dirección tal como la publica una fuente nivel 1; comuna por slug.
3. Coordenadas: solo si la fuente oficial las publica, o geocodificando la dirección oficial con Nominatim registrando `geocode_source`, `precision` (`street`) y `geocoded_at`. Si no hay dirección oficial, `location: null`, `precision: "commune_centroid"`.
4. Capacidad y salas si la fuente lo publica.
5. Contacto público (correo institucional, teléfono institucional, sitio, redes).
6. Disciplinas que programa; accesibilidad declarada (rampa, baño accesible, lengua de señas, audiodescripción, aro magnético).
7. Programación: enlace a la agenda oficial; pistas para `buscar-cartelera`.
8. Estado: activo, cerrado temporalmente, desaparecido (entonces `archive_item` tipo `espacio-desaparecido`).
9. Fuentes con fecha.

## Salida
`data/venues/<slug>.json` válido contra `venue.schema.json`; `verification.status = "pendiente"`.

## Reglas
- Nunca inventar ni "aproximar" coordenadas a mano.
- Teléfono y correo solo institucionales.
- Espacios no convencionales (plazas, ferias, escuelas): registrar con `venue_type` correspondiente y la comuna; dirección solo si es pública.
