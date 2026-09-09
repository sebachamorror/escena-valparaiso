# Estado del catastro (memoria del loop)

Este archivo es la memoria de trabajo del ciclo de investigación. Cada ciclo lo lee al empezar y lo
actualiza al terminar. El encargo íntegro está en `BRIEF.md`.

## Cómo funciona un ciclo

1. Leer este archivo y `python3 scripts/catastro/consultas.py siguiente 12` (cola de consultas).
2. Buscar en la web (WebSearch/WebFetch) siguiendo las capas del brief; priorizar fuentes A–C.
3. Escribir un lote `catastro/lotes/NNNN-capaK-tema.json` (formato en `scripts/catastro/agregar.py`).
4. `python3 scripts/catastro/agregar.py catastro/lotes/NNNN-*.json` → `validar.py` → `duplicados.py`
   (fusionar con `--marcar CONSERVAR DUPLICADO`) → `estadisticas.py` → `exportar.py` → `informes.py`.
5. Marcar consultas: `consultas.py hecha Q-XXXX --resumen "..."` (o `--sin-resultados`).
6. Actualizar este archivo (avance, pendientes, aprendizajes) y programar el siguiente ciclo.

Reglas fijas: nunca inventar; comuna solo si la fuente la da (si no, null y nota); toda entidad con
fuente y calidad A–F; datos de contacto solo institucionales o publicados por la propia entidad en
fuente oficial; respetar robots.txt (no insistir en sitios que bloquean agentes).

## Avance por capa (brief §20)

| Capa | Estado | Fuentes procesadas |
|---|---|---|
| 1 Institucional | avanzada | Catálogo títeres SNPC 2025 (íntegro), Puntos de Cultura Valparaíso (87 orgs), Red de Espacios Culturales 2020 (27), PAOCC 2020 (18), espacios bajo convenio Red Cultura, notas Fondos Cultura 2025/2026 |
| 2 Directorios | iniciada | Valpocultura (agenda teatro), Telón.cl (índice Valparaíso), Teatro a Mil (catálogo región) |
| 3 Carteleras | avanzada | Ciudad Teatro 2025 y 2026, Valpocultura sept. 2026, CC Leopoldo Silva/Teatro Rodolfo Bravo (boletines Quillota Cultural 2025, cartelera 2026), TM Viña (enero y temporada 2026), TM San Felipe (2018/2022/2026), CC Los Andes (2022), Mes del Teatro 2022 (12 actividades) |
| 4 Festivales | avanzada | Ventolera 2024 (9 compañías), Litoral Teatral 2024/2026, Ciudad Teatro, Síntesis Teatral (2016–2022), FESTILAMBE (2014–2026), Teatro a Mil regional (2016, 2025, 2026), Santiago Off 2026, Puntos de Fuga 2025/2026, FESTIGOC Putaendo, Ciclo Teatro Familiar Quillota 2019, Culto Zapallar; más los detectados vía fondos (ENAI, Teatro Container, GESTA, TEGE, Danzalborde, SATORI, Escena en Riel, MIXTAS, Quilpué Danza…) |
| 5 Fondos | **completa 2022–2026** | 37 nóminas PDF de Fondos Cultura (AAEE, Fondart Regional/Nacional, PAOCC compañías de trayectoria) procesadas con `fondos_pdf.py`; ~400 proyectos escénicos regionales |
| 6 Sitios de compañías | pendiente | — |
| 7 Redes | pendiente | (los identificadores de redes del catálogo de títeres quedaron en notas) |
| 8 Prensa | pendiente | — |
| 9 Por comuna | en curso | 33/38 comunas con al menos un registro; 2 consultas hechas en 24 comunas; 0/38 con las 8 consultas |
| 10 Búsqueda inversa | en curso | espacio→programación (Ciudad Teatro, Red de Espacios), fondos→compañías/personas |
| 11 Cruce | pendiente | — |
| 12 Nuevas organizaciones | pendiente | — |

## Cifras (cierre ciclo 2, 2026-09-08; exactas en `informes/estadisticas.json`)

Compañías/organizaciones 118 (DESCUBIERTO 76 · PARCIAL 39 · VERIFICADO 3) · Obras 136 ·
Funciones 77 · Espacios 89 · Personas 243 · Festivales 45 · Financiamiento 398 ·
Fuentes 181 (A 78, B 23, C 40, D 6, E 5, F 29). Consultas: 56 hechas, 9 sin resultados, 334 pendientes.
Comunas sin ningún registro: 5 (Juan Fernández, Nogales, Petorca, San Esteban, Catemu); de estas,
Petorca solo tiene el Festival Valle del Liwa sin comuna confirmada.
43 compañías sin comuna: casi todas descubiertas por nóminas de fondos (solo dan la región).
Lotes ingeridos: 0000–0011 (data/, capa 1, Ciudad Teatro 2025/2026, fondos-* 37 PDF, entidades
de fondos, Ventolera 2024, comunas vacías 1, Quillota/Los Andes/Rinconada, Quillota-Aconcagua-La
Cruz, Litoral Teatral/Casablanca/Aconcagua, Marga Marga/Concón/Mes del Teatro 2022, Síntesis/OANI/TM
Viña, FESTILAMBE).

