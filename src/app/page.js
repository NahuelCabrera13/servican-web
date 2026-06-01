import Image from "next/image";
import HeaderAcceso from "./components/HeaderAcceso";
import NoticiasInicio from "./components/NoticiasInicio";
import NoticiasFlotantes from "./components/NoticiasFlotantes";

export default function Home() {
  const whatsapp = "59898188257";

  const linkWhatsApp = (mensaje) =>
    `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensaje)}`;

  const fotoPortada = "/fotos/portada-servican.jpeg";

  const notaElPaisUrl =
    "https://www.elpais.com.uy/informacion/policiales/droga-explosivos-y-desaparecidos-como-es-el-entrenamiento-de-los-perros-policia-que-son-un-companero-mas";

  const metodologia = [
    {
      titulo: "Entrenamiento por asociación",
      texto: "El trabajo olfativo se desarrolla de forma progresiva, asociando olores específicos con una recompensa y una conducta clara de marcación.",
      icono: "🧠",
    },
    {
      titulo: "Kits de olores",
      texto: "SERVICAN trabaja con kits de olores para entrenar perros de detección de forma técnica, controlada y segura.",
      icono: "🧪",
    },
    {
      titulo: "Binomio guía-perro",
      texto: "La base del trabajo está en la comunicación entre el guía y el perro: lectura corporal, control, confianza y respuesta ante indicaciones.",
      icono: "🤝",
    },
    {
      titulo: "Práctica en entornos reales",
      texto: "Los perros trabajan en escenarios variados para acostumbrarse a diferentes superficies, estímulos, olores y contextos de búsqueda.",
      icono: "📍",
    },
  ];

  const servicios = [
    {
      titulo: "Formación canina",
      texto: "Capacitación para guías, propietarios e interesados en el trabajo responsable con perros.",
      icono: "🎓",
    },
    {
      titulo: "Adiestramiento y manejo",
      texto: "Trabajo orientado al vínculo, obediencia, control, comunicación y bienestar animal.",
      icono: "🐕",
    },
    {
      titulo: "Especialización K9",
      texto: "Preparación técnica para avanzar hacia áreas profesionales del trabajo canino.",
      icono: "🛡️",
    },
    {
      titulo: "Asesoramiento",
      texto: "Orientación para personas, equipos o instituciones que buscan mejorar su trabajo con perros.",
      icono: "📋",
    },
  ];

  const perros = [
    {
      nombre: "Apolo",
      imagen: "/fotos/apolo-pastor-aleman-cachorro.webp",
      datos: "3 meses · 6 kg · Macho · Pastor alemán",
      especialidad: "En formación",
      texto: "Cachorro pastor alemán en etapa inicial de formación. Trabaja sus primeras bases de vínculo, socialización y aprendizaje dentro del equipo SERVICAN.",
    },
    {
      nombre: "Bruno",
      imagen: "/fotos/bruno-labrador-deteccion.webp",
      datos: "4 años · 27 kg · Macho · Labrador retriever",
      especialidad: "Detección de droga",
      texto: "Labrador retriever preparado para tareas de detección, con trabajo orientado a concentración, búsqueda, obediencia y respuesta guiada.",
    },
    {
      nombre: "Salime",
      imagen: "/fotos/salime-labrador-deteccion.webp",
      datos: "3 años y medio · 29 kg · Macho · Labrador retriever",
      especialidad: "Detección de droga",
      texto: "Perro de trabajo con perfil activo y enfocado, orientado a detección de droga y desarrollo del binomio guía-perro.",
    },
    {
      nombre: "Ken",
      imagen: "/fotos/ken-malinois-deteccion.webp",
      datos: "7 años · 33 kg · Macho · Pastor belga malinois",
      especialidad: "Detección de droga",
      texto: "Pastor belga malinois con experiencia y presencia operativa, enfocado en tareas de detección y trabajo controlado.",
    },
    {
      nombre: "Graf",
      imagen: "/fotos/graf-malinois-deteccion.webp",
      datos: "2 años · 30 kg · Macho · Pastor belga malinois",
      especialidad: "Detección de droga",
      texto: "Ejemplar joven de pastor belga malinois, con entrenamiento orientado a obediencia, búsqueda, control y detección.",
    },
    {
      nombre: "Mara",
      imagen: "/fotos/mara-malinois-deteccion.webp",
      datos: "2 años · 30 kg · Hembra · Pastor belga malinois",
      especialidad: "Detección de droga",
      texto: "Pastora belga malinois en trabajo de detección, con desarrollo físico, técnico y conductual dentro del equipo SERVICAN.",
    },
  ];

  const galeria = [
    {
      imagen: "/fotos/galeria-deteccion-bodega-labrador-1.webp",
      titulo: "Trabajo de detección",
      texto: "Ejercicio de búsqueda en zona de carga y pallets.",
    },
    {
      imagen: "/fotos/galeria-deteccion-bodega-labrador-2.webp",
      titulo: "Marcación controlada",
      texto: "Perro guiado durante práctica de detección en bodega.",
    },
    {
      imagen: "/fotos/galeria-deteccion-bodega-malinois-1.webp",
      titulo: "Búsqueda en estanterías",
      texto: "Trabajo técnico en ambiente industrial.",
    },
    {
      imagen: "/fotos/galeria-deteccion-bodega-malinois-2.webp",
      titulo: "Detección operativa",
      texto: "Ejercicio con guía en zona de depósito.",
    },
    {
      imagen: "/fotos/galeria-deteccion-bodega-malinois-3.webp",
      titulo: "Indicación de olor",
      texto: "Perro trabajando sobre punto de interés.",
    },
    {
      imagen: "/fotos/galeria-deteccion-bodega-labrador-3.webp",
      titulo: "Trabajo sobre carga",
      texto: "Búsqueda en mercadería y pallets.",
    },
    {
      imagen: "/fotos/galeria-deteccion-exterior-labrador.webp",
      titulo: "Práctica exterior",
      texto: "Ejercicio de detección en espacio abierto.",
    },
    {
      imagen: "/fotos/galeria-entrenamiento-control-malinois.webp",
      titulo: "Control y manejo",
      texto: "Entrenamiento de obediencia y control con guía.",
    },
    {
      imagen: "/fotos/galeria-trabajo-operativo-labrador.webp",
      titulo: "Equipo SERVICAN",
      texto: "Perro equipado durante jornada de trabajo.",
    },
    {
      imagen: "/fotos/galeria-deteccion-industrial-labrador.webp",
      titulo: "Entorno industrial",
      texto: "Búsqueda guiada en zona de trabajo real.",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <NoticiasFlotantes />
      <header className="sticky top-0 z-50 border-b border-yellow-500/20 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <a href="#inicio" className="flex shrink-0 items-center gap-3">
            <Image
              src="/logo-servican.jpeg"
              alt="Logo SERVICAN"
              width={56}
              height={56}
              priority
              className="h-14 w-14 rounded-full object-contain"
            />

            <div>
              <p className="text-xl font-black tracking-[0.25em] text-yellow-500">
                SERVICAN
              </p>
              <p className="text-xs text-zinc-400">
                Nuestro olfato nos define
              </p>
            </div>
          </a>

          <nav className="hidden gap-6 text-sm font-semibold text-zinc-300 lg:flex">
  <a href="#inicio" className="hover:text-yellow-500">
    Inicio
  </a>

  <a href="/cursos" className="hover:text-yellow-500">
    Cursos
  </a>

  <a href="/noticias" className="hover:text-yellow-500">
    Noticias
  </a>

  <a href="#servicios" className="hover:text-yellow-500">
    Servicios
  </a>

  <a href="#contacto" className="hover:text-yellow-500">
    Contacto
  </a>
</nav>

          <HeaderAcceso />
        </div>
      </header>

      <section
        id="inicio"
        className="relative min-h-[86vh] overflow-hidden bg-black"
      >
        <Image
          src={fotoPortada}
          alt="Perros del equipo SERVICAN"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[38%_center]"
        />

        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-black/45 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-black/80 via-black/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />

        <div className="relative mx-auto flex min-h-[86vh] max-w-[1600px] items-center justify-end px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full max-w-2xl rounded-[2rem] border border-yellow-500/25 bg-black/55 p-6 shadow-2xl backdrop-blur-md sm:p-8 md:p-10 lg:mr-8">
            <div className="mb-6 inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-400">
                Formación y trabajo canino
              </p>
            </div>

            <h1 className="text-5xl font-black leading-none tracking-tight md:text-7xl lg:text-8xl">
              SERVICAN
            </h1>

            <p className="mt-5 text-2xl font-black text-yellow-500 md:text-3xl">
              Nuestro olfato nos define
            </p>

            <p className="mt-6 max-w-xl text-base leading-8 text-zinc-100 md:text-lg">
              Formación, entrenamiento y trabajo canino profesional en Uruguay.
              Desarrollamos el vínculo guía-perro con disciplina, respeto,
              estructura y una visión seria del mundo canino.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-2xl font-black text-yellow-500">K9</p>
                <p className="mt-1 text-xs text-zinc-300">Formación</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-2xl font-black text-yellow-500">UY</p>
                <p className="mt-1 text-xs text-zinc-300">Uruguay</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-2xl font-black text-yellow-500">PRO</p>
                <p className="mt-1 text-xs text-zinc-300">Trabajo serio</p>
              </div>
            </div>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a
                href="#quienes-somos"
                className="rounded-full bg-yellow-500 px-8 py-4 text-center font-black text-black transition hover:bg-yellow-400"
              >
                Conocer SERVICAN
              </a>

              <a
                href="/cursos"
                className="rounded-full border border-yellow-500 bg-black/40 px-8 py-4 text-center font-black text-yellow-500 transition hover:bg-yellow-500 hover:text-black"
              >
                Ver cursos
              </a>

              <a
                href="/verificar-certificado"
                className="rounded-full border border-white/20 bg-white/10 px-8 py-4 text-center font-black text-white transition hover:bg-white hover:text-black"
              >
                Verificar certificado
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        id="quienes-somos"
        className="border-y border-zinc-800 bg-zinc-950 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-[1450px] gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Quiénes somos
            </p>
            <h2 className="text-4xl font-black md:text-5xl">
              Una empresa enfocada en formación, disciplina y trabajo canino.
            </h2>
          </div>

          <div className="space-y-5 text-lg leading-8 text-zinc-300">
            <p>
              SERVICAN trabaja sobre una base de respeto, comunicación,
              estructura y bienestar animal. La idea es formar personas capaces
              de entender al perro, guiarlo correctamente y desarrollar un
              trabajo ordenado.
            </p>
            <p>
              La empresa combina formación, asesoramiento, entrenamiento y
              desarrollo progresivo de habilidades, con una visión profesional y
              seria del trabajo guía-perro.
            </p>
            <p>
              Esta página está pensada para crecer junto con la marca:
              presentación institucional, servicios, perros del equipo, cursos,
              galería, alumnos y plataforma privada.
            </p>
          </div>
        </div>
      </section>

      <section id="perros" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1450px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Nuestros perros
            </p>
            <h2 className="text-4xl font-black md:text-5xl">
              El equipo canino de SERVICAN
            </h2>
            <p className="mt-4 text-zinc-300">
              Perros de trabajo, formación y detección que integran el equipo
              SERVICAN. Cada uno cumple un rol dentro del desarrollo técnico,
              operativo y formativo de la empresa.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {perros.map((perro) => (
              <article
                key={perro.nombre}
                className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 shadow-2xl transition hover:-translate-y-1 hover:border-yellow-500/50"
              >
                <div className="relative aspect-[4/3] bg-zinc-900">
                  <Image
                    src={perro.imagen}
                    alt={`${perro.nombre} - ${perro.especialidad}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>

                <div className="p-7">
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-yellow-300">
                      {perro.especialidad}
                    </span>
                  </div>

                  <h3 className="text-3xl font-black text-yellow-500">
                    {perro.nombre}
                  </h3>

                  <p className="mt-2 text-sm font-bold text-zinc-400">
                    {perro.datos}
                  </p>

                  <p className="mt-4 leading-7 text-zinc-300">{perro.texto}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1450px]">
          <div className="grid gap-10 rounded-[2rem] border border-yellow-500/30 bg-gradient-to-br from-zinc-950 via-black to-zinc-950 p-8 md:grid-cols-[0.9fr_1.1fr] md:items-center md:p-12">
            <div className="rounded-[2rem] border border-zinc-800 bg-black p-8 shadow-2xl">
              <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
                SERVICAN en prensa
              </p>

              <h2 className="text-4xl font-black md:text-5xl">
                Reconocimiento al trabajo técnico de detección canina
              </h2>

              <p className="mt-5 leading-8 text-zinc-300">
                SERVICAN fue mencionada por El País Uruguay en una nota sobre
                entrenamiento de perros de trabajo, detección de drogas,
                explosivos y búsqueda de personas.
              </p>

              <a
                href={notaElPaisUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-block rounded-full bg-yellow-500 px-8 py-4 font-black text-black transition hover:bg-yellow-400"
              >
                Ver nota en El País
              </a>
            </div>

            <div className="space-y-5 text-lg leading-8 text-zinc-300">
              <p>
                En la publicación se menciona a SERVICAN como una empresa
                privada externa al K9, dedicada al adiestramiento y al trabajo
                con perros de detección mediante kits de olores.
              </p>

              <p>
                La nota destaca el entrenamiento para búsqueda de sustancias
                como cocaína, marihuana, fentanilo, metanfetamina, LSD, éxtasis
                y heroína, además de certificaciones emitidas en Brasil por
                pruebas con sustancia real.
              </p>

              <p>
                También se menciona el trabajo de inspección en zona franca,
                revisando cargamentos con perros y aplicando entrenamiento
                olfativo en contextos vinculados al comercio internacional.
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-2xl font-black text-yellow-500">
                    Detección
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Trabajo olfativo aplicado a escenarios reales.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-2xl font-black text-yellow-500">
                    Técnica
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Entrenamiento progresivo con kits de olores.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-2xl font-black text-yellow-500">
                    Campo real
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Aplicación en zonas de trabajo e inspección.
                  </p>
                </div>
              </div>

              <p className="text-sm leading-6 text-zinc-500">
                Fuente: nota publicada por El País Uruguay el 19/10/2025.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-800 bg-zinc-950 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1450px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Metodología
            </p>

            <h2 className="text-4xl font-black md:text-5xl">
              Cómo trabaja SERVICAN
            </h2>

            <p className="mt-4 text-zinc-300">
              El entrenamiento canino profesional requiere método, paciencia,
              lectura del perro y práctica constante. SERVICAN trabaja sobre
              procesos progresivos, con foco en el vínculo, la conducta y la
              confiabilidad del resultado.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {metodologia.map((item) => (
              <div
                key={item.titulo}
                className="rounded-3xl border border-zinc-800 bg-black p-7 transition hover:border-yellow-500/60"
              >
                <p className="mb-4 text-4xl">{item.icono}</p>

                <h3 className="text-xl font-black text-yellow-500">
                  {item.titulo}
                </h3>

                <p className="mt-3 leading-7 text-zinc-300">{item.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="servicios"
        className="bg-zinc-950 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-[1450px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Servicios
            </p>
            <h2 className="text-4xl font-black md:text-5xl">
              Áreas de trabajo SERVICAN
            </h2>
            <p className="mt-4 text-zinc-300">
              SERVICAN no se limita a cursos. La marca puede crecer hacia
              servicios, asesoramiento, talleres, formación, actividades y
              trabajo institucional.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {servicios.map((item) => (
              <div
                key={item.titulo}
                className="rounded-3xl border border-zinc-800 bg-black p-7 transition hover:border-yellow-500/60"
              >
                <p className="mb-4 text-4xl">{item.icono}</p>
                <h3 className="text-xl font-black text-yellow-500">
                  {item.titulo}
                </h3>
                <p className="mt-3 leading-7 text-zinc-300">{item.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1450px]">
          <div className="rounded-[2rem] border border-yellow-500/30 bg-gradient-to-br from-zinc-950 to-black p-8 md:p-12">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Galería
            </p>

            <h2 className="text-4xl font-black md:text-5xl">
              Trabajo real en campo y entorno operativo
            </h2>

            <p className="mt-5 max-w-4xl leading-8 text-zinc-300">
              Registro visual de ejercicios de detección, control, búsqueda,
              manejo con guía y trabajo canino en depósitos, zonas industriales
              y espacios de práctica.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {galeria.map((item) => (
                <article
                  key={`${item.titulo}-${item.imagen}`}
                  className="group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950"
                >
                  <div className="relative aspect-square bg-zinc-900">
                    <Image
                      src={item.imagen}
                      alt={item.titulo}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-5">
                      <h3 className="text-2xl font-black text-yellow-400">
                        {item.titulo}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-200">
                        {item.texto}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1450px] gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Formación
            </p>
            <h2 className="text-4xl font-black md:text-5xl">
              Cursos y programas de capacitación
            </h2>
            <p className="mt-5 leading-8 text-zinc-300">
              Los cursos tienen su propia sección para mantener la página
              principal institucional, ordenada y enfocada en la empresa.
            </p>
          </div>

          <div className="rounded-[2rem] border border-zinc-800 bg-black p-8">
            <h3 className="text-2xl font-black text-yellow-500">
              Ver cursos SERVICAN
            </h3>
            <p className="mt-4 leading-7 text-zinc-300">
              Accedé a la sección de cursos para ver los programas disponibles,
              contenidos, modalidad e inscripción.
            </p>

            <a
              href="/cursos"
              className="mt-8 inline-block rounded-full bg-yellow-500 px-8 py-4 font-black text-black hover:bg-yellow-400"
            >
              Ir a cursos
            </a>
          </div>
        </div>
      </section>

      <section className="bg-black px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1450px]">
          <div className="grid gap-10 rounded-[2rem] border border-yellow-500/30 bg-gradient-to-br from-zinc-950 via-black to-zinc-950 p-8 md:grid-cols-[1fr_0.8fr] md:items-center md:p-12">
            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
                Certificados SERVICAN
              </p>

              <h2 className="text-4xl font-black md:text-5xl">
                Verificación pública de certificados
              </h2>

              <p className="mt-5 max-w-3xl leading-8 text-zinc-300">
                Los certificados emitidos por SERVICAN cuentan con un código
                único de verificación. Esta herramienta permite comprobar si un
                certificado es válido sin mostrar ni permitir descargar el
                documento completo.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xl font-black text-yellow-500">Privado</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    El certificado completo solo lo ve el alumno desde su cuenta.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xl font-black text-yellow-500">
                    Verificable
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    Cada certificado tiene un código único emitido por SERVICAN.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xl font-black text-yellow-500">Seguro</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    La página pública solo confirma la validez, no entrega el
                    diploma.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-800 bg-black p-8 shadow-2xl">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500 text-3xl text-black">
                ✓
              </div>

              <h3 className="text-2xl font-black text-yellow-500">
                ¿Tenés un código de certificado?
              </h3>

              <p className="mt-4 leading-7 text-zinc-300">
                Ingresalo en la página de verificación para confirmar si fue
                emitido por SERVICAN y si se encuentra vigente.
              </p>

              <a
                href="/verificar-certificado"
                className="mt-8 inline-block rounded-full bg-yellow-500 px-8 py-4 font-black text-black transition hover:bg-yellow-400"
              >
                Verificar certificado
              </a>
            </div>
          </div>
        </div>
      </section>

      <NoticiasInicio />

      <section
        id="contacto"
        className="bg-yellow-500 px-4 py-20 text-black sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-4xl font-black md:text-6xl">
            Contactá con SERVICAN
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8">
            Consultá por formación, servicios, cursos, actividades o futuras
            propuestas de la empresa.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="/inscripcion"
              className="rounded-full bg-black px-9 py-4 font-black text-white hover:bg-zinc-800"
            >
              Completar consulta
            </a>

            <a
              href={linkWhatsApp("Hola SERVICAN, quiero hacer una consulta")}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-black px-9 py-4 font-black text-black hover:bg-black hover:text-white"
            >
              WhatsApp directo
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-900 px-6 py-10 text-center">
        <p className="text-xl font-black tracking-[0.25em] text-yellow-500">
          SERVICAN
        </p>

        <p className="mt-2 text-zinc-500">Nuestro olfato nos define</p>

        <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm font-semibold text-zinc-400">
          <a href="/cursos" className="hover:text-yellow-500">
            Cursos
          </a>

          <a href="/verificar-certificado" className="hover:text-yellow-500">
            Verificar certificado
          </a>

          <a href="/inscripcion" className="hover:text-yellow-500">
            Consulta
          </a>
        </div>

        <p className="mt-4 text-sm text-zinc-600">
          © 2026 SERVICAN. Todos los derechos reservados.
        </p>
      </footer>
    </main>
  );
}