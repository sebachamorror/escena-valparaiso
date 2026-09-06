# QUINTA ESCENA

**Artes escénicas de la Región de Valparaíso.**
*Descubre qué está pasando en la escena de tu región.*

QUINTA ESCENA es una plataforma digital para descubrir, conocer y conectar con las artes escénicas de la Región de Valparaíso. Reúne personas, compañías, obras, espacios, actividades, memoria y contenidos editoriales en un sistema territorial abierto.

Su primera serie original, **Quinta Escena Podcast**, recorre la región para conocer a quienes mantienen vivas sus artes escénicas.

> Texto de presentación provisional. Se revisará al cerrar la Fase 2 (ver `docs/ROADMAP.md`).

## Estado

Fase 1 entregada el 5 de septiembre de 2026. Ese mismo día, con la arquitectura aprobada, se construyó una primera versión de la aplicación (Next.js) que lee directamente de `data/`: portada, buscador, mapa regional con geometría oficial, fichas de compañías, artistas y obras, territorios, oficios y Quinta Escena Podcast. Sin Supabase todavía: no hay base de datos, panel de administración ni envío real de propuestas. Ninguna ficha está publicada (todas en `pendiente`, bajo el umbral de verificación). Ver `docs/PROGRESO.md`.

## Empezar

1. Leer `CLAUDE.md` y `docs/SOUL.md`.
2. Revisar `docs/ARQUITECTURA.md` y `docs/MODELO_DATOS.md`.
3. Validar datos: `python3 scripts/validar_datos.py`.
4. Instalar dependencias: `npm install`.
5. Levantar la app en desarrollo: `npm run dev` (http://localhost:3000). También: `npm run build`, `npm run typecheck`, `npm test`.

## Estructura

Ver el mapa del repositorio en `CLAUDE.md`.
