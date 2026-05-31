import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function claseEstado(estado) {
  if (estado === "activo") {
    return "border-green-500/30 bg-green-500/10 text-green-300";
  }

  if (estado === "pendiente") {
    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
  }

  if (estado === "pausado") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }

  if (estado === "finalizado") {
    return "border-zinc-500/30 bg-zinc-500/10 text-zinc-300";
  }

  return "border-red-500/30 bg-red-500/10 text-red-300";
}

function textoEstado(estado) {
  if (estado === "activo") return "Activo";
  if (estado === "pendiente") return "Pendiente";
  if (estado === "pausado") return "Pausado";
  if (estado === "finalizado") return "Finalizado";
  if (estado === "cancelado") return "Cancelado";
  return estado || "Sin estado";
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  return {
    title: `Curso privado | SERVICAN`,
    description: `Acceso privado al curso ${slug} en SERVICAN.`,
  };
}

export default async function CursoPrivadoPage({ params }) {
  const { slug } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/panel/cursos/${slug}`);
  }

  const { data: perfil, error: errorPerfil } = await supabase
    .from("perfiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (errorPerfil || !perfil) {
    redirect("/acceso-denegado");
  }

  const { data: curso, error: errorCurso } = await supabase
    .from("cursos")
    .select("*")
    .eq("slug", slug)
    .single();

  if (errorCurso || !curso) {
    notFound();
  }

  const esAdmin = perfil.role === "admin";
  const esInstructor = perfil.role === "instructor";

  const { data: acceso, error: errorAcceso } = await supabase
    .from("alumno_cursos")
    .select("*")
    .eq("user_id", user.id)
    .eq("curso_id", curso.id)
    .maybeSingle();

  const tieneAccesoActivo = acceso?.estado === "activo";

  if (!esAdmin && !esInstructor && !tieneAccesoActivo) {
    redirect("/panel");
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl md:flex-row md:items-center md:justify-between">
          <Link href="/panel" className="flex items-center gap-4">
            <img
              src="/logo-servican.jpeg"
              alt="Logo SERVICAN"
              className="h-16 w-16 rounded-full object-cover ring-4 ring-yellow-500/30"
            />

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                SERVICAN
              </p>

              <h1 className="text-3xl font-bold">
                Aula privada
              </h1>

              <p className="mt-1 text-sm text-neutral-300">
                {perfil?.email || user?.email}
              </p>
            </div>
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/panel"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Volver al panel
            </Link>

            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className="w-full rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </header>

        <section className="mb-8 overflow-hidden rounded-3xl border border-yellow-500/20 bg-white/5 shadow-2xl">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 md:p-10">
              <div className="mb-5 flex flex-wrap gap-3">
                <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-yellow-300">
                  Curso privado
                </span>

                {acceso?.estado && (
                  <span
                    className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide ${claseEstado(
                      acceso.estado
                    )}`}
                  >
                    {textoEstado(acceso.estado)}
                  </span>
                )}

                {esAdmin && (
                  <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-yellow-300">
                    Vista admin
                  </span>
                )}

                {esInstructor && (
                  <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-blue-300">
                    Vista instructor
                  </span>
                )}
              </div>

              <h2 className="text-4xl font-black md:text-6xl">
                {curso.titulo}
              </h2>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-300">
                {curso.descripcion ||
                  "Contenido privado del curso SERVICAN. En esta sección se cargarán módulos, clases, videos, PDFs y materiales de apoyo."}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-neutral-950 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                    Categoría
                  </p>
                  <p className="mt-1 font-bold text-yellow-400">
                    {curso.categoria || "Formación"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-neutral-950 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                    Modalidad
                  </p>
                  <p className="mt-1 font-bold text-yellow-400">
                    {curso.modalidad || "A definir"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-neutral-950 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                    Duración
                  </p>
                  <p className="mt-1 font-bold text-yellow-400">
                    {curso.duracion || "A definir"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-neutral-950 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                    Estado
                  </p>
                  <p className="mt-1 font-bold text-yellow-400">
                    {textoEstado(acceso?.estado || "activo")}
                  </p>
                </div>
              </div>
            </div>

            <div className="min-h-[320px] bg-neutral-900">
              {curso.imagen_url ? (
                <img
                  src={curso.imagen_url}
                  alt={curso.titulo}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[320px] items-center justify-center bg-gradient-to-br from-neutral-900 via-black to-neutral-950">
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
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
              Progreso
            </p>

            <h3 className="mt-3 text-2xl font-bold">
              Estado del curso
            </h3>

            <div className="mt-6 rounded-2xl border border-white/10 bg-neutral-950 p-5">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-neutral-400">Avance</span>
                <span className="font-bold text-yellow-400">0%</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-neutral-800">
                <div className="h-full w-0 rounded-full bg-yellow-500" />
              </div>

              <p className="mt-4 text-sm leading-6 text-neutral-400">
                El progreso se conectará más adelante cuando creemos clases,
                materiales y seguimiento por alumno.
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-neutral-950 p-5">
              <p className="text-sm font-bold text-white">
                Próximas funciones
              </p>

              <ul className="mt-3 space-y-2 text-sm text-neutral-400">
                <li>• Módulos del curso</li>
                <li>• Clases con video</li>
                <li>• PDFs descargables</li>
                <li>• Estado de clase completada</li>
                <li>• Certificado final</li>
              </ul>
            </div>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                Contenido
              </p>

              <h3 className="mt-3 text-3xl font-bold">
                Módulos y clases
              </h3>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-300">
                Esta es la estructura base del aula. En el próximo bloque vamos
                a crear las tablas para cargar módulos, clases, videos de
                YouTube, archivos PDF y materiales desde el panel admin.
              </p>
            </div>

            <div className="space-y-4">
              <article className="rounded-3xl border border-white/10 bg-neutral-950 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.25em] text-yellow-400">
                      Módulo 1
                    </p>

                    <h4 className="mt-2 text-2xl font-bold">
                      Introducción al curso
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-neutral-400">
                      Espacio reservado para la primera clase, presentación,
                      objetivos y materiales iniciales.
                    </p>
                  </div>

                  <button
                    disabled
                    className="rounded-2xl bg-neutral-800 px-5 py-3 text-sm font-bold text-neutral-500"
                  >
                    Próximamente
                  </button>
                </div>
              </article>

              <article className="rounded-3xl border border-white/10 bg-neutral-950 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.25em] text-yellow-400">
                      Módulo 2
                    </p>

                    <h4 className="mt-2 text-2xl font-bold">
                      Materiales y clases
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-neutral-400">
                      Más adelante se cargarán videos, PDFs, ejercicios y
                      recursos privados para alumnos habilitados.
                    </p>
                  </div>

                  <button
                    disabled
                    className="rounded-2xl bg-neutral-800 px-5 py-3 text-sm font-bold text-neutral-500"
                  >
                    Próximamente
                  </button>
                </div>
              </article>
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}