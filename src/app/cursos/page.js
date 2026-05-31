import Link from "next/link";
import { obtenerCursosActivos } from "@/lib/cursosPublicos";

export const dynamic = "force-dynamic";

function construirLinkConsulta(curso) {
  const mensaje = `Hola SERVICAN, quiero consultar por el curso: ${curso.titulo}`;
  return `/inscripcion?curso=${encodeURIComponent(curso.titulo)}&mensaje=${encodeURIComponent(
    mensaje
  )}`;
}

function Badge({ children }) {
  return (
    <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-yellow-300">
      {children}
    </span>
  );
}

export default async function CursosPage() {
  const { cursos, error } = await obtenerCursosActivos();

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-yellow-500/20 bg-black/90">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
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
                Formación y trabajo canino
              </p>
            </div>
          </Link>

          <nav className="hidden gap-6 text-sm font-semibold text-zinc-300 md:flex">
            <Link href="/" className="hover:text-yellow-500">
              Inicio
            </Link>
            <Link href="/#servicios" className="hover:text-yellow-500">
              Servicios
            </Link>
            <Link href="/#contacto" className="hover:text-yellow-500">
              Contacto
            </Link>
          </nav>

          <Link
            href="/inscripcion"
            className="rounded-full bg-yellow-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-yellow-400"
          >
            Consultar
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-zinc-900 px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#3f3210_0%,#111_35%,#000_78%)]" />

        <div className="relative mx-auto max-w-[1450px]">
          <div className="max-w-4xl">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Academia SERVICAN
            </p>

            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              Cursos y programas de formación
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
              Programas de capacitación orientados al trabajo responsable con
              perros, formación de guías, manejo, obediencia y especialización
              en áreas profesionales del mundo canino.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Badge>Formación canina</Badge>
              <Badge>Trabajo guía-perro</Badge>
              <Badge>K9</Badge>
              <Badge>Uruguay</Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1450px]">
          {error && (
            <div className="mb-8 rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
              <p className="font-bold">No se pudieron cargar los cursos.</p>
              <p className="mt-2 text-sm">{error}</p>
            </div>
          )}

          {!error && cursos.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-zinc-950 p-10 text-center">
              <h2 className="text-3xl font-black">
                Todavía no hay cursos activos
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
                Cuando el administrador cree un curso y lo marque como activo,
                aparecerá automáticamente en esta sección.
              </p>

              <Link
                href="/#contacto"
                className="mt-8 inline-block rounded-full bg-yellow-500 px-8 py-4 font-black text-black transition hover:bg-yellow-400"
              >
                Contactar SERVICAN
              </Link>
            </div>
          )}

          {cursos.length > 0 && (
            <>
              <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-500">
                    Programas disponibles
                  </p>

                  <h2 className="mt-2 text-4xl font-black">
                    Cursos activos
                  </h2>
                </div>

                <p className="text-sm text-zinc-400">
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
                            <img
                              src="/logo-servican.jpeg"
                              alt="Logo SERVICAN"
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
                          "Curso de formación SERVICAN. Consultá por información, modalidad y próximos cupos."}
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

                      <div className="mt-7 flex flex-col gap-3">
                        <Link
                          href={`/cursos/${curso.slug}`}
                          className="rounded-full border border-yellow-500 px-6 py-4 text-center font-black text-yellow-500 transition hover:bg-yellow-500 hover:text-black"
                        >
                          Ver información
                        </Link>

                        <Link
                          href={construirLinkConsulta(curso)}
                          className="rounded-full bg-yellow-500 px-6 py-4 text-center font-black text-black transition hover:bg-yellow-400"
                        >
                          Consultar por este curso
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
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

          <Link
            href="/inscripcion"
            className="mt-9 inline-block rounded-full bg-black px-9 py-4 font-black text-white transition hover:bg-zinc-800"
          >
            Hacer una consulta
          </Link>
        </div>
      </section>
    </main>
  );
}