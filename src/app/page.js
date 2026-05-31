export default function Home() {
  const whatsapp = "59898188257";

  const linkWhatsApp = (mensaje) =>
    `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensaje)}`;

  const fotoPortada = "/fotos/portada-servican.jpeg";

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
      nombre: "Equipo canino SERVICAN",
      texto: "Espacio preparado para colocar fotos reales de los perros que forman parte del equipo.",
    },
    {
      nombre: "Entrenamiento y vínculo",
      texto: "Imágenes de prácticas, ejercicios, obediencia, socialización y trabajo en campo.",
    },
    {
      nombre: "Trabajo profesional",
      texto: "Registro visual de actividades, jornadas, formación y desarrollo del binomio guía-perro.",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* MENÚ */}
      <header className="sticky top-0 z-50 border-b border-yellow-500/20 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
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
            <a href="#quienes-somos" className="hover:text-yellow-500">
              Quiénes somos
            </a>
            <a href="#perros" className="hover:text-yellow-500">
              Nuestros perros
            </a>
            <a href="#servicios" className="hover:text-yellow-500">
              Servicios
            </a>
            <a href="/cursos" className="hover:text-yellow-500">
              Cursos
            </a>
            <a href="#contacto" className="hover:text-yellow-500">
              Contacto
            </a>
          </nav>

          <a
            href={linkWhatsApp("Hola SERVICAN, quiero consultar información")}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-yellow-500 px-5 py-3 text-sm font-bold text-black hover:bg-yellow-400"
          >
            Contactar
          </a>
        </div>
      </header>

      {/* HERO INSTITUCIONAL */}
      <section
        id="inicio"
        className="relative min-h-[92vh] overflow-hidden"
      >
        <img
          src={fotoPortada}
          alt="Perros del equipo SERVICAN"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />

        <div className="relative mx-auto flex min-h-[92vh] max-w-[1500px] items-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl rounded-[2rem] border border-yellow-500/20 bg-black/45 p-6 shadow-2xl backdrop-blur-sm sm:p-8 md:p-10">
            <p className="mb-5 text-sm font-black uppercase tracking-[0.35em] text-yellow-500 md:tracking-[0.45em]">
              Empresa de formación y trabajo canino
            </p>

            <h1 className="text-5xl font-black leading-none md:text-8xl">
              SERVICAN
            </h1>

            <p className="mt-5 text-2xl font-bold text-yellow-500 md:text-3xl">
              Nuestro olfato nos define
            </p>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-100">
              Formación, entrenamiento y trabajo canino profesional en Uruguay.
              Desarrollamos el vínculo guía-perro con disciplina, respeto,
              estructura y una visión seria del mundo canino.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#quienes-somos"
                className="rounded-full bg-yellow-500 px-9 py-4 text-center font-black text-black transition hover:bg-yellow-400"
              >
                Conocer SERVICAN
              </a>

              <a
                href="/cursos"
                className="rounded-full border border-yellow-500 bg-black/40 px-9 py-4 text-center font-black text-yellow-500 transition hover:bg-yellow-500 hover:text-black"
              >
                Ver cursos
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* QUIÉNES SOMOS */}
      <section
        id="quienes-somos"
        className="border-y border-zinc-800 bg-zinc-950 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-2 md:items-center">
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
              galería, alumnos y futura plataforma privada.
            </p>
          </div>
        </div>
      </section>

      {/* NUESTROS PERROS */}
      <section id="perros" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Nuestros perros
            </p>
            <h2 className="text-4xl font-black md:text-5xl">
              El equipo canino de SERVICAN
            </h2>
            <p className="mt-4 text-zinc-300">
              Esta sección será una de las más importantes de la web: acá se
              mostrarán fotos reales de los perros, entrenamientos y actividades
              del equipo.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {perros.map((item) => (
              <div
                key={item.nombre}
                className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 shadow-2xl"
              >
                <div className="flex aspect-[4/3] items-center justify-center bg-zinc-900 text-center text-zinc-500">
                  Foto real
                  <br />
                  Próximamente
                </div>

                <div className="p-7">
                  <h3 className="text-2xl font-black text-yellow-500">
                    {item.nombre}
                  </h3>
                  <p className="mt-3 leading-7 text-zinc-300">{item.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="bg-zinc-950 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
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

      {/* GALERÍA */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="rounded-[2rem] border border-yellow-500/30 bg-gradient-to-br from-zinc-950 to-black p-8 md:p-12">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Galería
            </p>

            <h2 className="text-4xl font-black md:text-5xl">
              Fotos, actividades y trabajo real
            </h2>

            <p className="mt-5 max-w-4xl leading-8 text-zinc-300">
              Más adelante esta sección será editable desde el panel
              administrador para cargar fotos de entrenamientos, perros,
              jornadas, clases, equipo y actividades institucionales.
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex aspect-square items-center justify-center rounded-3xl bg-zinc-900 text-center text-zinc-500"
                >
                  Foto {item}
                  <br />
                  Próximamente
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CURSOS RESUMEN */}
      <section className="bg-zinc-950 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-2 md:items-center">
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

      {/* CONTACTO */}
      <section id="contacto" className="bg-yellow-500 px-4 py-20 text-black sm:px-6 lg:px-8">
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
    </main>
  );
}