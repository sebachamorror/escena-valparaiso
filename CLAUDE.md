# ESCENA VALPARAÍSO — guía para trabajar en este proyecto

**Artes escénicas de la Región de Valparaíso.**
Tagline provisional: *Descubre qué está pasando en la escena de tu región.*

Este archivo dice cómo trabajar aquí. La filosofía del proyecto está en [docs/SOUL.md](docs/SOUL.md). Léelo antes de escribir código, datos o textos.

## 1. Qué es este proyecto

ESCENA VALPARAÍSO es una **infraestructura cultural digital regional**: un ecosistema para descubrir, documentar, visibilizar y conectar las artes escénicas de la Región de Valparaíso. No es solo una cartelera.

**De Cuento en Cuento** es su primera serie original: un juglar recorre la región para descubrir a quienes mantienen vivas sus artes escénicas. Es una sección dentro de ESCENA VALPARAÍSO, nunca el nombre de la plataforma.

Aplauzo (aplauzo.art, `~/Documents/WebAplauzo`) es la plataforma hermana sobre teatro iberoamericano. Sirve como **referencia técnica**, no como fuente de contenido ni de identidad visual. Nunca se modifica desde aquí. La auditoría está en [docs/AUDITORIA_APLAUZO.md](docs/AUDITORIA_APLAUZO.md).

## 2. Reglas que no se negocian

1. **Nunca inventar** artistas, compañías, obras, fechas, premios, fondos, ubicaciones, teléfonos, correos, enlaces ni coordenadas. Si un dato no existe, el campo es `null` o `[NO ENCONTRADO]`.
2. **Todo dato lleva fuente**: URL, fecha de consulta y estado de verificación (`pendiente`, `verificado`, `requiere actualización`, `rechazado`). Ver [docs/CRITERIOS_VERIFICACION.md](docs/CRITERIOS_VERIFICACION.md).
3. **Nada se publica sin verificar.** El umbral de publicación es `confidence_score >= 70` y `verification_status = verificado`.
4. **Sin datos personales sensibles.** No se guardan RUT, direcciones particulares ni teléfonos personales. Contactos solo si son públicos y profesionales, o si la persona los autorizó por escrito.
5. **Imágenes con crédito, licencia y fuente.** Nunca imágenes de Google Images como fuente final. Nunca material protegido sin permiso.
6. **Territorio como dato central.** Toda entidad se relaciona con comuna, provincia y, cuando existe, coordenadas con fuente.
7. **Isla de Pascua es un territorio de la plataforma**, aunque quede fuera del recorrido inicial de De Cuento en Cuento.
8. **Mobile first y accesible.** Ninguna funcionalidad se da por terminada sin probarla en móvil y con teclado.
9. **Sin cambios grandes silenciosos.** Cada fase termina con una entrada en [docs/PROGRESO.md](docs/PROGRESO.md).
10. **Calidad sobre cantidad.** Una ficha verdadera y documentada vale más que veinte incompletas.

## 3. Mapa del repositorio

```
escena-valparaiso/
├── CLAUDE.md                 esta guía
├── README.md                 presentación breve
├── docs/                     filosofía, arquitectura, modelo de datos, roadmap, progreso
├── .claude/skills/           skills de investigación y verificación (12)
├── data/                     datos versionados en JSON con fuentes
│   ├── territories/          región, provincias y comunas (fuente oficial)
│   ├── schemas/              JSON Schema de cada entidad
│   ├── de-cuento-en-cuento/  serie, episodios, posta
│   ├── companies/ artists/ works/ venues/ events/ calls/ editorial/ archive/
│   └── research_queue.json   cola de investigación
├── scripts/                  validación e importación (Python 3, sin dependencias)
├── src/                      aplicación (se crea en la Fase 4 del roadmap, tras revisión)
└── public/                   estáticos
```

Documentos de referencia:

| Documento | Para qué |
|---|---|
| [docs/SOUL.md](docs/SOUL.md) | Propósito, principios editoriales, de diseño y de contenido |
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) | Stack, carpetas, navegación, componentes, flujos |
| [docs/MODELO_DATOS.md](docs/MODELO_DATOS.md) | Entidades, relaciones, esquema SQL, formatos de importación |
| [docs/MAPA.md](docs/MAPA.md) | Mapa regional, capas, geometría, geocodificación |
| [docs/EDITORIAL.md](docs/EDITORIAL.md) | Sistema editorial y oficios |
| [docs/DE_CUENTO_EN_CUENTO.md](docs/DE_CUENTO_EN_CUENTO.md) | La serie, episodios, La Posta, datos verificados |
| [docs/INVESTIGACION.md](docs/INVESTIGACION.md) | Metodología, fuentes, score, cola, skills |
| [docs/CRITERIOS_VERIFICACION.md](docs/CRITERIOS_VERIFICACION.md) | Estados, umbrales, revisión |
| [docs/SEO.md](docs/SEO.md) | URLs, metadata, Schema.org, sitemap |
| [docs/ROADMAP.md](docs/ROADMAP.md) | 14 fases |
| [docs/PROGRESO.md](docs/PROGRESO.md) | Bitácora por fase |

## 4. Modo de trabajo

Se trabaja en ciclos: **auditar → proponer → esperar revisión conceptual → implementar → probar → documentar.** No se pasa de "proponer" a "implementar" sin que el usuario revise.

- Antes de tocar `src/`, revisar `docs/ARQUITECTURA.md` y `docs/MODELO_DATOS.md`.
- Antes de crear datos, revisar el esquema correspondiente en `data/schemas/` y correr `python3 scripts/validar_datos.py`.
- Antes de investigar, usar la skill correspondiente en `.claude/skills/` y registrar en `data/research_queue.json`.
- Al terminar una fase, escribir en `docs/PROGRESO.md`: qué se hizo, qué falta, riesgos, decisiones, próximos pasos.

## 5. Convenciones

- **Idioma:** español de Chile en interfaz, datos y documentación. Nombres de campos y código en inglés (`commune`, `province`, `verification_status`).
- **Slugs:** minúsculas, sin acentos, guiones: `teatro-la-lancha`, `villa-alemana`, `san-felipe-de-aconcagua`.
- **Identificadores de datos:** `slug` único por entidad; los archivos JSON en `data/<colección>/<slug>.json`.
- **Fechas:** ISO 8601 (`2026-09-05`, `2026-09-05T19:30:00-03:00`). Nunca fechas escritas como texto libre en campos de fecha.
- **Territorio:** referirse a comunas por su `slug` de `data/territories/comunas.json`; nunca por nombre libre.
- **Disciplinas:** vocabulario controlado en `data/schemas/vocabularios.json`.
- **Fuentes:** array `sources[]` con `{url, title, publisher, accessed_at, type, level}`.
- **Commits:** en español, verbo en infinitivo ("Agregar ficha de compañía"), un cambio por commit.

## 6. Lo que este proyecto no es

- No es una copia visual ni de contenido de Aplauzo.
- No es un portal institucional ni un blog genérico.
- No es una cartelera comercial ni un sitio de venta de entradas: la cartelera es una función editorial y de descubrimiento.
- No es una página turística.
