# Modelo de datos

Estado: propuesta para revisión (Ciclo 2). Base: Postgres (Supabase) con PostGIS. Los mismos esquemas viven como JSON Schema en `data/schemas/` para formularios, importación y validación.

## 1. Principios

1. **El territorio es central.** Toda entidad publicable se relaciona con una o más comunas; de la comuna se derivan provincia y región.
2. **Verificación en cada fila.** Todas las entidades llevan `verification_status`, `confidence_score`, `verified_at`, `verified_by`, `next_review_at`, `published`.
3. **Fuentes como entidad.** Una fuente se registra una vez y se enlaza a muchas entidades con rol primario o secundario.
4. **Relaciones N:M explícitas** (artista ↔ compañía, artista ↔ obra, obra ↔ compañía, evento ↔ espacio).
5. **Vocabularios controlados** (disciplinas, tipos de espacio, tipos de convocatoria, oficios, públicos, modalidades) como datos, no como código.
6. **Slugs estables** y únicos por tabla; `id uuid` como clave técnica.
7. **Nada de datos personales sensibles.**
8. **Multi-región desde el origen**: `regions` existe aunque solo haya una.

## 2. Mapa de entidades

```
REGION ─< PROVINCE ─< COMMUNE ─< PLACE (coordenadas, dirección, precisión, fuente de geocodificación)
                                   │
   ┌───────────────────────────────┼─────────────────────────────────────────┐
   │                               │                                         │
COMPANY ──< COMPANY_MEMBER >── ARTIST ──< WORK_CREDIT >── WORK ──< WORK_COMPANY >── COMPANY
   │                               │                        │
   │                               │                        └──< EVENT ──< OCCURRENCE >── VENUE ── PLACE
   │                               │                                  (funciones: fecha, hora, precio)
   │                               │
   └── FUNDING_AWARD, RECOGNITION ─┘

CALL (convocatoria) · POST (editorial) · CRAFT (oficio) · TRAINING (formación) · ARCHIVE_ITEM
SERIES ─< EPISODE ─< POSTA_HANDOVER ── POSTA_OBJECT
MEDIA (imagen/video/audio con crédito y licencia) ── MEDIA_LINK (a cualquier entidad)
SOURCE ── ENTITY_SOURCE (a cualquier entidad)
ENTITY_TERRITORY · ENTITY_DISCIPLINE · ENTITY_TAG · RELATED_CONTENT (polimórficas)
CONTRIBUTION (participación ciudadana) · RESEARCH_TASK (cola) · PROFILE (equipo y roles)
```

## 3. Tablas

Notación resumida. Todas las tablas tienen `id uuid pk default gen_random_uuid()`, `created_at`, `updated_at`.

### 3.1 Territorio

```sql
regions      (slug unique, name, country_code default 'CL', active bool)
provinces    (region_id fk, slug unique, name, cut_code text, sort int)
communes     (province_id fk, slug unique, name, cut_code text, centroid geography(Point,4326) null,
              boundary geography(MultiPolygon,4326) null, population int null, sources jsonb)
places       (commune_id fk, name null, address text null, location geography(Point,4326) null,
              precision text check (precision in ('exact','street','commune_centroid','unknown')),
              geocode_source text null, geocoded_at date null, notes text)
```

### 3.2 Vocabularios

```sql
disciplines  (slug unique, name, parent_id null)           -- teatro, titeres, circo, narracion-oral, danza, lambe-lambe, performance, opera, musica-escenica, juglaria
venue_types  (slug, name)                                  -- teatro, centro-cultural, sala, espacio-independiente, escuela, museo, espacio-publico, no-convencional
call_types   (slug, name)                                  -- fondo, residencia, festival, taller, audicion, laboratorio, beca, llamado, seminario
crafts       (slug, name, description)                     -- 17 oficios
audiences    (slug, name)                                  -- familiar, infantil, primera-infancia, juvenil, adulto, todo-publico
modalities   (slug, name)                                  -- presencial, online, hibrido
tags         (slug, name)
```

### 3.3 Personas y agrupaciones

```sql
companies    (slug unique, name, legal_name null, description_md, founded_year int null,
              status text check (status in ('activa','inactiva','desaparecida','desconocido')),
              email null, website null, instagram null, facebook null, tiktok null, youtube null,
              home_commune_id fk, place_id fk null,
              trajectory_md null, -- trayectoria narrativa con fuentes
              + campos de verificación)
artists      (slug unique, name, artistic_name null, bio_md, trajectory_md null, specialties text[],
              home_commune_id fk, website null, instagram null, facebook null, tiktok null, youtube null,
              email_public null, -- solo si es público o autorizado
              + campos de verificación)
company_members (company_id, artist_id, role, from_year null, to_year null, source_id null, pk(company_id, artist_id, role))
recognitions (entity_type, entity_id, title, org, year, url null, source_id)          -- premios, reconocimientos, SIGPA
funding_awards (entity_type, entity_id, fund_name, org, year, folio null, amount int null, url null, source_id)
festivals_participation (entity_type, entity_id, festival_name, year, place text null, source_id)
```

