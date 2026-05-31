import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BotonCompletarClase from "./BotonCompletarClase";

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

function obtenerEmbedYoutube(url) {
  if (!url) return "";

  try {
    const urlObj = new URL(url);

    if (urlObj.hostname.includes("youtube.com")) {
      const videoId = urlObj.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (urlObj.hostname.includes("youtu.be")) {
      const videoId = urlObj.pathname.replace("/", "");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return url;
  } catch (error) {
    return "";
  }
}

function aplanarClases(modulos) {
  return modulos.flatMap((modulo) =>
    modulo.clases.map((clase) => ({
      ...clase,
      modulo_id: modulo.id,
      modulo_titulo: modulo.titulo,
      modulo_orden: modulo.orden,
    }))
  );
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

  const { data: acceso } = await supabase
    .from("alumno_cursos")
    .select("*")
    .eq("user_id", user.id)
    .eq("curso_id", curso.id)
    .maybeSingle();

  const tieneAccesoActivo = acceso?.estado === "activo";

  if (!esAdmin && !esInstructor && !tieneAccesoActivo) {
    redirect("/panel");
  }

  const { data: modulos, error: errorModulos } = await supabase
    .from("curso_modulos")
    .select(`
      id,
      titulo,
      descripcion,
      orden,
      activo,
      clases:curso_clases (
        id,
        titulo,
        descripcion,
        video_url,
        pdf_url,
        contenido,
        orden,
        activo
      )
    `)
    .eq("curso_id", curso.id)
    .eq("activo", true)
    .order("orden", { ascending: true })
    .order("orden", {
      referencedTable: "curso_clases",
      ascending: true,
    });

  const modulosVisibles = (modulos || []).map((modulo) => ({
    ...modulo,
    clases: (modulo.clases || []).filter((clase) => clase.activo),
  }));

  const clasesOrdenadas = aplanarClases(modulosVisibles);

  const { data: progreso } = await supabase
    .from("clase_progreso")
    .select("clase_id, completada")
    .eq("user_id", user.id);

  const clasesCompletadas = new Set(
    (progreso || [])
      .filter((item) => item.completada)
      .map((item) => item.clase_id)
  );

  const totalClases = clasesOrdenadas.length;
  const totalCompletadas = clasesOrdenadas.filter((clase) =>
    clasesCompletadas.has(clase.id)
  ).length;

  const porcentaje =
    totalClases > 0 ? Math.round((totalCompletadas / totalClases) * 100) : 0;

  const cursoCompletado = totalClases > 0 && totalCompletadas === totalClases;

  const { data: certificado } = await supabase
  .from("certificados")
  .select("*")
  .eq("user_id", user.id)
  .eq("curso_id", curso.id)
  .maybeSingle();

  function obtenerEstadoClase(claseId) {
    const indice = clasesOrdenadas.findIndex((clase) => clase.id === claseId);

    const completada = clasesCompletadas.has(claseId);

    if (completada) {
      return {
        completada: true,
        bloqueada: false,
        texto: "Completada",
        claseBadge:
          "border-green-500/30 bg-green-500/10 text-green-300",
      };
    }

    if (indice === 0) {
      return {
        completada: false,
        bloqueada: false,
        texto: "Disponible",
        claseBadge:
          "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
      };
    }

    const claseAnterior = clasesOrdenadas[indice - 1];
    const anteriorCompletada = clasesCompletadas.has(claseAnterior?.id);

    if (anteriorCompletada) {
      return {
        completada: false,
        bloqueada: false,
        texto: "Disponible",
        claseBadge:
          "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
      };
    }

    return {
      completada: false,
      bloqueada: true,
      texto: "Bloqueada",
      claseBadge:
        "border-neutral-500/30 bg-neutral-500/10 text-neutral-400",
    };
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

              <h1 className="text-3xl font-bold">Aula privada</h1>

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

                {cursoCompletado && (
                  <span className="rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-green-300">
                    Curso completado
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
                    Módulos
                  </p>
                  <p className="mt-1 font-bold text-yellow-400">
                    {modulosVisibles.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-neutral-950 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                    Clases
                  </p>
                  <p className="mt-1 font-bold text-yellow-400">
                    {totalClases}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-neutral-950 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                    Completadas
                  </p>
                  <p className="mt-1 font-bold text-green-400">
                    {totalCompletadas}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-neutral-950 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                    Progreso
                  </p>
                  <p className="mt-1 font-bold text-yellow-400">
                    {porcentaje}%
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

            <h3 className="mt-3 text-2xl font-bold">Estado del curso</h3>

            <div className="mt-6 rounded-2xl border border-white/10 bg-neutral-950 p-5">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-neutral-400">Avance</span>
                <span className="font-bold text-yellow-400">
                  {porcentaje}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="h-full rounded-full bg-yellow-500 transition-all"
                  style={{ width: `${porcentaje}%` }}
                />
              </div>

              <p className="mt-4 text-sm leading-6 text-neutral-400">
                Completaste {totalCompletadas} de {totalClases} clase
                {totalClases === 1 ? "" : "s"}.
              </p>
            </div>

{cursoCompletado && (
  <div className="mt-5 rounded-2xl border border-green-500/30 bg-green-500/10 p-5">
    <p className="text-sm font-bold text-green-300">
      Curso finalizado
    </p>

    <p className="mt-2 text-sm leading-6 text-green-100">
      Ya completaste todas las clases de este curso.
    </p>

    {certificado ? (
      <Link
        href={`/panel/certificados/${certificado.codigo}`}
        className="mt-4 inline-block rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-bold text-neutral-950 transition hover:bg-yellow-400"
      >
        Ver certificado
      </Link>
    ) : (
      <p className="mt-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-100">
        El certificado se generará automáticamente al completar la última clase.
        Tocá actualizar si acabás de finalizar el curso.
      </p>
    )}
  </div>
)}

            <div className="mt-5 rounded-2xl border border-white/10 bg-neutral-950 p-5">
              <p className="text-sm font-bold text-white">
                Reglas del curso
              </p>

              <ul className="mt-3 space-y-2 text-sm text-neutral-400">
                <li>• Las clases se desbloquean en orden.</li>
                <li>• Para avanzar, completá la clase anterior.</li>
                <li>• Al finalizar todo el curso, se habilitará certificado.</li>
              </ul>
            </div>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                Contenido
              </p>

              <h3 className="mt-3 text-3xl font-bold">Módulos y clases</h3>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-300">
                Las clases se desbloquean de forma progresiva. Para acceder a la
                siguiente clase, primero tenés que completar la anterior.
              </p>
            </div>

            {errorModulos && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                No se pudieron cargar los módulos: {errorModulos.message}
              </div>
            )}

            {!errorModulos && modulosVisibles.length === 0 && (
              <div className="rounded-3xl border border-white/10 bg-neutral-950 p-8 text-center">
                <h4 className="text-2xl font-bold">
                  Todavía no hay módulos cargados
                </h4>

                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
                  Este curso ya tiene aula privada, pero todavía no tiene
                  módulos ni clases activas. Cuando el administrador cargue
                  contenido, aparecerá en esta sección.
                </p>
              </div>
            )}

            {!errorModulos && modulosVisibles.length > 0 && (
              <div className="space-y-5">
                {modulosVisibles.map((modulo) => (
                  <article
                    key={modulo.id}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-neutral-950"
                  >
                    <div className="border-b border-white/10 bg-white/[0.03] p-5">
                      <p className="text-sm font-bold uppercase tracking-[0.25em] text-yellow-400">
                        Módulo {modulo.orden}
                      </p>

                      <h4 className="mt-2 text-2xl font-bold">
                        {modulo.titulo}
                      </h4>

                      {modulo.descripcion && (
                        <p className="mt-2 text-sm leading-6 text-neutral-400">
                          {modulo.descripcion}
                        </p>
                      )}
                    </div>

                    {modulo.clases.length === 0 ? (
                      <div className="p-5 text-sm text-neutral-400">
                        Este módulo todavía no tiene clases activas.
                      </div>
                    ) : (
                      <div className="divide-y divide-white/10">
                        {modulo.clases.map((clase) => {
                          const estadoClase = obtenerEstadoClase(clase.id);
                          const videoEmbed = obtenerEmbedYoutube(
                            clase.video_url
                          );

                          return (
                            <div
                              key={clase.id}
                              className={`p-5 ${
                                estadoClase.bloqueada
                                  ? "opacity-60"
                                  : ""
                              }`}
                            >
                              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-500">
                                    Clase {clase.orden}
                                  </p>

                                  <h5 className="mt-2 text-xl font-bold">
                                    {clase.titulo}
                                  </h5>

                                  {clase.descripcion && (
                                    <p className="mt-2 text-sm leading-6 text-neutral-400">
                                      {clase.descripcion}
                                    </p>
                                  )}
                                </div>

                                <span
                                  className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${estadoClase.claseBadge}`}
                                >
                                  {estadoClase.texto}
                                </span>
                              </div>

                              {!estadoClase.bloqueada && videoEmbed && (
                                <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black">
                                  <iframe
                                    src={videoEmbed}
                                    title={clase.titulo}
                                    className="aspect-video w-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                </div>
                              )}

                              {!estadoClase.bloqueada && clase.contenido && (
                                <div className="mt-5 rounded-2xl border border-white/10 bg-black p-5">
                                  <p className="whitespace-pre-line text-sm leading-7 text-neutral-300">
                                    {clase.contenido}
                                  </p>
                                </div>
                              )}

                              {!estadoClase.bloqueada && clase.pdf_url && (
                                <a
                                  href={clase.pdf_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-5 inline-block rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-yellow-400"
                                >
                                  Abrir material PDF
                                </a>
                              )}

                              {estadoClase.bloqueada && (
                                <div className="mt-5 rounded-2xl border border-white/10 bg-black p-5 text-sm text-neutral-400">
                                  Esta clase está bloqueada. Completá la clase
                                  anterior para desbloquearla.
                                </div>
                              )}

                              <div className="mt-5">
                                <BotonCompletarClase
                                  claseId={clase.id}
                                  completadaInicial={estadoClase.completada}
                                  bloqueada={estadoClase.bloqueada}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}