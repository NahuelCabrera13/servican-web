import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerCursoPorSlug } from "@/lib/cursosPublicos";

export const dynamic = "force-dynamic";

function construirLinkConsulta(curso) {
  const mensaje = `Hola SERVICAN, quiero consultar por el curso: ${curso.titulo}`;

  return `/inscripcion?curso=${encodeURIComponent(
    curso.titulo
  )}&mensaje=${encodeURIComponent(mensaje)}`;
}

function Badge({ children }) {
  if (!children) return null;

  return (
    <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-yellow-300">
      {children}
    </span>
  );
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { curso } = await obtenerCursoPorSlug(slug);

  if (!curso) {
    return {
      title: "Curso no encontrado | SERVICAN",
    };
  }

  return {
    title: `${curso.titulo} | SERVICAN`,
    description:
      curso.descripcion ||
      "Curso de formación canina de SERVICAN en Uruguay.",
  };
}

export default async function CursoDetallePage({ params }) {
  const { slug } = await params;
  const { curso } = await obtenerCursoPorSlug(slug);

  if (!curso) {
    notFound();
  }

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
            <Link href="/cursos" className="hover:text-yellow-500">
              Cursos
            </Link>
            <Link href="/#contacto" className="hover:text-yellow-500">
              Contacto
            </Link>
          </nav>

          <Link
            href={construirLinkConsulta(curso)}
            className="rounded-full bg-yellow-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-yellow-400"
          >
            Consultar
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-zinc-900 px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#3f3210_0%,#111_35%,#000_78%)]" />

        <div className="relative mx-auto grid max-w-[1450px] gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="mb-5 flex flex-wrap gap-3">
              <Badge>{curso.categoria}</Badge>
              <Badge>{curso.modalidad}</Badge>
              {curso.destacado && <Badge>Destacado</Badge>}
            </div>

            <p className="mb-4 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Curso SERVICAN
            </p>

            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              {curso.titulo}
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
              {curso.descripcion ||
                "Curso de formación SERVICAN. Consultá por información, modalidad, cupos disponibles y próximos comienzos."}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href={construirLinkConsulta(curso)}
                className="rounded-full bg-yellow-500 px-9 py-4 text-center font-black text-black transition hover:bg-yellow-400"
              >
                Consultar por este curso
              </Link>

              <Link
                href="/cursos"
                className="rounded-full border border-yellow-500 px-9 py-4 text-center font-black text-yellow-500 transition hover:bg-yellow-500 hover:text-black"
              >
                Ver todos los cursos
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-yellow-500/30 bg-zinc-950 shadow-2xl">
            <div className="aspect-[16/11] bg-zinc-900">
              {curso.imagen_url ? (
                <img
                  src={curso.imagen_url}
                  alt={curso.titulo}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-zinc-950">
                  <div className="text-center">
                    <img
                      src="/logo-servican.jpeg"
                      alt="Logo SERVICAN"
                      className="mx-auto h-28 w-28 rounded-full object-contain opacity-90"
                    />

                    <p className="mt-5 text-sm font-bold uppercase tracking-[0.3em] text-yellow-500">
                      SERVICAN
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 p-5">
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

              <div className="rounded-2xl border border-white/10 bg-black p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                  Modalidad
                </p>
                <p className="mt-1 font-black text-yellow-500">
                  {curso.modalidad || "A definir"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                  Categoría
                </p>
                <p className="mt-1 font-black text-yellow-500">
                  {curso.categoria || "Formación"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1450px] gap-8 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
              Objetivo
            </p>

            <h2 className="text-3xl font-black">
              Formación clara y progresiva
            </h2>

            <p className="mt-4 leading-8 text-zinc-300">
              El objetivo del curso es brindar una base ordenada para que el
              alumno pueda avanzar con seguridad, criterio y responsabilidad en
              el trabajo con perros.
            </p>
          </div>

          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
              Modalidad
            </p>

            <h2 className="text-3xl font-black">
              Acompañamiento SERVICAN
            </h2>

            <p className="mt-4 leading-8 text-zinc-300">
              La modalidad puede variar según el curso, cupos y etapa de
              formación. Consultá para recibir información actualizada y
              personalizada.
            </p>
          </div>

          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
              Inscripción
            </p>

            <h2 className="text-3xl font-black">
              Consultá disponibilidad
            </h2>

            <p className="mt-4 leading-8 text-zinc-300">
              Enviá tu consulta para recibir detalles, próximas fechas,
              requisitos y orientación sobre si este curso es adecuado para tu
              objetivo.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-yellow-500 px-4 py-20 text-black sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-4xl font-black md:text-6xl">
            ¿Querés consultar por este curso?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8">
            Completá la consulta y SERVICAN se pondrá en contacto para
            orientarte sobre modalidad, disponibilidad y próximos pasos.
          </p>

          <Link
            href={construirLinkConsulta(curso)}
            className="mt-9 inline-block rounded-full bg-black px-9 py-4 font-black text-white transition hover:bg-zinc-800"
          >
            Consultar ahora
          </Link>
        </div>
      </section>
    </main>
  );
}