### 3.4 Obras y cartelera

```sql
works        (slug unique, title, synopsis_md, authorship text null, direction text null,
              duration_min int null, audience_id fk null, premiere_year int null,
              video_url null, dossier_url null, + verificación)
work_credits (work_id, artist_id, role)                    -- elenco, dirección, diseño...
work_companies (work_id, company_id)
events       (slug unique, title, kind text check (kind in ('funcion','temporada','festival','taller','encuentro','otro')),
              work_id null, company_id null, description_md, price text null, is_free bool null,
              booking_url null, accessibility text[] null, source_id, last_checked_at date, + verificación)
occurrences  (event_id, venue_id null, place_id null, starts_at timestamptz, ends_at null, price text null, note null)
venues       (slug unique, name, venue_type_id, place_id, capacity int null, website null, contact_public null,
              accessibility text[] null, description_md, status, + verificación)
```

### 3.5 Convocatorias, editorial, oficios, formación, archivo

```sql
calls        (slug unique, title, org, description_md, call_type_id, opens_at date null, closes_at date null,
              beneficiaries text null, amount text null, requirements_md null, official_url,
              status_override text null, -- si null: abierta/próxima/cerrada se calcula por fechas; 'archivada' manual
              scope text check (scope in ('regional','nacional','internacional','comunal')), + verificación)
posts        (slug unique, title, dek, author_id fk profiles, published_at, category text check (category in
              ('entrevista','critica','columna','investigacion','perfil','ensayo','noticia','cronica','memoria','opinion')),
              body_md, cover_media_id null, status text check (status in ('borrador','revision','publicado','retirado')))
crafts_content (craft_id, entity_type, entity_id)          -- artículos, videos, perfiles, episodios ligados a un oficio
trainings    (slug unique, title, kind text check (kind in ('taller','escuela','seminario','curso','masterclass','recurso','metodologia','bibliografia')),
              org, teacher null, discipline_id, modality_id, age_range text null, starts_at null, ends_at null,
              schedule text null, price text null, url null, place_id null, + verificación)
archive_items (slug unique, title, kind text check (kind in ('fotografia','afiche','programa','libreto','video','entrevista',
              'documento','testimonio','compania-desaparecida','festival-historico','espacio-desaparecido','memoria-oral')),
              date_text text null, date_start date null, date_end date null, author text null, provenance text,
              rights text, description_md, media_id null, + verificación)
```

### 3.6 De Cuento en Cuento

```sql
series       (slug unique, title, subtitle, description_md, trailer_url null, region_id, season int)
episodes     (series_id, number int, slug unique, title, synopsis_md, video_url null, audio_url null,
              transcript_md null, has_sign_language bool, has_subtitles bool,
              commune_id, protagonist_artist_id null, protagonist_company_id null, discipline_id,
              natural_location text null, place_id null, narrative_axis text null, tramo text null,
              published_at null, status)
posta_objects (episode_id, name, description_md, given_by_artist_id, media_id null)
posta_handovers (from_episode_id, to_episode_id, object_id, message_md null, handed_at date null, media_id null)
episode_content (episode_id, entity_type, entity_id, kind)  -- cápsulas, fotos, detrás de cámaras, editorial derivada
```

### 3.7 Medios y fuentes

```sql
media        (kind text check (kind in ('image','video','audio','document')), storage_path null, external_url null,
              title, alt_text, author text, credit text, license text, source_url null, taken_at date null,
              width int null, height int null, consent_note text null)
media_links  (media_id, entity_type, entity_id, role text check (role in ('cover','gallery','portrait','poster','still')), sort int)
sources      (url unique null, title, publisher, type text check (type in ('oficial','institucional','prensa','academico',
              'red-social','directorio','testimonio','documento-proyecto','otro')),
              level int check (level in (1,2,3)), accessed_at date, archived_url null, notes)
entity_sources (source_id, entity_type, entity_id, role text check (role in ('primaria','secundaria')), field text null)
```

### 3.8 Relaciones polimórficas

```sql
entity_territories (entity_type, entity_id, commune_id, role text default 'sede')   -- sede, actividad, origen
entity_disciplines (entity_type, entity_id, discipline_id)
entity_tags        (entity_type, entity_id, tag_id)
related_content    (from_type, from_id, to_type, to_id, relation text)             -- "aparece-en", "relacionado"
```

`entity_type` ∈ {company, artist, work, event, venue, call, post, training, archive_item, episode}.

### 3.9 Verificación, participación, equipo

Campos de verificación (en cada entidad publicable):

