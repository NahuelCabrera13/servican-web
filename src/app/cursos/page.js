export default function Cursos() {
  const cursos = [
    {
      etiqueta: "Desde cero",
      titulo: "Curso Básico Integral para Guías Caninos",
      descripcion:
        "Formación inicial para aprender manejo, comunicación, obediencia básica, bienestar, vínculo y preparación para módulos profesionales.",
      detalles: [
        "Ideal para principiantes",
        "Material PDF",
        "Base para módulos K9",
        "Modalidad a consultar",
      ],
      url: "/cursos/guia-canino-desde-cero",
    },
    {
      etiqueta: "Especialización K9",
      titulo: "Módulo 2 K9 Antinarcóticos",
      descripcion:
        "Curso orientado al trabajo con perros detectores: olfato, imprinting, alerta, búsquedas, control de contaminación, pruebas ciegas y mantenimiento operativo.",
      detalles: [
        "Enfoque K9",
        "Trabajo de detección",
        "Contenido técnico",
        "Material de apoyo",
      ],
      url: "/cursos/k9-antinarcoticos",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* MENÚ */}
      <header className="sticky top-0 z-50 border-b border-yellow-500/20 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-3">
            <img
              src="/logo-servican.jpeg"
              alt="Logo SERVICAN"
              className="h-12 w-12 rounded-full object-contain"
            />

            <div>
              <p className="font-black tracking-[0.25em] text-yellow-500">
                SERVICAN
              </p>
              <p className="text-xs text-zinc-400">Nuestro olfato nos define</p>
            </div>
          </a>

          <a
            href="/inscripcion"
            className="rounded-full bg-yellow-500 px-5 py-3 text-sm font-black text-black hover:bg-yellow-400"
          >
            Inscribirme
          </a>
        </div>
      </header>

      {/* PORTADA */}
      <section className="relative overflow-hidden px-6 py-20 text-center md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#3f3210_0%,#111_38%,#000_80%)]" />

        <div className="relative mx-auto max-w-5xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
            Formación SERVICAN
          </p>

          <h1 className="text-5xl font-black leading-tight md:text-7xl">
            Cursos y programas
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
            En esta sección se encuentran los cursos pagos y programas de
            formación disponibles. Cada curso tiene su propia página con
            información, contenido, modalidad e inscripción.
          </p>
        </div>
      </section>

      {/* CURSOS */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2">
            {cursos.map((curso) => (
              <div
                key={curso.titulo}
                className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8 shadow-2xl transition hover:border-yellow-500/60"
              >
                <p className="mb-4 inline-block rounded-full bg-yellow-500/10 px-4 py-2 text-sm font-black uppercase tracking-widest text-yellow-500">
                  {curso.etiqueta}
                </p>

                <h2 className="text-3xl font-black">{curso.titulo}</h2>

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

      {/* CTA */}
      <section className="bg-yellow-500 px-6 py-20 text-black">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-4xl font-black md:text-6xl">
            Consultá por cupos, precios y modalidad
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8">
            Completá el formulario y se generará una consulta para enviar a
            SERVICAN por WhatsApp.
          </p>

          <a
            href="/inscripcion"
            className="mt-10 inline-block rounded-full bg-black px-9 py-4 font-black text-white hover:bg-zinc-800"
          >
            Completar inscripción
          </a>
        </div>
      </section>
    </main>
  );
}