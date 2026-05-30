export default function CursoK9Antinarcoticos() {
  const whatsapp = "59898188257";

  const linkWhatsApp = (mensaje) =>
    `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensaje)}`;

  const contenidos = [
    "Selección del perro detector y evaluación del drive.",
    "Ciencia del olfato aplicada al trabajo de detección.",
    "Imprinting del olor objetivo y asociación con recompensa.",
    "Desarrollo de alerta, búsquedas y patrones de rastreo.",
    "Control de contaminación, distractores, blanks y pruebas ciegas.",
    "Mantenimiento operativo, registros y criterios de evaluación.",
  ];

  const beneficios = [
    {
      titulo: "Especialización K9",
      texto: "Módulo orientado a alumnos que quieren avanzar hacia el trabajo técnico con perros detectores.",
    },
    {
      titulo: "Enfoque técnico",
      texto: "Contenidos sobre olfato, imprinting, alerta, búsquedas, control de contaminación y evaluación.",
    },
    {
      titulo: "Preparación progresiva",
      texto: "El curso está pensado como módulo posterior a una base de manejo canino inicial.",
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
      <section className="relative overflow-hidden px-6 py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#3f3210_0%,#111_38%,#000_80%)]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-5xl">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Especialización K9
            </p>

            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              Módulo 2 K9 Antinarcóticos
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
              Curso orientado al trabajo con perros detectores: olfato,
              imprinting, alerta, búsquedas, control de contaminación, pruebas
              ciegas y mantenimiento operativo.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="/inscripcion"
                className="rounded-full bg-yellow-500 px-8 py-4 text-center font-black text-black hover:bg-yellow-400"
              >
                Inscribirme / Consultar
              </a>

              <a
                href="/"
                className="rounded-full border border-yellow-500 px-8 py-4 text-center font-black text-yellow-500 hover:bg-yellow-500 hover:text-black"
              >
                Volver al inicio
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* RESUMEN */}
      <section className="border-y border-zinc-800 bg-zinc-950 px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-4">
          <div className="rounded-3xl bg-black p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
              Nivel
            </p>
            <p className="mt-2 text-xl font-black text-yellow-500">
              Especialización
            </p>
          </div>

          <div className="rounded-3xl bg-black p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
              Modalidad
            </p>
            <p className="mt-2 text-xl font-black text-yellow-500">
              A consultar
            </p>
          </div>

          <div className="rounded-3xl bg-black p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
              Material
            </p>
            <p className="mt-2 text-xl font-black text-yellow-500">
              PDF + recursos
            </p>
          </div>

          <div className="rounded-3xl bg-black p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
              Precio
            </p>
            <p className="mt-2 text-xl font-black text-yellow-500">
              Consultar
            </p>
          </div>
        </div>
      </section>

      {/* OBJETIVO */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Objetivo del módulo
            </p>
            <h2 className="text-4xl font-black md:text-5xl">
              Introducir al alumno en fundamentos técnicos del trabajo K9.
            </h2>
          </div>

          <div className="space-y-5 text-lg leading-8 text-zinc-300">
            <p>
              Este módulo está orientado a personas que buscan comprender el
              trabajo con perros detectores desde una base técnica, ordenada y
              progresiva.
            </p>
            <p>
              Se recomienda contar con una base previa de manejo canino antes de
              avanzar hacia este tipo de formación especializada.
            </p>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="bg-zinc-950 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Qué incluye
            </p>
            <h2 className="text-4xl font-black md:text-5xl">
              Formación K9 organizada por etapas
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {beneficios.map((item) => (
              <div
                key={item.titulo}
                className="rounded-3xl border border-zinc-800 bg-black p-7"
              >
                <h3 className="text-2xl font-black text-yellow-500">
                  {item.titulo}
                </h3>
                <p className="mt-4 leading-7 text-zinc-300">{item.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENIDO */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
            Programa K9
          </p>
          <h2 className="text-4xl font-black md:text-5xl">
            Qué incluye este módulo
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {contenidos.map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6"
              >
                <p className="text-zinc-300">
                  <span className="font-black text-yellow-500">✓ </span>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ADVERTENCIA PROFESIONAL */}
      <section className="bg-zinc-950 px-6 py-20">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-yellow-500/30 bg-black p-8 md:p-12">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
            Enfoque responsable
          </p>
          <h2 className="text-4xl font-black md:text-5xl">
            Formación técnica con criterio, control y seguridad
          </h2>
          <p className="mt-5 max-w-4xl leading-8 text-zinc-300">
            Este módulo se presenta con fines formativos y profesionales. La
            práctica con perros detectores debe realizarse de forma responsable,
            legal, segura y bajo criterios adecuados de bienestar animal,
            supervisión y control.
          </p>
        </div>
      </section>

      {/* MATERIAL */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-yellow-500/30 bg-gradient-to-br from-zinc-950 to-black p-8 md:p-12">
          <h2 className="text-4xl font-black">Videos y material K9</h2>
          <p className="mt-4 max-w-3xl leading-8 text-zinc-300">
            Esta sección queda preparada para integrar videos de YouTube,
            fragmentos de clases, PDFs del módulo y materiales privados para
            alumnos.
          </p>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-black">
              <div className="flex aspect-video items-center justify-center bg-zinc-900 text-center text-zinc-400">
                Video K9
                <br />
                Próximamente
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-7">
              <h3 className="text-2xl font-black text-yellow-500">
                PDF del módulo
              </h3>
              <p className="mt-3 leading-7 text-zinc-300">
                El material puede entregarse luego de la inscripción o
                integrarse en una futura área privada para alumnos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-yellow-500 px-6 py-20 text-black">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-4xl font-black md:text-6xl">
            Consultá precio, cupos y próximas fechas
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8">
            Completá el formulario de inscripción y se generará un mensaje de
            WhatsApp con tus datos para enviar a SERVICAN.
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