```sql
verification_status text not null default 'pendiente'
  check (verification_status in ('pendiente','verificado','requiere_actualizacion','rechazado')),
confidence_score int not null default 0 check (confidence_score between 0 and 100),
verified_at timestamptz null, verified_by uuid null references profiles(id), next_review_at date null,
verification_note text null, published bool not null default false
```

```sql
contributions (kind text check (kind in ('compania','artista','obra','espacio','festival','actividad','documento','fotografia','historia')),
               proposal_md, commune_id null, province_id null, proposer_name null, proposer_contact null,
               contact_consent bool default false, provided_source text null, attachments jsonb,
               status text check (status in ('pending','in_review','accepted','rejected','duplicate')),
               reviewer_id null, reviewed_at null, resulting_entity_type null, resulting_entity_id null, note null)
research_tasks (target text, target_type, commune_id null, province_id null, status text check (status in ('pending','in_progress','done','discarded')),
               priority text check (priority in ('high','medium','low')), origin text, notes, result_entity_type null, result_entity_id null)
profiles     (id uuid pk references auth.users, name, role text check (role in ('admin','editor','verificador','lector')))
```

### 3.10 Búsqueda

Vista materializada `search_index (entity_type, entity_id, slug, url, title, subtitle, body, commune_slug, province_slug, disciplines text[], published, tsv tsvector)` con `to_tsvector('spanish', unaccent(...))`, índice GIN, refrescada por trigger o tras cada publicación. La función RPC `search(q, filters)` devuelve resultados agrupados por `entity_type`.

## 4. RLS

- Lectura anónima: filas con `published = true and verification_status = 'verificado'` (y para `calls`, además, no archivadas salvo en `/convocatorias/archivo`).
- `contributions`: INSERT anónimo permitido con `status = 'pending'`; SELECT solo equipo.
- Escritura de entidades: `editor` y `admin`; cambio de `verification_status` a `verificado`: `verificador` y `admin`.
- `media`: lectura pública si está enlazado a una entidad publicada.

## 5. Mapeo con `data/`

| Carpeta | Tabla | Esquema |
|---|---|---|
| `data/territories/*.json` | regions, provinces, communes | `territory.schema.json` |
| `data/companies/*.json` | companies (+ members, recognitions, funding_awards, entity_* , sources) | `company.schema.json` |
| `data/artists/*.json` | artists (+ …) | `artist.schema.json` |
| `data/works/*.json` | works (+ credits, companies) | `work.schema.json` |
| `data/venues/*.json` | venues, places | `venue.schema.json` |
| `data/events/*.json` | events, occurrences | `event.schema.json` |
| `data/calls/*.json` | calls | `call.schema.json` |
| `data/editorial/*.md` | posts | `post.schema.json` (frontmatter) |
| `data/archive/*.json` | archive_items | `archive_item.schema.json` |
| `data/de-cuento-en-cuento/*.json` | series, episodes, posta_* | `episode.schema.json` |
| `data/research_queue.json` | research_tasks | `research_task.schema.json` |

Los archivos JSON usan slugs para referirse a otras entidades (`"commune": "los-andes"`, `"companies": ["the-magic-show"]`); el importador los resuelve a `uuid`.

## 6. Ejemplo: compañía

```json
{
  "slug": "compania-de-teatro-alegria",
  "name": "Compañía de Teatro Alegría",
  "legal_name": null,
  "description_md": "Compañía fundada en Villa Alemana en 2012...",
  "founded_year": 2012,
  "status": "activa",
  "commune": "villa-alemana",
  "disciplines": ["teatro"],
  "audiences": ["familiar", "adulto"],
  "members": [{ "artist": "victor-opazo-herrera", "role": "director" }],
  "works": ["el-loco-y-la-triste"],
  "website": null,
  "social": { "instagram": null, "facebook": null, "tiktok": null, "youtube": null },
  "email": null,
  "recognitions": [],
  "funding_awards": [],
  "festivals": [],
  "venues": [],
  "sources": [
    { "url": "https://...", "title": "...", "publisher": "Municipalidad de Villa Alemana", "type": "institucional", "level": 1, "accessed_at": "2026-09-05", "role": "primaria" }
  ],
  "verification": { "status": "pendiente", "confidence_score": 60, "verified_at": null, "verified_by": null, "next_review_at": null, "note": "Validar con la compañía." },
  "published": false
}
```

## 7. Cálculo del estado de convocatoria

`abierta` si `opens_at <= hoy <= closes_at`; `próxima` si `opens_at > hoy`; `cerrada` si `closes_at < hoy`; `archivada` si `status_override = 'archivada'` o `closes_at < hoy - 12 meses`.

## 8. Escala

Diseñado para 1.000+ registros por entidad: índices en slugs, `commune_id`, `verification_status`, fechas de `occurrences` y `calls`; búsqueda por GIN; paginación por cursor en listados; ISR por página.
