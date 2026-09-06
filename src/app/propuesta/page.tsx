import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo/metadata";
import { PrintButton } from "./PrintButton";
import styles from "./propuesta.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Propuesta de Difusión Digital 2027",
  description: "Propuesta de QUINTA ESCENA al Fondo de Artes Escénicas 2027, línea Difusión Digital: medio, plataforma web, mapa regional y Quinta Escena Podcast para las artes escénicas de la Región de Valparaíso.",
  path: "/propuesta",
  index: false,
});

const TOTAL_PAGES = 30;

function Page({ n, num, kicker, title, lead, children, className }: { n: number; num: string; kicker: string; title: ReactNode; lead?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <section className={`wrap ${styles.page} ${className ?? ""}`}>
      <span className={styles.pageNum}>{n} / {TOTAL_PAGES}</span>
      <div className={styles.pageKicker}>
        <span className={styles.pageBadge}>{num}</span>
        <p className="eyebrow">{kicker}</p>
      </div>
      <h2 className={styles.pageTitle}>{title}</h2>
      {lead && <p className={`lead ${styles.pageLead}`}>{lead}</p>}
      {children && <div className={styles.pageBody}>{children}</div>}
    </section>
  );
}

function Shot({ src, url, alt, caption }: { src: string; url: string; alt: string; caption?: string }) {
  return (
    <figure>
      <div className={styles.shotWrap}>
        <div className={styles.shotBar}>
          <span className={styles.shotDots}><span /><span /><span /></span>
          <span className={styles.shotUrl}>{url}</span>
        </div>
        {/* Captura real de la plataforma en producción, no una maqueta. */}
        <img src={src} alt={alt} />
      </div>
      {caption && <figcaption className={styles.shotCaption}>{caption}</figcaption>}
    </figure>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <div className={styles.placeholder}>
      <span className={styles.placeholderLabel}>Espacio para fotografía</span>
      <p className={styles.placeholderText}>{text}</p>
    </div>
  );
}

function Flow({ items }: { items: string[] }) {
  return (
    <ul className={styles.flow}>
      {items.map((it, i) => <li key={it}>{i > 0 ? "→ " : ""}{it}</li>)}
    </ul>
  );
}

