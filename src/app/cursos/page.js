import Image from "next/image";
import Link from "next/link";
import HeaderAcceso from "../components/HeaderAcceso";
import { obtenerCursosActivos } from "@/lib/cursosPublicos";

export const dynamic = "force-dynamic";

const whatsapp = "59898188257";

function construirLinkConsulta(curso) {
  const mensaje = `Hola SERVICAN, quiero consultar por el curso: ${curso.titulo}`;

  return `/inscripcion?curso=${encodeURIComponent(
    curso.titulo
  )}&mensaje=${encodeURIComponent(mensaje)}`;
}

function construirLinkWhatsApp(curso) {
  const mensaje = curso
    ? `Hola SERVICAN, quiero consultar por el curso: ${curso.titulo}`
    : "Hola SERVICAN, quiero consultar por los cursos disponibles.";

  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

function Badge({ children }) {
  return (
    <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-yellow-300">
      {children}
    </span>
  );
}

function InfoCard({ titulo, texto, icono }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-black p-7 transition hover:border-yellow-500/60">
      <p className="mb-4 text-4xl">{icono}</p>

      <h3 className="text-xl font-black text-yellow-500">{titulo}</h3>

      <p className="mt-3 leading-7 text-zinc-300">{texto}</p>
    </div>
  );
}

