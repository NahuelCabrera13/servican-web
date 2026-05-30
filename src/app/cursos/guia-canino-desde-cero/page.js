export default function CursoGuiaCanino() {
  const whatsapp = "59898188257";

  const linkWhatsApp = (mensaje) =>
    `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensaje)}`;

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-yellow-500/20 bg-black px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
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
            href={linkWhatsApp(
              "Hola SERVICAN, quiero consultar por el Curso Básico Integral para Guías Caninos"
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-yellow-500 px-5 py-3 text-sm font-black text-black hover:bg-yellow-400"
          >
            Consultar
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#3f3210_0%,#111_38%,#000_80%)]" />

        <div className="relative mx-auto max-w-6xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
            Curso desde cero
          </p>

          <h1 className="max-w-5xl text-5xl font-black leading-tight md:text-7xl">
            Curso Básico Integral para Guías Caninos
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
            Formación inicial para aprender manejo, comunicación, obediencia
            básica, bienestar, vínculo guía-perro y preparación para avanzar a
            módulos profesionales.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href={linkWhatsApp(
                "Hola SERVICAN, quiero inscribirme al Curso Básico Integral para Guías Caninos"
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-yellow-500 px-8 py-4 text-center font-black text-black hover:bg-yellow-400"
            >
              Inscribirme
            </a>

            <a
              href="/"
              className="rounded-full border border-yellow-500 px-8 py-4 text-center font-black text-yellow-500 hover:bg-yellow-500 hover:text-black"
            >
              Volver al inicio
            </a>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7">
            <h2 className="text-2xl font-black text-yellow-500">
              Objetivo del curso
            </h2>
            <p className="mt-4 leading-7 text-zinc-300">
              Darle al alumno una base clara para comprender al perro, manejarlo
              de forma segura, construir vínculo y comenzar un proceso de
              formación responsable.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7">
            <h2 className="text-2xl font-black text-yellow-500">
              Modalidad
            </h2>
            <p className="mt-4 leading-7 text-zinc-300">
              Puede adaptarse a modalidad presencial, online o mixta. Los cupos,
              fechas y precios se consultan directamente por WhatsApp.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7">
            <h2 className="text-2xl font-black text-yellow-500">
              Material incluido
            </h2>
            <p className="mt-4 leading-7 text-zinc-300">
              Material PDF, recursos de apoyo, explicaciones por módulos y
              posibilidad de incorporar videos dentro de la plataforma.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
            Contenido
          </p>
          <h2 className="text-4xl font-black md:text-5xl">
            Qué vas a aprender
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              "Comunicación y lectura corporal canina.",
              "Manejo seguro del perro en distintos contextos.",
              "Obediencia básica y construcción del vínculo.",
              "Bienestar animal, motivación y trabajo progresivo.",
              "Errores comunes del guía principiante.",
              "Base necesaria para avanzar a módulos K9.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-zinc-800 bg-black p-6"
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

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-yellow-500/30 bg-gradient-to-br from-zinc-950 to-black p-8 md:p-12">
          <h2 className="text-4xl font-black">Videos y material del curso</h2>
          <p className="mt-4 max-w-3xl leading-8 text-zinc-300">
            En esta sección luego podemos insertar videos de YouTube no listados
            y enlaces a los PDFs del curso para alumnos.
          </p>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-black">
              <div className="flex aspect-video items-center justify-center bg-zinc-900 text-center text-zinc-400">
                Video del curso
                <br />
                Próximamente
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-7">
              <h3 className="text-2xl font-black text-yellow-500">
                PDF del curso
              </h3>
              <p className="mt-3 text-zinc-300">
                Acá vamos a colocar el material descargable o privado según la
                etapa del proyecto.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-yellow-500 px-6 py-16 text-black">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-4xl font-black md:text-5xl">
            Consultá precio, cupos y fechas
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg">
            Escribinos por WhatsApp para recibir información actualizada sobre
            modalidad, costo, materiales incluidos e inscripción.
          </p>

          <a
            href={linkWhatsApp(
              "Hola SERVICAN, quiero consultar precio, cupos y fechas del Curso Básico Integral"
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full bg-black px-9 py-4 font-black text-white hover:bg-zinc-800"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}