## Pendientes priorizados

1. Comunas sin registros: Nogales/El Melón, Catemu, San Esteban (probar sitios municipales y El
   Andino/El Trabajo por comuna), Juan Fernández (municipalidad, Fundación Endémica), Petorca
   (confirmar sede del Festival Valle del Liwa; municipalidad).
2. Terminar capa 9 en comunas ya abiertas (restan 6 consultas por comuna: obra/festival/artes
   escénicas/cartelera/sala/títeres).
3. Buscar comuna de las 43 compañías sin comuna (nombre + "teatro" + "Valparaíso").
4. Fuentes por reintentar cuando estén en línea: valparaisocreativo.cl (hosting suspendido),
   laboratorioanatomiateatral.cl (sin DNS; folleto FSTV 2019 con 23 obras), festivalvalledelliwa.cl
   (sin DNS), culturaalgarrobo.cl (sin DNS), portaldisc carteleras municipales (en mantención).
5. Festival Fractal (Quilpué 2025/2026: compañías Errante y Pronoias, solo en Songkick) y 1er
   Festival de Teatro de Quilpué (Facebook municipal): buscar fuentes abiertas.
6. Compañía "Quinta de Recreo El Negro Bueno" (Clan Mambo Teatral, fuera de la región) giró por
   Olmué y Zapallar: fechas por confirmar (valparaisoregion.org, video municipal de Zapallar).
4. Carteleras: Teatro Municipal de Valparaíso (portaldisc), TM Viña (teatrovina.cl, contacto
   registrado), Sala Negra UV 2026, Parque Cultural, Teatro Condell, Centro Cultural San Antonio,
   TM Quilpué, Pompeya, Limache, Los Andes, San Felipe, Quillota, La Ligua.
5. Universidades (UV, UPLA, PUCV, Duoc) y sus compañías; escuelas de teatro.
6. Prensa regional por comuna (El Observador, El Trabajo, El Andino, Proa, La Quinta, Martutino).
7. Duplicado pendiente de decisión humana: 'Espacio Catarsis' (Centex) vs 'Espacio Katarcis'
   (Puntos de Cultura). Falsos positivos conocidos: La Washa/La Coraje, CC Coipo/Atma vs CC IPA.
8. Informe estratégico (§16) al cerrar la Fase 1.

## Aprendizajes y restricciones

- `historiadelteatroenvalparaiso.cl` bloquea agentes (robots.txt `ClaudeBot Disallow`, señal
  `use=reference`): no se extrae contenido; queda como referencia manual (FUE registrada).
- Las nóminas PDF de Fondos Cultura se leen con `page.find_tables()` de PyMuPDF (única
  dependencia externa; solo en `fondos_pdf.py`). Filas regionales sin comuna.
- Fondart Regional/Nacional mezclan todas las áreas: se filtran por palabras clave escénicas.
- `duplicados.py` omite financiamiento por defecto (mismo festival, distintos años).
- No hacer llamadas repetidas a `escena-valparaiso.vercel.app` (activa checkpoint de seguridad).
- WebFetch resume páginas con un modelo pequeño: cuando una lista importa, pedir cita textual.

## Preguntas abiertas para el responsable del proyecto

- ¿Commitear el catastro por capas o al cierre de la Fase 1? (No se ha hecho ningún commit.)
- Datos de contacto de compañías (correos y celulares publicados en el catálogo oficial de
  títeres) quedaron registrados como contacto profesional público; confirmar si se conservan.

## Bitácora

- **2026-09-08 · ciclo 1**: scaffolding (`scripts/catastro/`, `catastro/`), importación de `data/`,
  capa 1 institucional, capa 5 fondos 2022–2026 completa, Ciudad Teatro 2025 y 2026, Ventolera
  2024, TM Viña, Teatro Pompeya; 9 duplicados fusionados; informes y exportaciones generados.
  Consultas: 11 hechas / 388 pendientes.
- **2026-09-08 · ciclo 2**: capa 9 en 24 comunas (primera ronda: las 14 sin registros, luego
  Quillota, Los Andes, San Felipe, Villa Alemana, Quilpué, Concón, Olmué, Limache, Viña,
  Valparaíso), carteleras municipales (Quillota, Viña, San Felipe, Los Andes, Cabildo), festivales
  (Litoral Teatral, Síntesis, FESTILAMBE, Teatro a Mil regional, Puntos de Fuga), OANI (sitio
  oficial). Lotes 0005–0011. Comunas sin registros bajan de 14 a 5. Error corregido: ocho consultas
  marcadas con ids equivocados fueron revertidas a pendiente.