export default function PropuestaPage() {
  return (
    <>
      <div className={styles.toolbar}>
        <div className={`wrap ${styles.toolbarInner}`}>
          <p className="eyebrow" style={{ margin: 0 }}>Documento de propuesta · Fondo de Artes Escénicas 2027</p>
          <PrintButton />
        </div>
      </div>

      {/* Portada */}
      <div className={styles.cover}>
        <div className="wrap">
          <p className={`eyebrow ${styles.coverEyebrow}`}>Fondo de Artes Escénicas · Línea Difusión Digital · Concurso 2027</p>
          <h1 className={styles.coverTitle}>Quinta Escena<br />Propuesta de Difusión Digital</h1>
          <p className={styles.coverSub}>de las artes escénicas de la Región de Valparaíso</p>
          <p className={styles.coverTag}>La escena está ahí. Vamos a buscarla.</p>
          <ul className={styles.coverMeta}>
            <li><span>Ámbito estratégico</span><b>1 · Contenidos Digitales y Fidelización de Públicos</b></li>
            <li><span>Responsable</span><b>Compañía de Teatro La Lancha SpA</b></li>
            <li><span>Territorio</span><b>Región de Valparaíso</b></li>
            <li><span>Documento</span><b>Propuesta · septiembre 2026</b></li>
          </ul>
        </div>
      </div>

      {/* Síntesis ejecutiva */}
      <Page n={2} num="—" kicker="Síntesis ejecutiva" title="Un sistema, no una plataforma suelta">
        <p>
          QUINTA ESCENA es un medio de difusión digital dedicado a las artes escénicas de la Región de Valparaíso. La propuesta articula un medio editorial, una plataforma web, un mapa regional y QUINTA ESCENA PODCAST, una producción audiovisual y sonora itinerante que recorre las siete provincias continentales durante la primera etapa, transformando historias territoriales de artistas, compañías y espacios en contenidos capaces de generar descubrimiento, conducir a una exploración digital y convertir esa curiosidad en nuevas posibilidades de encuentro.
        </p>
        <Flow items={["persona", "historia", "curiosidad", "territorio", "otros artistas", "mapa", "actividad", "participación", "retorno"]} />
        <table className={styles.table}>
          <thead><tr><th>Componente</th><th>Definición</th></tr></thead>
          <tbody>
            <tr><td>Objetivo</td><td>Ampliar y diversificar públicos, haciendo más visibles, descubribles y conectables las artes escénicas regionales.</td></tr>
            <tr><td>Motor principal</td><td>7 episodios de QUINTA ESCENA PODCAST + contenidos verticales, audio, perfiles y participación.</td></tr>
            <tr><td>Infraestructura</td><td>Sitio web + mapa regional + perfiles + sistema editorial y participativo.</td></tr>
            <tr><td>Disciplinas</td><td>Teatro, títeres, circo/clown y narración oral, con participación significativa durante el proyecto.</td></tr>
            <tr><td>Públicos</td><td>Principal: adultos 25–44 vinculados a decisiones culturales familiares. Descubrimiento: 15–29. Público sectorial: agentes escénicos.</td></tr>
            <tr><td>Accesibilidad</td><td>Subtítulos, interpretación profesional en LSCh, versiones sonoras y diseño web accesible.</td></tr>
            <tr><td>Duración</td><td>Hasta 12 meses; primera etapa territorial concentrada en las siete provincias continentales.</td></tr>
          </tbody>
        </table>
      </Page>

      {/* 1. Descripción de la propuesta */}
      <Page n={3} num="1" kicker="Descripción de la propuesta" title="Cuatro dimensiones que habitualmente aparecen separadas">
        <p>
          QUINTA ESCENA es un medio de difusión digital dedicado a las artes escénicas de la Región de Valparaíso. Su propósito es hacer visible, descubrible y conectable una actividad escénica que existe en todo el territorio regional, pero cuya información se encuentra dispersa entre redes sociales, organizaciones, instituciones, sitios web, publicaciones puntuales y circuitos profesionales.
        </p>
        <ul className={styles.list}>
          <li><b>Un medio digital</b>, que comunica y editorializa la actividad escénica.</li>
          <li><b>Una plataforma web</b>, que organiza información permanente sobre compañías, artistas, obras, temporadas, funciones, panoramas y espacios.</li>
          <li><b>Un mapa regional</b>, que permite visualizar territorialmente quiénes hacen artes escénicas y dónde ocurren.</li>
          <li><b>QUINTA ESCENA PODCAST</b>, una producción audiovisual y sonora itinerante que sale físicamente a buscar a los artistas y sus territorios.</li>
        </ul>
        <p>La plataforma no constituye el proyecto completo: es la infraestructura que permite que el descubrimiento producido por el medio tenga dónde continuar. El podcast tampoco es un producto aislado: es el principal mecanismo editorial y audiovisual de circulación durante la primera etapa.</p>
        <p className={styles.quote}>La búsqueda territorial produce historias; las historias producen contenidos; los contenidos producen descubrimiento; el descubrimiento conduce a QUINTA ESCENA; QUINTA ESCENA permite seguir descubriendo la escena regional.</p>
      </Page>

      {/* 2. El problema que aborda */}
      <Page n={4} num="2" kicker="El problema que aborda" title="Existe una escena regional, pero no una percepción compartida de ella" lead="La pregunta que origina QUINTA ESCENA es sencilla: ¿cómo puede una persona descubrir que en su propia región existe una escena escénica mucho mayor de la que conoce?">
        <p>
          La Región de Valparaíso es territorialmente extensa y culturalmente diversa: comprende el territorio continental desde la cordillera hasta el océano y también territorios insulares como Rapa Nui. Esta extensión produce distancias entre las comunidades culturales. La actividad escénica se desarrolla en múltiples provincias y comunas, pero gran parte de la producción, circulación y visibilidad se concentra en los principales centros urbanos.
        </p>
        <p>La dificultad no está exclusivamente en conseguir información. Está en encontrarla, comprenderla y sentir interés por ella.</p>
        <div className={styles.twoCol}>
          <div className={styles.step} style={{ background: "var(--gold)" }}>
            <span className={styles.stepTitle}>13,11%</span>
            <p className={styles.stepChannel}>Participación en obras de teatro, la menor de las actividades culturales medidas (Estrategia Quinquenal Regional de Cultura 2024–2029).</p>
          </div>
          <div className={styles.step} style={{ background: "var(--sky)" }}>
            <span className={styles.stepTitle}>375 espacios</span>
            <p className={styles.stepChannel}>De uso cultural en la región, el 28% del total nacional. La dificultad no se explica por falta de espacios o de actividad, sino por la brecha entre la oferta disponible y la capacidad de los públicos para descubrirla.</p>
          </div>
        </div>
      </Page>

      {/* 3. Dificultad: la información se reúne pero no circula */}
      <Page n={5} num="3" kicker="Una dificultad particular" title="La información se reúne, pero no necesariamente circula">
        <p>Existen organizaciones, redes, instituciones, municipalidades, centros culturales y agrupaciones que cumplen funciones importantes de articulación del sector. Pero muchas de estas redes tienen como principal usuario a la propia comunidad cultural: los artistas se comunican entre artistas; las compañías, entre compañías; las instituciones, con instituciones. La información circula dentro del ecosistema, pero no necesariamente consigue salir de él.</p>
        <p>A eso se suma la temporalidad de las redes sociales. Una publicación puede anunciar una función y desaparecer de la conversación después de algunos días. Una convocatoria puede quedar enterrada. Un artista puede tener una trayectoria extensa, pero no resultar fácilmente encontrable mediante una búsqueda cotidiana.</p>
        <p>Durante la preparación del proyecto, identificar agentes escénicos de distintas provincias requirió combinar búsquedas en internet, redes sociales, contactos personales y llamadas telefónicas. Incluso personas con larga trayectoria aparecieron fuera de los mecanismos habituales de búsqueda digital.</p>
        <p className={styles.quote}>Si para un equipo especializado resulta difícil encontrar la escena regional, para una persona que no pertenece al sector resulta aún más difícil. QUINTA ESCENA se propone reducir esa distancia.</p>
      </Page>

      {/* 3.1 Cuando la información existe pero queda quieta */}
      <Page n={6} num="3.1" kicker="Cuando la información existe" title="Pero queda quieta en un lugar" lead="El problema no es la ausencia total de herramientas, sino la forma en que la información se organiza, circula y llega —o no llega— a los públicos generales.">
        <p>La Región ya cuenta con distintos instrumentos digitales que reúnen información cultural: Chile Cultura (ex Elige Cultura) del Ministerio de las Culturas; a escala local, Valpocultura, la agenda del Teatro Municipal, Cartelera Teatral Valparaíso, telon.cl y Entretelones-Valpo; y catálogos especializados como el de compañías de teatro tradicional de títeres, de la Dirección Regional del Servicio Nacional del Patrimonio Cultural. Cada uno cumple una función concreta, pero ninguno construye por sí mismo una puerta de entrada territorial para descubrir la escena regional completa.</p>
        <p>En otras regiones se han desarrollado instrumentos similares: un catálogo en el Maule, un Catastro Regional del Activo Cultural en Antofagasta (diciembre de 2025), un catastro en Los Lagos y una cartografía en levantamiento en Los Ríos. Su orientación principal está vinculada a la gestión sectorial, la programación o el diseño de políticas públicas.</p>
        <p className={styles.quote}>La oportunidad de QUINTA ESCENA aparece en ese espacio intermedio: no sustituye agendas, catálogos ni ticketeras. La diferencia no está solamente en reunir información. Está en hacer que esa información quiera ser encontrada.</p>
      </Page>

      {/* 5. Evidencia digital */}
      <Page n={7} num="5" kicker="Evidencia digital que orienta la estrategia" title="El comportamiento real de las audiencias, no solo supuestos">
        <p>Durante julio de 2026, la cuenta @sebachamorro alcanzó aproximadamente 234.000 visualizaciones, con un 81% de personas no seguidoras. En una muestra de 16 publicaciones se registraron 550.955 visualizaciones acumuladas; los contenidos de territorio y oficio concentraron el 83% de las visualizaciones y el 96% de los compartidos. Una publicación colaborativa alcanzó 112.446 visualizaciones, 80.515 cuentas y 704 seguidores nuevos.</p>
        <p className={styles.quote}>Cuando una práctica escénica se presenta asociada a una persona, un territorio y una experiencia concreta, aumenta su capacidad de circular fuera de la comunidad cultural inmediata.</p>
        <p>Por eso la estrategia no se construye desde publicaciones informativas aisladas, sino desde: <b>persona + territorio + práctica + experiencia + relato.</b> El contenido vertical se produce específicamente para el lenguaje de cada plataforma, no como recorte de un video horizontal; la experiencia anterior muestra que el formato Reel es una fuente relevante de descubrimiento.</p>
      </Page>

      {/* 6. Quinta Escena: el medio */}
      <Page n={8} num="6" kicker="Quinta Escena: el medio" title="La escena de la Quinta Región" lead="La Región de Valparaíso fue conocida durante décadas como la Quinta Región. QUINTA ESCENA resignifica ese nombre y propone una segunda lectura: la escena también ocurre fuera del escenario convencional.">
        <Flow items={["en las calles", "en los parques", "en los territorios rurales", "en los espacios comunitarios", "en los talleres", "en los viajes", "en las plazas", "en internet"]} />
        <p>QUINTA ESCENA será, por tanto, un medio cultural regional, no un portal institucional. Su función será descubrir, seleccionar, producir, contextualizar, conectar y hacer circular información y contenidos relacionados con las artes escénicas.</p>
        <Shot src="/propuesta/screenshot-home.png" url="quinta-escena.vercel.app" alt="Portada de QUINTA ESCENA con el mapa regional y el buscador" caption="La portada del sitio en producción, septiembre de 2026." />
      </Page>

      {/* 7. La plataforma web */}
      <Page n={9} num="7" kicker="La plataforma web" title="El principal soporte de permanencia del medio" lead="Mientras las redes sociales están orientadas al descubrimiento y la circulación, el sitio web permite profundizar y continuar el vínculo.">
        <ul className={styles.list}>
          <li><b>Compañías:</b> agrupaciones y colectivos escénicos regionales.</li>
          <li><b>Artistas:</b> intérpretes, directores, dramaturgos, narradores, titiriteros, artistas circenses, músicos escénicos y otros oficios.</li>
          <li><b>Obras y proyectos, temporadas y funciones, panoramas y espacios.</b></li>
          <li><b>Editorial</b> y <b>QUINTA ESCENA PODCAST:</b> capítulos, cápsulas, audios y materiales derivados.</li>
          <li><b>Mapa regional:</b> representación territorial de compañías, artistas, espacios y actividades.</li>
        </ul>
        <p>La plataforma no reemplaza los canales propios de los artistas: deriva tráfico hacia ellos. Cada perfil enlaza a redes sociales, sitios web y canales propios de sus protagonistas. La función del medio es facilitar el encuentro.</p>
        <Shot src="/propuesta/screenshot-companias.png" url="quinta-escena.vercel.app/companias" alt="Directorio de compañías de teatro y artes escénicas" caption="Compañías y agrupaciones, filtrables por comuna." />
      </Page>

      {/* 8. El mapa */}
      <Page n={10} num="8" kicker="El mapa" title="Hacer visible la región como escena" lead="No solamente permite ubicar geográficamente a un artista: construye una representación distinta del territorio.">
        <Shot src="/propuesta/screenshot-mapa.png" url="quinta-escena.vercel.app/mapa" alt="Mapa regional con las ocho provincias y capas de registros" caption="Mapa de las ocho provincias, geometría oficial, sin coordenadas inventadas." />
        <p>Una persona podrá mirar la Región de Valparaíso y descubrir quiénes hacen artes escénicas, dónde están, qué hacen, qué obras desarrollan, qué espacios existen y qué actividades ocurren. El mapa se alimenta inicialmente por los agentes encontrados durante la ejecución del proyecto y crece mediante participación y revisión editorial: los artistas y organizaciones pueden proponer información sobre sí mismos o sobre terceros, el equipo realiza búsqueda activa en fuentes públicas, y toda información se revisa antes de incorporarse.</p>
      </Page>

      {/* 9-10. Quinta Escena Podcast / No es un podcast de entrevistas */}
      <Page n={11} num="9–10" kicker="Quinta Escena Podcast" title="No es un podcast de entrevistas" lead="No se busca instalar una mesa, dos micrófonos y conversar frente a una cámara. El programa es una puesta en escena itinerante.">
        <p>Su conductor será un artista escénico capaz de combinar actuación, música, humor, movimiento y creación digital. El viaje se realiza a bordo de <b>Molière</b>, la camioneta de teatro itinerante de La Lancha, que funciona simultáneamente como vehículo, set móvil, objeto dramatúrgico, identidad visual y espacio de memoria.</p>
        <p>El artista invitado se encuentra con el conductor en espacios abiertos de su territorio: se camina, se conversa, se realizan acciones, se toca música, se conocen objetos, se visitan lugares. Se habla de los proyectos y la trayectoria del invitado, pero también de cómo se construye la escena en ese territorio. La primera etapa considera las siete provincias continentales: Los Andes, San Felipe de Aconcagua, Petorca, Quillota, Marga Marga, Valparaíso y San Antonio. Rapa Nui queda planteada como una futura ampliación.</p>
        <Placeholder text="Molière, el furgón amarillo de teatro itinerante, estacionado en un territorio de la región, con el juglar y el artista o compañía protagonista junto al vehículo abierto." />
      </Page>

      {/* 11-12. La intemperie / La Posta */}
      <Page n={12} num="11–12" kicker="La intemperie y La Posta" title="El territorio también es materia escénica" lead="La grabación al aire libre no responde solo a una necesidad de producción: es parte del concepto.">
        <p>El programa se desarrolla en parques, plazas, cerros, bordes costeros, caminos, paisajes rurales y otros espacios significativos. El artista no aparece separado de su territorio: el territorio es parte de su retrato. Así, el medio presenta simultáneamente quién hace la escena, dónde se hace, qué propone y qué significa hacerlo allí.</p>
        <p>Cada encuentro deja un objeto en Molière destinado al próximo participante —una marioneta, un instrumento, un elemento de vestuario, una fotografía, un objeto de trabajo— junto a un mensaje. <b>La Posta</b> cumple tres funciones: dramaturgia (conecta los capítulos en una sola historia), fidelización (genera expectativa por lo que llegará al próximo territorio) y vinculación (pone en relación directa a artistas que quizás no tenían contacto previo).</p>
        <Placeholder text="El juglar y el artista protagonista conversando en un espacio abierto de su territorio —una plaza, un cerro, una playa— y, junto a ellos, el objeto que quedará entregado en La Posta." />
      </Page>

      {/* 13. Siete territorios */}
      <Page n={13} num="13" kicker="Siete territorios, siete puertas de entrada" title="Sin pretender representar toda la escena regional" lead="Ese sería un objetivo imposible. Los siete encuentros funcionan como puertas de entrada.">
        <Flow items={["una persona", "una disciplina", "una práctica", "un territorio", "una comunidad", "una problemática", "una forma de hacer escena"]} />
        <p>La selección inicial contempla teatro, títeres, circo/clown y narración oral, cumpliendo la exigencia de la convocatoria de al menos dos disciplinas. La selección concreta de participantes se revisa y ratifica antes de la postulación definitiva, especialmente respecto de cartas de compromiso y disponibilidad.</p>
        <Shot src="/propuesta/screenshot-podcast.png" url="quinta-escena.vercel.app/quinta-escena-podcast" alt="Portada de la serie con la ruta de los siete episodios" caption="La ruta de la temporada 1, de la cordillera al mar." />
      </Page>

      {/* 14. Los públicos */}
      <Page n={14} num="14" kicker="Los públicos" title="Tres públicos, tres lenguajes">
        <div className={styles.stepGrid}>
          <div className={styles.step}>
            <span className={styles.stepTitle}>25–44 años</span>
            <p className={styles.stepChannel}>Público principal, con niñas, niños y adolescentes a cargo. Se les habla desde historias, humor, personajes, territorios, música, curiosidades y experiencias, no desde el lenguaje institucional del teatro.</p>
          </div>
          <div className={styles.step} style={{ background: "var(--lime)" }}>
            <span className={styles.stepTitle}>15–29 años</span>
            <p className={styles.stepChannel}>Público de descubrimiento. Recibe contenidos verticales, breves y dinámicos. El primer objetivo no es convertirlo en espectador teatral: es despertar curiosidad.</p>
          </div>
          <div className={styles.step} style={{ background: "var(--sky)" }}>
            <span className={styles.stepTitle}>Sectorial</span>
            <p className={styles.stepChannel}>Artistas, compañías, productores, programadores, gestores, docentes y espacios usan QUINTA ESCENA como herramienta de consulta, encuentro y visibilidad.</p>
          </div>
        </div>
        <p>La accesibilidad se integra desde la producción, no se añade después: subtítulos, interpretación en lengua de señas, versiones sonoras y un diseño web accesible.</p>
      </Page>

      {/* 15. Arquitectura digital del recorrido */}
      <Page n={15} num="15" kicker="Arquitectura digital del recorrido" title="Cinco movimientos" lead="Este recorrido evita que la estrategia mida el éxito únicamente en seguidores. La pregunta será: ¿qué hizo el público después de descubrirnos?">
        <div className={styles.stepGrid}>
          <div className={styles.step}><span className={styles.stepTitle}>Descubrir</span><p className={styles.stepChannel}>Una cápsula, una acción, una música, un objeto o un paisaje · Instagram / TikTok</p></div>
          <div className={styles.step} style={{ background: "var(--gold)" }}><span className={styles.stepTitle}>Conocer</span><p className={styles.stepChannel}>Quién es ese artista y qué hace · YouTube / podcast / audio</p></div>
          <div className={styles.step} style={{ background: "var(--sky)" }}><span className={styles.stepTitle}>Profundizar</span><p className={styles.stepChannel}>La historia, el territorio, la práctica y los proyectos · QUINTA ESCENA</p></div>
          <div className={styles.step} style={{ background: "var(--lime)" }}><span className={styles.stepTitle}>Encontrar</span><p className={styles.stepChannel}>Otros artistas, compañías, espacios, obras y actividades · Mapa / perfiles / agenda</p></div>
          <div className={styles.step} style={{ background: "var(--violet)", color: "#fff" }}><span className={styles.stepTitle}>Participar</span><p className={styles.stepChannel}>Recomendar, proponer, compartir, incorporarse · Sitio web / redes</p></div>
        </div>
      </Page>

      {/* 16-17. Participación / búsqueda activa */}
      <Page n={16} num="16–17" kicker="Participación y búsqueda activa" title="La ciudadanía como fuente de descubrimiento, no de publicación automática">
        <Flow items={["¿A quién deberíamos conocer en tu provincia?", "¿Qué compañía falta en nuestro mapa?", "¿Qué actividad está ocurriendo cerca de ti?"]} />
        <p>La plataforma no publica automáticamente las respuestas: alimentan un proceso editorial. El equipo revisa existencia del agente, actividad comprobable, vinculación territorial, información básica, contacto y pertinencia dentro de las disciplinas del proyecto.</p>
        <p>El equipo también desarrolla <b>búsqueda activa</b>: revisión de sitios web, redes sociales, información pública, programas y publicaciones culturales, y contacto directo con artistas, compañías, espacios, municipios y organizaciones. El proyecto no funciona como un archivo de investigación histórica —las bases excluyen ese objetivo—; la búsqueda tiene una finalidad práctica: hacer posible la difusión y el descubrimiento de la actividad escénica regional.</p>
      </Page>

      {/* 18. Plan de contenidos */}
      <Page n={17} num="18" kicker="Plan de contenidos" title="Cada jornada territorial produce múltiples piezas">
        <table className={styles.table}>
          <thead><tr><th>Pieza</th><th>Descripción</th></tr></thead>
          <tbody>
            <tr><td>7 episodios</td><td>QUINTA ESCENA PODCAST, ~20–30 minutos cada uno.</td></tr>
            <tr><td>7 cápsulas de objeto</td><td>La historia de un objeto significativo del artista.</td></tr>
            <tr><td>7 cápsulas de territorio</td><td>Una historia, caminata o situación vinculada al lugar.</td></tr>
            <tr><td>7 cápsulas de La Posta</td><td>El objeto y mensaje que viajan al siguiente participante.</td></tr>
            <tr><td>7 cápsulas de acción</td><td>Situaciones breves que muestran la práctica escénica de forma lúdica.</td></tr>
            <tr><td>7 versiones sonoras</td><td>Adaptadas para plataformas de audio.</td></tr>
            <tr><td>7 perfiles iniciales</td><td>Cada artista queda conectado con su territorio y sus propios canales.</td></tr>
            <tr><td>3 ciclos de convocatoria</td><td>Destinados a ampliar la identificación de agentes y actividades.</td></tr>
          </tbody>
        </table>
      </Page>

      {/* 19. Redes sociales */}
      <Page n={18} num="19" kicker="Redes sociales" title="Un canal, una función">
        <div className={styles.stepGrid}>
          <div className={styles.step}><span className={styles.stepTitle}>Instagram</span><p className={styles.stepChannel}>Identidad y comunidad: descubrimiento, cápsulas, Reels, historias, encuestas, colaboraciones y participación.</p></div>
          <div className={styles.step} style={{ background: "var(--ink)", color: "var(--paper)" }}><span className={styles.stepTitle}>TikTok</span><p className={styles.stepChannel}>Descubrimiento: humor, acciones, objetos, música, paisaje, situaciones inesperadas, desafíos.</p></div>
          <div className={styles.step} style={{ background: "var(--gold)" }}><span className={styles.stepTitle}>YouTube</span><p className={styles.stepChannel}>Profundización y permanencia: aquí viven los episodios completos.</p></div>
          <div className={styles.step} style={{ background: "var(--sky)" }}><span className={styles.stepTitle}>Audio</span><p className={styles.stepChannel}>Accesibilidad y permanencia: escuchar la serie sin necesidad de mirar una pantalla.</p></div>
          <div className={styles.step} style={{ background: "var(--lime)" }}><span className={styles.stepTitle}>Sitio web</span><p className={styles.stepChannel}>Principal espacio de organización, permanencia y conexión.</p></div>
        </div>
      </Page>

      {/* 20-21. Publicación colaborativa / enfoque comunicacional */}
      <Page n={19} num="20–21" kicker="Publicación colaborativa y enfoque comunicacional" title="Cada artista llega acompañado por su propia comunidad">
        <p>La experiencia anterior muestra que la colaboración entre cuentas amplía significativamente el alcance: una pieza colaborativa entre tres cuentas registró 112.446 visualizaciones, 80.515 cuentas alcanzadas y 704 seguidores nuevos. Las publicaciones colaborativas no son una acción excepcional: son parte de la arquitectura. La combinación activa simultáneamente la comunidad del artista, la comunidad del medio y la audiencia de descubrimiento.</p>
        <p>El proyecto evita el lenguaje institucional tradicional —"actividad cultural", "oferta artística", "sector escénico", "programación regional"— y se construye desde acciones y preguntas:</p>
        <Flow items={["¿Qué hace este artista?", "¿Qué hay dentro de Molière?", "¿Qué objeto le dejaron al próximo artista?", "¿Quién está haciendo escena al otro lado de la región?"]} />
      </Page>

      {/* 22-23. Identidad narrativa / la temporada como viaje */}
      <Page n={20} num="22–23" kicker="Identidad narrativa" title="Un juglar que sale a buscar una escena que sabe que existe" lead="El conductor no se presenta como una autoridad que explica desde fuera. Es alguien que pregunta, prueba, escucha, se sorprende, aprende, toca, juega, se equivoca y conoce. La audiencia aprende junto a él.">
        <p>Cada provincia tiene un capítulo; cada capítulo conduce al siguiente. La temporada se estructura como un viaje: <b>salida</b> (Molière parte), <b>encuentro</b> (el juglar conoce al artista), <b>territorio</b> (la conversación se desplaza al espacio abierto), <b>descubrimiento</b> (el público conoce su práctica), <b>objeto</b> (algo entra a Molière), <b>mensaje</b> (algo queda destinado al siguiente artista) y <b>continuidad</b> (la camioneta vuelve a partir). El último momento de un capítulo se transforma en la primera imagen del próximo.</p>
      </Page>

      {/* 24-25. Resultado digital / teoría de cambio */}
      <Page n={21} num="24–25" kicker="Resultado digital perseguido y teoría de cambio" title="Una nueva puerta de entrada, no siete videos">
        <p>Los siete episodios son el motor inicial; la plataforma, la infraestructura; el mapa, la visualización territorial; la comunidad, el mecanismo de crecimiento; las redes, el mecanismo de descubrimiento; la participación, el mecanismo de ampliación; la búsqueda activa, el mecanismo de incorporación; y la accesibilidad, una condición transversal.</p>
        <p>QUINTA ESCENA parte de cinco observaciones: existe actividad escénica; está territorialmente dispersa; la información está digitalmente fragmentada; los públicos nuevos no necesariamente la buscan; y los contenidos vinculados con personas, prácticas y territorios circulan fuera del circuito cultural habitual.</p>
        <Flow items={["territorio", "encuentro", "relato", "contenido", "descubrimiento", "web", "exploración", "participación", "vínculo"]} />
      </Page>

      {/* 26. Indicadores */}
      <Page n={22} num="26" kicker="Indicadores" title="Producción, alcance, profundización, conversión, participación y accesibilidad">
        <table className={styles.table}>
          <thead><tr><th>Dimensión</th><th>Indicadores</th></tr></thead>
          <tbody>
            <tr><td>Producción</td><td>7 episodios · mínimo 21 verticales · 7 versiones sonoras · 7 perfiles · 3 ciclos de participación · mapa regional operativo.</td></tr>
            <tr><td>Alcance</td><td>Visualizaciones, cuentas alcanzadas, % de no seguidoras, compartidos, guardados, seguidores nuevos.</td></tr>
            <tr><td>Profundización</td><td>Tiempo de reproducción, retención, reproducciones completas, escucha de versiones sonoras.</td></tr>
            <tr><td>Conversión hacia el ecosistema</td><td>Visitas al sitio y a perfiles, clics hacia canales propios de artistas, consultas del mapa.</td></tr>
            <tr><td>Participación</td><td>Preguntas recibidas, recomendaciones de artistas, actividades propuestas, nuevos registros verificados.</td></tr>
            <tr><td>Accesibilidad</td><td>% de contenidos subtitulados, capítulos con LSCh, versiones sonoras disponibles, cumplimiento de criterios web.</td></tr>
          </tbody>
        </table>
        <p className="small muted">La convocatoria valora explícitamente la ampliación y diversificación de audiencias, los componentes interactivos y participativos, y la sostenibilidad de las plataformas y vínculos con los públicos.</p>
      </Page>

      {/* 27-28. Equipo / tecnología */}
      <Page n={23} num="27–28" kicker="Equipo y tecnología" title="La capacidad de producción ya existe">
        <ul className={styles.list}>
          <li><b>Dirección y conducción:</b> artista escénico con experiencia en actuación, música, dirección y creación de contenidos.</li>
          <li><b>Realización audiovisual, fotografía y cámara, sonido:</b> equipo profesional con experiencia cinematográfica y documental.</li>
          <li><b>Producción:</b> coordinación territorial, rutas, participantes y logística.</li>
          <li><b>Edición y postproducción, desarrollo digital, accesibilidad.</b></li>
        </ul>
        <p>El proyecto cuenta además con Molière, la camioneta de teatro itinerante de La Lancha, como infraestructura móvil para producción, transporte e identidad. El equipamiento audiovisual y sonoro permite grabar simultáneamente imagen cinematográfica, registro documental, audio profesional y piezas verticales: una sola jornada territorial produce episodio + cápsulas + audio + fotografías + participación + ficha + material para redes.</p>
        <Placeholder text="El equipo de producción y el equipamiento audiovisual y sonoro utilizado en un registro en terreno." />
      </Page>

      {/* 29-30. Accesibilidad / sostenibilidad */}
      <Page n={24} num="29–30" kicker="Accesibilidad y sostenibilidad" title="Lo que permanece después de la primera temporada">
        <p>La accesibilidad es un componente estructural, no una exigencia técnica añadida al final: subtítulos, interpretación profesional en lengua de señas, versiones sonoras, diseño web responsive y accesible, organización clara de la información y acceso libre a los contenidos. La propuesta contempla 100% de subtitulado y LSCh en los siete capítulos.</p>
        <p>Quedan instalados el medio digital, el dominio y sitio web, el mapa, los perfiles, los episodios, los contenidos derivados, la comunidad, la base editorial, los procedimientos de incorporación y verificación, y la red inicial de agentes. La primera temporada no es el final del proyecto: es la instalación de una infraestructura editorial desde la cual pueden desarrollarse nuevas temporadas y recorridos.</p>
        <p className={styles.quote}>La sostenibilidad no consiste solamente en mantener un sitio técnicamente activo. Consiste en que el sitio siga teniendo una razón para existir.</p>
      </Page>

      {/* 31-32. Proyección territorial / encaje con la convocatoria */}
      <Page n={25} num="31–32" kicker="Proyección territorial y encaje con la convocatoria" title="Rapa Nui, y un ámbito estratégico específico">
        <p>La primera etapa recorre el territorio continental, pero el concepto de QUINTA ESCENA no termina en esas siete provincias: la Región de Valparaíso comprende también Rapa Nui. Su incorporación futura es una posibilidad de expansión, no una obligación de la primera etapa, lo que permite que la primera temporada sea operacionalmente realista sin reducir la identidad regional del proyecto.</p>
        <p>La propuesta se ubica deliberadamente en el <b>Ámbito Estratégico 1: Contenidos Digitales y Fidelización de Públicos.</b> QUINTA ESCENA no se limita a crear una página web, no es una plataforma de venta de entradas, no es un proyecto de archivo ni de investigación, y no consiste en crear un montaje escénico: la plataforma es parte de una estrategia editorial y de difusión, el podcast es una herramienta de circulación, las redes son mecanismos de descubrimiento, el mapa convierte ese descubrimiento en posibilidad de encontrar, y la participación permite ampliar la red.</p>
      </Page>

      {/* 33. Por qué el proyecto es de difusión */}
      <Page n={26} num="33" kicker="Por qué el proyecto es de difusión" title="No producimos contenidos para llenar una plataforma">
        <p className={styles.quote}>Construimos un medio que produce contenidos para que la escena pueda encontrarse.</p>
        <p>El proyecto no persigue como fin principal registrar artistas: persigue que esos artistas sean descubribles. No persigue solamente construir un mapa: persigue que alguien quiera mirar ese mapa. No persigue solamente realizar un podcast: persigue que el podcast lleve personas hacia una escena que desconocían.</p>
        <Flow items={["indiferencia", "descubrimiento", "curiosidad", "conocimiento", "participación", "vínculo"]} />
      </Page>

      {/* 34. Cronograma */}
      <Page n={27} num="34" kicker="Cronograma propuesto" title="Doce meses, entre marzo y abril de 2027" lead="La convocatoria permite proyectos de hasta 12 meses y exige iniciar entre el 1 de marzo y el 30 de abril de 2027.">
        <table className={styles.table}>
          <thead><tr><th>Meses</th><th>Etapa</th></tr></thead>
          <tbody>
            <tr><td>1–2</td><td>Diseño editorial y territorial: identidad, arquitectura del medio, diseño web, criterios editoriales, selección de participantes, diseño de rutas y de accesibilidad.</td></tr>
            <tr><td>2–3</td><td>Instalación digital: construcción del sitio y el mapa, carga de perfiles iniciales, sistemas gráficos, canales digitales.</td></tr>
            <tr><td>3–7</td><td>Recorrido territorial: siete jornadas, una provincia por recorrido; grabación, registro vertical y sonoro, fotografía, participación, La Posta.</td></tr>
            <tr><td>4–9</td><td>Postproducción: montaje, edición, diseño sonoro, música, color, subtitulado, LSCh, versiones verticales y de audio.</td></tr>
            <tr><td>6–11</td><td>Publicación: campaña seriada, estrenos, publicaciones colaborativas, cápsulas, historias, participación, actualización del mapa.</td></tr>
            <tr><td>6–12</td><td>Ampliación del ecosistema: convocatorias, incorporación de nuevos agentes, verificación, actualización de perfiles, métricas.</td></tr>
            <tr><td>11–12</td><td>Continuidad: evaluación, análisis de audiencias, organización de contenidos, traspaso y mantenimiento, proyección futura.</td></tr>
          </tbody>
        </table>
      </Page>

      {/* 35. Productos, resultados e impacto */}
      <Page n={28} num="35" kicker="Productos, resultados e impacto" title="De la indiferencia al vínculo">
        <div className={styles.twoCol}>
          <div>
            <h3>Productos</h3>
            <ul className={styles.list}>
              <li>7 episodios de QUINTA ESCENA PODCAST</li>
              <li>21 o más contenidos verticales derivados</li>
              <li>7 versiones sonoras · 7 perfiles iniciales</li>
              <li>Mapa regional y sistema de participación</li>
              <li>Sistema editorial de incorporación y verificación</li>
              <li>Contenido accesible</li>
            </ul>
          </div>
          <div>
            <h3>Resultados</h3>
            <ul className={styles.list}>
              <li>Mayor visibilidad de artistas de las provincias</li>
              <li>Mayor circulación fuera de la comunidad cultural habitual</li>
              <li>Mayor descubrimiento de actividades regionales</li>
              <li>Nueva relación entre artistas y públicos</li>
              <li>Incorporación progresiva de nuevos agentes</li>
              <li>Instalación de un medio digital especializado</li>
            </ul>
          </div>
        </div>
        <p className={styles.quote}>El impacto esperado es que las artes escénicas de la Región de Valparaíso sean más visibles, más descubribles y más conectables para públicos que hoy no necesariamente participan del circuito.</p>
      </Page>

      {/* 36-37. Idea central / cierre conceptual */}
      <Page n={29} num="36–37" kicker="Idea central y cierre conceptual" title="La escena ya existe. No necesitamos inventarla." className={styles.closing}>
        <p>Necesitamos hacer posible que las personas puedan encontrarla. Hay una actriz trabajando en un lugar que alguien desconoce. Hay una compañía ensayando a pocos kilómetros de una familia que nunca ha oído hablar de ella. Hay un artista circense desarrollando una trayectoria en una provincia que rara vez aparece en las conversaciones centrales de la escena. Hay un festival, una obra, un taller, una compañía, un espacio, una historia. Todo eso existe. El problema es que muchas veces no logra encontrarse.</p>
        <p>La primera temporada será una expedición. Un actor, músico, acróbata y creador de contenidos partirá en Molière, recorrerá las provincias continentales, preguntará, conocerá, jugará, escuchará, compartirá y encontrará artistas. Cada encuentro dejará una historia; cada historia producirá contenido; cada contenido llevará hacia una nueva puerta. Y detrás de esa puerta aparecerá algo mucho mayor: una región escénica.</p>
        <p className={styles.quote}>QUINTA ESCENA reúne, descubre y difunde las artes escénicas de la Región de Valparaíso. QUINTA ESCENA PODCAST sale a buscarlas. La escena está ahí. Vamos a buscarla.</p>
      </Page>

      {/* Matriz de respuesta a la convocatoria */}
      <Page n={30} num="Anexo" kicker="Cierre de la postulación" title="Matriz de respuesta a la convocatoria">
        <table className={styles.table}>
          <thead><tr><th>Elemento exigido</th><th>Respuesta de QUINTA ESCENA</th></tr></thead>
          <tbody>
            <tr><td>Descripción</td><td>Medio digital + plataforma web + mapa + podcast itinerante como sistema integrado.</td></tr>
            <tr><td>Disciplinas</td><td>Teatro, títeres, circo/clown y narración oral.</td></tr>
            <tr><td>Públicos y justificación</td><td>Público principal 25–44; descubrimiento 15–29; ecosistema profesional secundario; accesibilidad transversal.</td></tr>
            <tr><td>Canales</td><td>Instagram, TikTok, YouTube, audio y sitio web; publicaciones colaborativas.</td></tr>
            <tr><td>Enfoque comunicacional</td><td>Narrativa territorial, humor, preguntas, personajes, objetos, viaje y experiencia.</td></tr>
            <tr><td>Participación y alianzas</td><td>Propuestas ciudadanas, colaboración con artistas y organizaciones, búsqueda activa y verificación editorial.</td></tr>
            <tr><td>Hitos</td><td>Diseño, instalación digital, 7 recorridos, postproducción, publicación seriada, ampliación del ecosistema y evaluación.</td></tr>
            <tr><td>Acciones y contenidos</td><td>7 episodios, 21+ verticales, 7 audios, 7 perfiles, 3 ciclos de participación, mapa regional.</td></tr>
            <tr><td>Tecnología</td><td>Producción simultánea horizontal/vertical/audio; web, mapa y herramientas de IA con validación editorial.</td></tr>
            <tr><td>Accesibilidad</td><td>100% de contenidos principales subtitulados; LSCh en los 7 capítulos; versiones sonoras y web accesible.</td></tr>
          </tbody>
        </table>
      </Page>
    </>
  );
}
