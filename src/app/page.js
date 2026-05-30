export default function Home() {
  const whatsapp = "59898188257";

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
        "Orientación progresiva",
      ],
      mensaje:
        "Hola SERVICAN, quiero información del Curso Básico Integral para Guías Caninos",
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
      mensaje:
        "Hola SERVICAN, quiero información del Módulo 2 K9 Antinarcóticos",
      url: "/cursos/k9-antinarcoticos",
    },
  ];

  const incluye = [
    {
      icono: "📘",
      titulo: "Material PDF",
      texto: "Guías, apuntes y material organizado para estudiar cada módulo.",
    },
    {
      icono: "🎥",
      titulo: "Videos del curso",
      texto: "Fragmentos, presentaciones y clases que pueden visualizarse desde la propia página.",
    },
    {
      icono: "🐕",
      titulo: "Enfoque guía-perro",
      texto: "Contenido orientado al trabajo responsable del binomio, la comunicación y el bienestar animal.",
    },
    {
      icono: "🏅",
      titulo: "Certificado",
      texto: "Posibilidad de entregar constancia o certificado según la modalidad del curso.",
    },
    {
      icono: "📍",
      titulo: "Modalidad flexible",
      texto: "Preparada para adaptarse a modalidad presencial, online o mixta.",
    },
    {
      icono: "🛡️",
      titulo: "Proyección K9",
      texto: "Base para avanzar hacia módulos profesionales y especialidades futuras.",
    },
  ];

  const linkWhatsApp = (mensaje) =>
    `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensaje)}`;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* MENÚ */}
      <header className="sticky top-0 z-50 border-b border-yellow-500/20 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
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
          </div>

          <nav className="hidden gap-6 text-sm font-semibold text-zinc-300 md:flex">
            <a href="#inicio" className="hover:text-yellow-500">
              Inicio
            </a>
            <a href="#cursos" className="hover:text-yellow-500">
              Cursos
            </a>
            <a href="#precios" className="hover:text-yellow-500">
              Inscripción
            </a>
            <a href="#videos" className="hover:text-yellow-500">
              Videos
            </a>
            <a href="#contacto" className="hover:text-yellow-500">
              Contacto
            </a>
          </nav>

          <a
            href={linkWhatsApp("Hola SERVICAN, quiero consultar por los cursos")}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-yellow-500 px-5 py-3 text-sm font-bold text-black hover:bg-yellow-400"
          >
            WhatsApp
          </a>
        </div>
      </header>

      {/* PORTADA */}
      <section
        id="inicio"
        className="relative overflow-hidden px-6 py-24 text-center md:py-32"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#3f3210_0%,#111_35%,#000_75%)]" />

        <div className="relative mx-auto max-w-5xl">
          <div className="mb-8 flex justify-center">
            <img
              src="/logo-servican.jpeg"
              alt="Logo SERVICAN"
              className="h-32 w-32 rounded-full object-contain shadow-2xl"
            />
          </div>

          <p className="mb-5 text-sm font-black uppercase tracking-[0.45em] text-yellow-500">
            Academia de formación canina
          </p>

          <h1 className="text-5xl font-black leading-tight md:text-7xl">
            Cursos profesionales para guías caninos
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
            SERVICAN ofrece cursos pagos de adiestramiento, manejo canino y
            especialización K9, con una formación clara, seria y progresiva.
          </p>

          <p className="mt-5 text-2xl font-bold text-yellow-500">
            Nuestro olfato nos define
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href={linkWhatsApp(
                "Hola SERVICAN, quiero inscribirme a un curso"
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-yellow-500 px-9 py-4 font-black text-black transition hover:bg-yellow-400"
            >
              Inscribirme
            </a>

            <a
              href={linkWhatsApp(
                "Hola SERVICAN, quiero consultar precios, cupos y fechas"
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-yellow-500 px-9 py-4 font-black text-yellow-500 transition hover:bg-yellow-500 hover:text-black"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* SOBRE SERVICAN */}
      <section className="border-y border-zinc-800 bg-zinc-950 px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Sobre SERVICAN
            </p>
            <h2 className="text-4xl font-black md:text-5xl">
              Formación pensada para avanzar desde cero hasta niveles
              profesionales.
            </h2>
          </div>

          <div className="space-y-5 text-lg leading-8 text-zinc-300">
            <p>
              La propuesta de SERVICAN está orientada a personas que buscan
              capacitarse en el trabajo con perros, comenzando por las bases del
              manejo, la comunicación y el bienestar animal.
            </p>
            <p>
              A partir de esa base, el alumno puede avanzar hacia módulos de
              especialización, incluyendo formación K9 y contenidos orientados a
              perros detectores.
            </p>
          </div>
        </div>
      </section>

      {/* QUÉ INCLUYE */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Qué incluye
            </p>
            <h2 className="text-4xl font-black md:text-5xl">
              Una formación pensada para aprender y avanzar
            </h2>
            <p className="mt-4 text-zinc-300">
              SERVICAN combina material de estudio, orientación práctica y una
              estructura progresiva para que cada alumno pueda formarse con una
              base sólida.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {incluye.map((item) => (
              <div
                key={item.titulo}
                className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7 transition hover:border-yellow-500/60 hover:bg-zinc-900"
              >
                <p className="mb-4 text-4xl">{item.icono}</p>
                <h3 className="text-xl font-black text-yellow-500">
                  {item.titulo}
                </h3>
                <p className="mt-3 text-zinc-300">{item.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CURSOS */}
      <section id="cursos" className="bg-zinc-950 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Cursos pagos
            </p>
            <h2 className="text-4xl font-black md:text-5xl">
              Programas disponibles
            </h2>
            <p className="mt-4 text-zinc-300">
              Consultá por fechas, modalidad, precios, materiales incluidos y
              requisitos de inscripción.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {cursos.map((curso) => (
              <div
                key={curso.titulo}
                className="rounded-[2rem] border border-zinc-800 bg-black p-8 shadow-2xl transition hover:border-yellow-500/60"
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
                    className="inline-block rounded-full bg-yellow-500 px-7 py-4 text-center font-black text-black hover:bg-yellow-400"
                  >
                    Ver detalles
                  </a>

                  <a
                    href={linkWhatsApp(curso.mensaje)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-full border border-yellow-500 px-7 py-4 text-center font-black text-yellow-500 hover:bg-yellow-500 hover:text-black"
                  >
                    Consultar
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRECIOS / INSCRIPCIÓN */}
      <section
        id="precios"
        className="border-y border-yellow-500/20 bg-gradient-to-br from-yellow-500 to-yellow-700 px-6 py-20 text-black"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em]">
              Inscripción
            </p>
            <h2 className="text-4xl font-black md:text-6xl">
              Cursos pagos con cupos limitados
            </h2>
            <p className="mt-5 text-lg leading-8 text-black/75">
              Los precios, próximas fechas y modalidad se coordinan directamente
              por WhatsApp para dar información actualizada a cada alumno.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {cursos.map((curso) => (
              <div
                key={curso.titulo}
                className="rounded-[2rem] bg-black p-8 text-white shadow-2xl"
              >
                <p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-yellow-500">
                  {curso.etiqueta}
                </p>

                <h3 className="text-3xl font-black">{curso.titulo}</h3>

                <div className="mt-6 rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-6">
                  <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">
                    Precio
                  </p>
                  <p className="mt-2 text-4xl font-black text-yellow-500">
                    Consultar
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    Se informa por WhatsApp según modalidad, fecha y cupo.
                  </p>
                </div>

                <div className="mt-6 space-y-3 text-zinc-300">
                  <p>
                    <span className="font-bold text-white">Modalidad:</span>{" "}
                    presencial, online o mixta.
                  </p>
                  <p>
                    <span className="font-bold text-white">Material:</span> PDF,
                    videos y recursos de apoyo.
                  </p>
                  <p>
                    <span className="font-bold text-white">Cupos:</span>{" "}
                    sujetos a disponibilidad.
                  </p>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={curso.url}
                    className="inline-block rounded-full border border-yellow-500 px-7 py-4 text-center font-black text-yellow-500 hover:bg-yellow-500 hover:text-black"
                  >
                    Ver programa
                  </a>

                  <a
                    href={linkWhatsApp(
                      `Hola SERVICAN, quiero consultar precio, cupos y fechas de: ${curso.titulo}`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-full bg-yellow-500 px-7 py-4 text-center font-black text-black hover:bg-yellow-400"
                  >
                    Consultar inscripción
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEOS */}
      <section id="videos" className="bg-zinc-950 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Videos del curso
            </p>
            <h2 className="text-4xl font-black md:text-5xl">
              Fragmentos y presentación
            </h2>
            <p className="mt-4 text-zinc-300">
              Acá vamos a insertar videos de YouTube. Pueden ser públicos o no
              listados.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-black">
              <div className="flex aspect-video items-center justify-center bg-zinc-900 text-center text-zinc-400">
                Video de presentación SERVICAN
                <br />
                Próximamente
              </div>
              <div className="p-6">
                <h3 className="text-xl font-black text-yellow-500">
                  Presentación del curso
                </h3>
                <p className="mt-2 text-zinc-300">
                  En esta sección se mostrará un video introductorio del curso.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-black">
              <div className="flex aspect-video items-center justify-center bg-zinc-900 text-center text-zinc-400">
                Fragmento de clase
                <br />
                Próximamente
              </div>
              <div className="p-6">
                <h3 className="text-xl font-black text-yellow-500">
                  Fragmento de entrenamiento
                </h3>
                <p className="mt-2 text-zinc-300">
                  Luego podemos insertar videos reales subidos a YouTube.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MATERIAL */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-yellow-500/30 bg-gradient-to-br from-zinc-950 to-black p-8 md:p-12">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Material de estudio
            </p>

            <h2 className="text-4xl font-black md:text-5xl">
              PDFs, guías y recursos para alumnos
            </h2>

            <p className="mt-5 max-w-3xl leading-8 text-zinc-300">
              La página podrá mostrar materiales descargables o privados según
              la etapa del proyecto. En la primera versión podemos colocar los
              PDFs como vista pública o entregarlos después de la inscripción.
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <div className="rounded-3xl bg-zinc-900 p-6">
                <h3 className="font-black text-yellow-500">PDF del curso</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Material organizado para estudiar.
                </p>
              </div>

              <div className="rounded-3xl bg-zinc-900 p-6">
                <h3 className="font-black text-yellow-500">Videos de apoyo</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Fragmentos o clases completas embebidas.
                </p>
              </div>

              <div className="rounded-3xl bg-zinc-900 p-6">
                <h3 className="font-black text-yellow-500">
                  Acceso de alumnos
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Esto se agregará en la segunda etapa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-zinc-950 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-center text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
            Preguntas frecuentes
          </p>
          <h2 className="text-center text-4xl font-black md:text-5xl">
            Información importante
          </h2>

          <div className="mt-10 space-y-5">
            <div className="rounded-3xl border border-zinc-800 bg-black p-6">
              <h3 className="text-xl font-black text-yellow-500">
                ¿Los cursos son pagos?
              </h3>
              <p className="mt-2 text-zinc-300">
                Sí. Los cursos SERVICAN son pagos. Los precios, cupos y fechas
                se consultan directamente por WhatsApp.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black p-6">
              <h3 className="text-xl font-black text-yellow-500">
                ¿Necesito experiencia previa?
              </h3>
              <p className="mt-2 text-zinc-300">
                Para el curso básico no. Para módulos K9 puede ser recomendable
                tener conocimientos previos o haber realizado una formación
                inicial.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black p-6">
              <h3 className="text-xl font-black text-yellow-500">
                ¿Se pueden ver videos dentro de la página?
              </h3>
              <p className="mt-2 text-zinc-300">
                Sí. Los videos pueden subirse a YouTube como no listados y
                mostrarse dentro de la página.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="bg-yellow-500 px-6 py-20 text-black">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-4xl font-black md:text-6xl">
            Empezá tu formación con SERVICAN
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8">
            Consultá precios, cupos, fechas, modalidad y materiales incluidos.
            Te respondemos directamente por WhatsApp.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href={linkWhatsApp(
                "Hola SERVICAN, quiero inscribirme a un curso"
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-black px-9 py-4 font-black text-white hover:bg-zinc-800"
            >
              Inscribirme
            </a>

            <a
              href={linkWhatsApp(
                "Hola SERVICAN, quiero consultar por los cursos pagos"
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-black px-9 py-4 font-black text-black hover:bg-black hover:text-white"
            >
              Consultar por WhatsApp
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
          "Hola SERVICAN, quiero consultar por los cursos disponibles"
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