export default async function CursosPage() {
  const { cursos, error } = await obtenerCursosActivos();

  const beneficios = [
    {
      titulo: "Formación guiada",
      texto: "Programas pensados para avanzar con estructura, objetivos claros y acompañamiento de SERVICAN.",
      icono: "🎓",
    },
    {
      titulo: "Enfoque práctico",
      texto: "Contenidos orientados al trabajo real con perros, manejo, obediencia, conducta y vínculo guía-perro.",
      icono: "🐕",
    },
    {
      titulo: "Acceso privado",
      texto: "Cuando la inscripción es confirmada, el alumno puede ingresar a su panel y ver sus cursos habilitados.",
      icono: "🔐",
    },
    {
      titulo: "Certificación",
      texto: "Los cursos pueden contar con certificado privado y verificación pública mediante código único.",
      icono: "✅",
    },
  ];

  const pasos = [
    {
      numero: "01",
      titulo: "Elegís el curso",
      texto: "Revisás los cursos disponibles y consultás por el programa que más se ajuste a tu objetivo.",
    },
    {
      numero: "02",
      titulo: "Enviás la consulta",
      texto: "Podés consultar desde el formulario de inscripción o directamente por WhatsApp.",
    },
    {
      numero: "03",
      titulo: "SERVICAN confirma",
      texto: "La empresa confirma cupos, modalidad, pago o inscripción según corresponda.",
    },
    {
      numero: "04",
      titulo: "Se habilita el acceso",
      texto: "El administrador habilita manualmente el curso en tu panel privado de alumno.",
    },
  ];

  const preguntas = [
    {
      pregunta: "¿Crear una cuenta habilita automáticamente un curso?",
      respuesta:
        "No. El alumno puede registrarse, pero los cursos pagos o privados se habilitan manualmente desde el panel de administración cuando SERVICAN confirma inscripción o pago.",
    },
    {
      pregunta: "¿Puedo consultar antes de inscribirme?",
      respuesta:
        "Sí. Podés enviar una consulta general o consultar por un curso específico antes de confirmar la inscripción.",
    },
    {
      pregunta: "¿Dónde veo mis cursos después de inscribirme?",
      respuesta:
        "Cuando SERVICAN habilite tu acceso, vas a poder entrar desde la página principal usando el botón “Entrar a mi panel”.",
    },
    {
      pregunta: "¿Los cursos pueden tener certificado?",
      respuesta:
        "Sí. La plataforma permite emitir certificados privados para alumnos y verificar públicamente su validez mediante un código único.",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-yellow-500/20 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3">
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
                Formación y trabajo canino
              </p>
            </div>
          </Link>

          <nav className="hidden gap-6 text-sm font-semibold text-zinc-300 lg:flex">
            <Link href="/" className="hover:text-yellow-500">
              Inicio
            </Link>

            <Link href="/#quienes-somos" className="hover:text-yellow-500">
              Quiénes somos
            </Link>

            <Link href="/#perros" className="hover:text-yellow-500">
              Nuestros perros
            </Link>

            <Link href="/#servicios" className="hover:text-yellow-500">
              Servicios
            </Link>

            <Link href="/verificar-certificado" className="hover:text-yellow-500">
              Verificar certificado
            </Link>

            <Link href="/#contacto" className="hover:text-yellow-500">
              Contacto
            </Link>
          </nav>

          <HeaderAcceso />
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-zinc-900 px-4 py-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#3f3210_0%,#111_34%,#000_78%)]" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black to-transparent" />

        <div className="relative mx-auto grid max-w-[1450px] gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Academia SERVICAN
            </p>

            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              Cursos y programas de formación canina
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
              Programas orientados al trabajo responsable con perros, formación
              de guías, manejo, obediencia, vínculo, control y especialización
              en áreas profesionales del mundo canino.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Badge>Formación canina</Badge>
              <Badge>Trabajo guía-perro</Badge>
              <Badge>K9</Badge>
              <Badge>Uruguay</Badge>
              <Badge>Acceso privado</Badge>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#cursos-disponibles"
                className="rounded-full bg-yellow-500 px-8 py-4 text-center font-black text-black transition hover:bg-yellow-400"
              >
                Ver cursos disponibles
              </a>

              <Link
                href="/inscripcion"
                className="rounded-full border border-yellow-500 bg-black/40 px-8 py-4 text-center font-black text-yellow-500 transition hover:bg-yellow-500 hover:text-black"
              >
                Hacer consulta
              </Link>

              <a
                href={construirLinkWhatsApp()}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 bg-white/10 px-8 py-4 text-center font-black text-white transition hover:bg-white hover:text-black"
              >
                WhatsApp
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-yellow-500/25 bg-black/60 p-6 shadow-2xl backdrop-blur-md md:p-8">
            <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-zinc-800 bg-zinc-950">
              <Image
                src="/fotos/galeria-entrenamiento-control-malinois.webp"
                alt="Entrenamiento canino SERVICAN"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-400">
                  Plataforma privada
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  Formación con acceso controlado
                </h2>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black text-yellow-500">
                  {cursos?.length || 0}
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  Cursos activos
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black text-yellow-500">100%</p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  Acceso privado
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black text-yellow-500">PRO</p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  Enfoque serio
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-900 bg-zinc-950 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1450px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Qué ofrece la formación
            </p>

            <h2 className="text-4xl font-black md:text-5xl">
              Una experiencia pensada para avanzar con orden
            </h2>

            <p className="mt-4 leading-8 text-zinc-300">
              La academia SERVICAN combina contenido, práctica, seguimiento y
              acceso privado para que cada alumno pueda avanzar dentro de una
              plataforma clara y organizada.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {beneficios.map((item) => (
              <InfoCard
                key={item.titulo}
                titulo={item.titulo}
                texto={item.texto}
                icono={item.icono}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        id="cursos-disponibles"
        className="px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-[1450px]">
          {error && (
            <div className="mb-8 rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
              <p className="font-bold">No se pudieron cargar los cursos.</p>
              <p className="mt-2 text-sm">{error}</p>
            </div>
          )}

          {!error && cursos.length === 0 && (
            <div className="rounded-[2rem] border border-white/10 bg-zinc-950 p-10 text-center shadow-2xl">
              <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
                Cursos disponibles
              </p>

              <h2 className="text-4xl font-black">
                Todavía no hay cursos activos
              </h2>

              <p className="mx-auto mt-4 max-w-2xl leading-8 text-zinc-400">
                Cuando el administrador cree un curso y lo marque como activo,
                aparecerá automáticamente en esta sección.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/#contacto"
                  className="rounded-full bg-yellow-500 px-8 py-4 font-black text-black transition hover:bg-yellow-400"
                >
                  Contactar SERVICAN
                </Link>

                <a
                  href={construirLinkWhatsApp()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-yellow-500 px-8 py-4 font-black text-yellow-500 transition hover:bg-yellow-500 hover:text-black"
                >
                  Consultar por WhatsApp
                </a>
              </div>
            </div>
          )}

          {cursos.length > 0 && (
            <>
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-500">
                    Programas disponibles
                  </p>

                  <h2 className="mt-2 text-4xl font-black md:text-5xl">
                    Cursos activos
                  </h2>

                  <p className="mt-4 max-w-2xl leading-8 text-zinc-400">
                    Estos son los cursos publicados actualmente por SERVICAN. El
                    acceso privado se habilita manualmente después de confirmar
                    la inscripción.
                  </p>
                </div>

                <p className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-zinc-300">
                  Mostrando {cursos.length} curso
                  {cursos.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {cursos.map((curso) => (
                  <article
                    key={curso.id}
                    className="group overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 shadow-2xl transition hover:-translate-y-1 hover:border-yellow-500/50"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                      {curso.imagen_url ? (
                        <img
                          src={curso.imagen_url}
                          alt={curso.titulo}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-zinc-950">
                          <div className="text-center">
                            <Image
                              src="/logo-servican.jpeg"
                              alt="Logo SERVICAN"
                              width={96}
                              height={96}
                              className="mx-auto h-24 w-24 rounded-full object-contain opacity-80"
                            />

                            <p className="mt-4 text-sm font-bold uppercase tracking-[0.3em] text-yellow-500">
                              SERVICAN
                            </p>
                          </div>
                        </div>
                      )}

                      {curso.destacado && (
                        <div className="absolute left-4 top-4 rounded-full bg-yellow-500 px-4 py-2 text-xs font-black uppercase tracking-wide text-black">
                          Destacado
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>

                    <div className="p-7">
                      <div className="mb-4 flex flex-wrap gap-2">
                        {curso.categoria && <Badge>{curso.categoria}</Badge>}
                        {curso.modalidad && <Badge>{curso.modalidad}</Badge>}
                      </div>

                      <h3 className="text-3xl font-black text-white">
                        {curso.titulo}
                      </h3>

                      <p className="mt-4 min-h-24 leading-7 text-zinc-300">
                        {curso.descripcion ||
                          "Curso de formación SERVICAN. Consultá por información, modalidad, contenidos y próximos cupos."}
                      </p>

                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-black p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                            Precio
                          </p>
                          <p className="mt-1 font-black text-yellow-500">
                            {curso.precio || "Consultar"}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                            Duración
                          </p>
                          <p className="mt-1 font-black text-yellow-500">
                            {curso.duracion || "A definir"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm leading-6 text-yellow-100">
                        Registrarte no habilita este curso automáticamente. El
                        acceso lo activa SERVICAN después de confirmar la
                        inscripción o el pago.
                      </div>

                      <div className="mt-7 flex flex-col gap-3">
                        <Link
                          href={`/cursos/${curso.slug}`}
                          className="rounded-full border border-yellow-500 px-6 py-4 text-center font-black text-yellow-500 transition hover:bg-yellow-500 hover:text-black"
                        >
                          Ver información completa
                        </Link>

                        <Link
                          href={construirLinkConsulta(curso)}
                          className="rounded-full bg-yellow-500 px-6 py-4 text-center font-black text-black transition hover:bg-yellow-400"
                        >
                          Consultar por este curso
                        </Link>

                        <a
                          href={construirLinkWhatsApp(curso)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-white/15 bg-white/5 px-6 py-4 text-center font-black text-white transition hover:bg-white hover:text-black"
                        >
                          WhatsApp directo
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="border-y border-zinc-900 bg-zinc-950 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1450px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Proceso de inscripción
            </p>

            <h2 className="text-4xl font-black md:text-5xl">
              Cómo se habilita un curso
            </h2>

            <p className="mt-4 leading-8 text-zinc-300">
              La plataforma está pensada para que cualquier persona pueda crear
              su cuenta, pero los cursos privados se habilitan manualmente por
              administración.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {pasos.map((paso) => (
              <div
                key={paso.numero}
                className="rounded-3xl border border-zinc-800 bg-black p-7 transition hover:border-yellow-500/60"
              >
                <p className="text-4xl font-black text-yellow-500">
                  {paso.numero}
                </p>

                <h3 className="mt-5 text-xl font-black text-white">
                  {paso.titulo}
                </h3>

                <p className="mt-3 leading-7 text-zinc-300">{paso.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1450px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Preguntas frecuentes
            </p>

            <h2 className="text-4xl font-black md:text-5xl">
              Dudas comunes sobre cursos y acceso
            </h2>

            <p className="mt-5 leading-8 text-zinc-300">
              Esta sección ayuda a que el alumno entienda cómo funciona el
              registro, la inscripción, el acceso privado y los certificados.
            </p>

            <div className="mt-8 rounded-[2rem] border border-yellow-500/25 bg-yellow-500/10 p-6">
              <h3 className="text-2xl font-black text-yellow-400">
                Importante
              </h3>

              <p className="mt-3 leading-7 text-yellow-100">
                Crear una cuenta de alumno no habilita automáticamente cursos
                pagos. SERVICAN debe confirmar la inscripción y luego activar el
                acceso desde el panel de administración.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {preguntas.map((item) => (
              <div
                key={item.pregunta}
                className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6"
              >
                <h3 className="text-xl font-black text-yellow-500">
                  {item.pregunta}
                </h3>

                <p className="mt-3 leading-7 text-zinc-300">{item.respuesta}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-yellow-500 px-4 py-20 text-black sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-4xl font-black md:text-6xl">
            ¿No sabés qué curso elegir?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8">
            Contactá con SERVICAN y te orientamos según tu objetivo, experiencia
            y el tipo de trabajo que quieras desarrollar con tu perro.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/inscripcion"
              className="rounded-full bg-black px-9 py-4 font-black text-white transition hover:bg-zinc-800"
            >
              Hacer una consulta
            </Link>

            <a
              href={construirLinkWhatsApp()}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-black px-9 py-4 font-black text-black transition hover:bg-black hover:text-white"
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

        <p className="mt-2 text-zinc-500">Formación y trabajo canino</p>

        <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm font-semibold text-zinc-400">
          <Link href="/" className="hover:text-yellow-500">
            Inicio
          </Link>

          <Link href="/cursos" className="hover:text-yellow-500">
            Cursos
          </Link>

          <Link href="/verificar-certificado" className="hover:text-yellow-500">
            Verificar certificado
          </Link>

          <Link href="/inscripcion" className="hover:text-yellow-500">
            Consulta
          </Link>
        </div>

        <p className="mt-4 text-sm text-zinc-600">
          © 2026 SERVICAN. Todos los derechos reservados.
        </p>
      </footer>
    </main>
  );
}