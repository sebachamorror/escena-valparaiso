---
name: buscar-artistas-escenicos
description: Investigar y documentar artistas escénicos de la Región de Valparaíso por oficio (actores, actrices, directores, dramaturgos, músicos escénicos, técnicos, diseñadores, productores, gestores, titiriteros, payasos, narradores, artistas circenses), con fuentes públicas y profesionales, sin datos personales sensibles, en JSON conforme a data/schemas/artist.schema.json.
---

# Buscar artistas escénicos

## Cuándo usar
Para encontrar o completar fichas de personas que ejercen un oficio escénico en la región. También al crear el perfil de un protagonista de Quinta Escena Podcast (usar junto con `investigar-quinta-escena-podcast`).

## Entradas
Nombre, o territorio + oficio. Oficios del vocabulario `crafts` en `data/schemas/vocabularios.json`.

## Fuentes
**Nivel 1:** sitio y redes oficiales de la persona; SIGPA; fichas de compañías; universidades y escuelas (egresos, docencia); resultados de Fondos de Cultura; municipios (agentes culturales); programas de festivales y teatros.
**Nivel 2:** prensa regional y nacional; publicaciones académicas; antologías; entrevistas publicadas.
**Nivel 3:** directorios y redes de terceros (solo como pista).

## Pasos
1. Buscar nombre completo y nombre artístico (ej. "Tony Pinganilla").
2. Confirmar comuna de residencia o trabajo **solo si es pública** (perfil propio, prensa, municipio). Si no, usar la comuna de su compañía.
3. Confirmar oficio(s) principal(es) y especialidades.
4. Compañía(s) y rol, con periodo si la fuente lo da.
5. Obras y roles (elenco, dirección, diseño...).
6. Formación (institución, título) solo desde fuentes públicas.
7. Premios, reconocimientos (SIGPA, festivales).
8. Fondos adjudicados (fondo, año, folio).
9. Sitio y redes oficiales.
10. Actividad reciente (12 meses).
11. Fuentes con fecha de consulta.

## Salida
`data/artists/<slug>.json` válido contra `artist.schema.json`, `verification.status = "pendiente"`, score según rúbrica. Nota obligatoria: "Validar con la persona antes de publicar".

## Reglas
- **Nunca** RUT, dirección particular, teléfono personal, correo personal, edad, situación familiar.
- Correo o teléfono solo si son de contacto profesional publicados por la propia persona; aun así, marcar `contact_authorized: false` hasta que la persona lo confirme.
- Menores: no se crean fichas.
- Distinguir homónimos: si hay duda de identidad, no fusionar; dejar en cola con nota.
- Retratos: no descargar imágenes; registrar en `media_candidates` la URL y el titular de derechos para pedir autorización.
