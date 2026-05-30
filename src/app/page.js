export default function Home() {
  const whatsapp = "59898188257";

  const servicios = [
    {
      titulo: "Formación para guías caninos",
      texto: "Capacitación progresiva para personas que quieren aprender manejo, comunicación, obediencia y trabajo responsable con perros.",
      icono: "🎓",
    },
    {
      titulo: "Adiestramiento y manejo",
      texto: "Base de trabajo orientada al vínculo guía-perro, control, bienestar animal y desarrollo de conductas útiles.",
      icono: "🐕",
    },
    {
      titulo: "Especialización K9",
      texto: "Módulos orientados a formación técnica, detección, olfato, búsqueda, motivación y preparación profesional.",
      icono: "🛡️",
    },
    {
      titulo: "Cursos y talleres",
      texto: "Programas pagos, materiales PDF, videos de apoyo y futuras áreas privadas para alumnos.",
      icono: "📘",
    },
  ];

  const cursos = [
    {
      etiqueta: "Desde cero",
      titulo: "Curso Básico Integral para Guías Caninos",
      descripcion:
        "Formación inicial para aprender manejo, comunicación, obediencia básica, bienestar, vínculo y preparación para módulos profesionales.",
      detalles: [
        "Ideal para principiantes",
        "Material de estudio en PDF",
        "Base para avanzar a módulos K9",
        "Modalidad presencial, online o mixta",
      ],
      url: "/cursos/guia-canino-desde-cero",
    },
    {
      etiqueta: "Especialización K9",
      titulo: "Módulo 2 K9 Antinarcóticos",
      descripcion:
        "Curso orientado al trabajo con perros detectores: olfato, imprinting, alerta, búsquedas, control de contaminación, pruebas ciegas y mantenimiento operativo.",
      detalles: [
        "Enfoque profesional K9",
        "Trabajo de detección",
        "Contenido teórico y práctico",
        "Preparación para escenarios operativos",
      ],
      url: "/cursos/k9-antinarcoticos",
    },
  ];

  const equipo = [
    {
      nombre: "Perros SERVICAN",
      rol: "Equipo canino",
      texto: "Espacio reservado para fotos reales de los perros del equipo SERVICAN.",
    },
    {
      nombre: "Guías y entrenamiento",
      rol: "Trabajo en campo",
      texto: "Espacio reservado para imágenes de prácticas, entrenamientos y jornadas.",
    },
    {
      nombre: "Formación profesional",
      rol: "Academia SERVICAN",
      texto: "Espacio reservado para fotos institucionales, clases y actividades.",
    },
  ];

  const linkWhatsApp = (mensaje) =>
    `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensaje)}`;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* MENÚ */}
      <header className="sticky top-0 z-50 border-b border-yellow-500/20 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#inicio" className="flex items-center gap-3">
            <img
              src="/logo-servican.jpeg"
              alt="Logo SERVICAN"
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

          <nav className="hidden gap-6 text-sm font-semibold text-zinc-300 md:flex">
            <a href="#inicio" className="hover:text-yellow-500">
              Inicio
            </a>
            <a href="#servicios" className="hover:text-yellow-500">
              Servicios
            </a>
            <a href="#equipo" className="hover:text-yellow-500">
              Equipo
            </a>
            <a href="#cursos" className="hover:text-yellow-500">
              Cursos
            </a>
            <a href="#contacto" className="hover:text-yellow-500">
              Contacto
            </a>
          </nav>

          <a
            href="/inscripcion"
            className="rounded-full bg-yellow-500 px-5 py-3 text-sm font-bold text-black hover:bg-yellow-400"
          >
            Inscribirme
          </a>
        </div>
      </header>

      {/* PORTADA INSTITUCIONAL */}
      <section
        id="inicio"
        className="relative overflow-hidden px-6 py-24 text-center md:py-32"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#3f3210_0%,#111_35%,#000_78%)]" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-8 flex justify-center">
            <img
              src="/logo-servican.jpeg"
              alt="Logo SERVICAN"
              className="h-36 w-36 rounded-full object-contain shadow-2xl"
            />
          </div>

          <p className="mb-5 text-sm font-black uppercase tracking-[0.45em] text-yellow-500">
            Formación canina profesional
          </p>

          <h1 className="mx-auto max-w-5xl text-5xl font-black leading-tight md:text-7xl">
            SERVICAN: entrenamiento, formación y trabajo canino responsable
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
            Una propuesta orientada a guías, alumnos e instituciones que buscan
            formación seria, progresiva y enfocada en el vínculo guía-perro, el
            bienestar animal y la preparación profesional.
          </p>

          <p className="mt-5 text-2xl font-bold text-yellow-500">
            Nuestro olfato nos define
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="#servicios"
              className="rounded-full bg-yellow-500 px-9 py-4 font-black text-black transition hover:bg-yellow-400"
            >
              Conocer SERVICAN
            </a>

            <a
              href="/inscripcion"
              className="rounded-full border border-yellow-500 px-9 py-4 font-black text-yellow-500 transition hover:bg-yellow-500 hover:text-black"
            >
              Inscribirme / Consultar
            </a>
          </div>
        </div>
      </section>

      {/* QUIÉNES SOMOS */}
      <section className="border-y border-zinc-800 bg-zinc-950 px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center">
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
              SERVICAN nace como una propuesta de formación canina orientada a
              personas que buscan aprender desde una base clara, práctica y
              profesional.
            </p>
            <p>
              El objetivo es construir conocimiento real sobre manejo,
              comunicación, obediencia, bienestar y preparación hacia áreas más
              técnicas como el trabajo K9.
            </p>
            <p>
              La web está pensada para crecer: primero como página institucional
              y de cursos, y luego como plataforma completa con alumnos, roles,
              pagos y contenido privado.
            </p>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Servicios
            </p>
            <h2 className="text-4xl font-black md:text-5xl">
              Más que cursos: una plataforma para desarrollar SERVICAN
            </h2>
            <p className="mt-4 text-zinc-300">
              La página está preparada para mostrar servicios, cursos,
              actividades, videos, galería y futuras áreas privadas para alumnos.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {servicios.map((item) => (
              <div
                key={item.titulo}
                className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7 transition hover:border-yellow-500/60 hover:bg-zinc-900"
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

      {/* EQUIPO / PERROS */}
      <section id="equipo" className="bg-zinc-950 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Equipo SERVICAN
            </p>
            <h2 className="text-4xl font-black md:text-5xl">
              Perros, guías y trabajo en equipo
            </h2>
            <p className="mt-4 text-zinc-300">
              Esta sección queda preparada para colocar fotos reales de los
              perros, entrenamientos, guías y actividades de SERVICAN.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {equipo.map((item) => (
              <div
                key={item.nombre}
                className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-black shadow-2xl"
              >
                <div className="flex aspect-[4/3] items-center justify-center bg-zinc-900 text-center text-zinc-500">
                  Foto SERVICAN
                  <br />
                  Próximamente
                </div>

                <div className="p-7">
                  <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-yellow-500">
                    {item.rol}
                  </p>
                  <h3 className="text-2xl font-black">{item.nombre}</h3>
                  <p className="mt-3 leading-7 text-zinc-300">{item.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CURSOS */}
      <section id="cursos" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Cursos pagos
            </p>
            <h2 className="text-4xl font-black md:text-5xl">
              Programas disponibles
            </h2>
            <p className="mt-4 text-zinc-300">
              Los cursos son una parte de la propuesta SERVICAN. Cada programa
              tiene su propia página con contenido, modalidad e inscripción.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {cursos.map((curso) => (
              <div
                key={curso.titulo}
                className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8 shadow-2xl transition hover:border-yellow-500/60"
              >
                <p className="mb-4 inline-block rounded-full bg-yellow-500/10 px-4 py-2 text-sm font-black uppercase tracking-widest text-yellow-500">
                  {curso.etiqueta}
                </p>

                <h3 className="text-3xl font-black">{curso.titulo}</h3>

                <p className="mt-5 leading-7 text-zinc-300">
                  {curso.descripcion}
                </p>

                <ul className="mt-6 space-y-3">
                  {curso.detalles.map((item) => (
                    <li key={item} className="flex gap-3 text-zinc-300">
                      <span className="font-black text-yellow-500">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={curso.url}
                    className="rounded-full bg-yellow-500 px-7 py-4 text-center font-black text-black hover:bg-yellow-400"
                  >
                    Ver programa
                  </a>

                  <a
                    href="/inscripcion"
                    className="rounded-full border border-yellow-500 px-7 py-4 text-center font-black text-yellow-500 hover:bg-yellow-500 hover:text-black"
                  >
                    Inscribirme
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALERÍA / FUTURO */}
      <section className="bg-zinc-950 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-yellow-500/30 bg-gradient-to-br from-zinc-950 to-black p-8 md:p-12">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Galería y contenido
            </p>

            <h2 className="text-4xl font-black md:text-5xl">
              Fotos, videos y materiales para mostrar el trabajo real
            </h2>

            <p className="mt-5 max-w-4xl leading-8 text-zinc-300">
              Más adelante podremos agregar una galería editable desde el panel
              administrador, con imágenes reales de entrenamientos, perros,
              equipo, clases, jornadas y actividades de SERVICAN.
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <div className="rounded-3xl bg-zinc-900 p-6">
                <h3 className="font-black text-yellow-500">Fotos reales</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Perros, equipo, entrenamientos y jornadas.
                </p>
              </div>

              <div className="rounded-3xl bg-zinc-900 p-6">
                <h3 className="font-black text-yellow-500">Videos</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  YouTube público o no listado integrado en la web.
                </p>
              </div>

              <div className="rounded-3xl bg-zinc-900 p-6">
                <h3 className="font-black text-yellow-500">Panel editable</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Futuro panel para modificar contenido sin tocar código.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-center text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
            Preguntas frecuentes
          </p>
          <h2 className="text-center text-4xl font-black md:text-5xl">
            Información importante
          </h2>

          <div className="mt-10 space-y-5">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-xl font-black text-yellow-500">
                ¿SERVICAN solo ofrece cursos?
              </h3>
              <p className="mt-2 text-zinc-300">
                No. La web está pensada para crecer como página institucional de
                empresa, servicios, cursos, galería, alumnos y plataforma
                privada.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-xl font-black text-yellow-500">
                ¿Los cursos son pagos?
              </h3>
              <p className="mt-2 text-zinc-300">
                Sí. Los precios, cupos y fechas se consultan completando la
                inscripción o por WhatsApp.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-xl font-black text-yellow-500">
                ¿La página será editable?
              </h3>
              <p className="mt-2 text-zinc-300">
                Sí. La siguiente etapa será construir un panel administrador
                para modificar cursos, servicios, fotos, textos e inscripciones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="bg-yellow-500 px-6 py-20 text-black">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-4xl font-black md:text-6xl">
            Contactá con SERVICAN
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8">
            Consultá por cursos, servicios, formación, modalidad, cupos,
            materiales y próximas fechas.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="/inscripcion"
              className="rounded-full bg-black px-9 py-4 font-black text-white hover:bg-zinc-800"
            >
              Completar inscripción
            </a>

            <a
              href={linkWhatsApp(
                "Hola SERVICAN, quiero consultar por cursos y servicios"
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-black px-9 py-4 font-black text-black hover:bg-black hover:text-white"
            >
              WhatsApp directo
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 px-6 py-10 text-center">
        <p className="text-xl font-black tracking-[0.25em] text-yellow-500">
          SERVICAN
        </p>
        <p className="mt-2 text-zinc-500">Nuestro olfato nos define</p>
        <p className="mt-4 text-sm text-zinc-600">
          © 2026 SERVICAN. Todos los derechos reservados.
        </p>
      </footer>

      {/* BOTÓN FLOTANTE WHATSAPP */}
      <a
        href={linkWhatsApp(
          "Hola SERVICAN, quiero consultar por cursos y servicios"
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-50 rounded-full bg-green-500 px-5 py-4 font-black text-white shadow-2xl transition hover:bg-green-400"
      >
        WhatsApp
      </a>
    </main>
  );
}