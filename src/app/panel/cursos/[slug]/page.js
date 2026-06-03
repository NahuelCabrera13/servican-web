import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BotonCompletarClase from "./BotonCompletarClase";
import BotonCerrarSesion from "@/app/components/BotonCerrarSesion";

export const dynamic = "force-dynamic";

const JERARQUIA_PLANES = {
  basico: 1,
  extenso: 2,
  pro: 3,
  plantel: 4,
};

const PLANES = {
  basico: {
    nombre: "Básico",
    descripcion: "Acceso al contenido base del curso.",
    color: "border-zinc-500/30 bg-zinc-500/10 text-zinc-200",
  },
  extenso: {
    nombre: "Extenso",
    descripcion: "Acceso ampliado con más contenido formativo.",
    color: "border-blue-500/30 bg-blue-500/10 text-blue-200",
  },
  pro: {
    nombre: "Pro",
    descripcion: "Acceso avanzado con beneficios profesionales.",
    color: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
  },
  plantel: {
    nombre: "Plantel",
    descripcion: "Acceso grupal con beneficios del plan Pro.",
    color: "border-green-500/30 bg-green-500/10 text-green-200",
  },
};

function normalizarNivel(nivel) {
  const valor = String(nivel || "basico").toLowerCase().trim();

  if (JERARQUIA_PLANES[valor]) {
    return valor;
  }

  return "basico";
}

function nivelesPermitidos(nivelAlumno) {
  const nivel = normalizarNivel(nivelAlumno);
  const valorNivel = JERARQUIA_PLANES[nivel];

  return Object.entries(JERARQUIA_PLANES)
    .filter(([, valor]) => valor <= valorNivel)
    .map(([nombre]) => nombre);
}

function nombrePlan(nivel) {
  const normalizado = normalizarNivel(nivel);

  return PLANES[normalizado]?.nombre || "Básico";
}

function descripcionPlan(nivel) {
  const normalizado = normalizarNivel(nivel);

  return PLANES[normalizado]?.descripcion || PLANES.basico.descripcion;
}

function clasePlan(nivel) {
  const normalizado = normalizarNivel(nivel);

  return PLANES[normalizado]?.color || PLANES.basico.color;
}

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
        return `https://www.youtube-nocookie.com/embed/${videoId}`;
      }

      if (urlObj.pathname.startsWith("/embed/")) {
        return url.replace("youtube.com", "youtube-nocookie.com");
      }
    }

    if (urlObj.hostname.includes("youtu.be")) {
      const videoId = urlObj.pathname.replace("/", "");

      if (videoId) {
        return `https://www.youtube-nocookie.com/embed/${videoId}`;
      }
    }

    return "";
  } catch {
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

function formatearFecha(fecha) {
  if (!fecha) return "—";

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) return "—";

  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const anio = date.getFullYear();

  return `${dia}/${mes}/${anio}`;
}

function Badge({ children, className = "" }) {
  return (
    <span
      className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.2em] ${className}`}
    >
      {children}
    </span>
  );
}

function BarraProgreso({ porcentaje }) {
  const valor = Math.max(0, Math.min(100, Number(porcentaje || 0)));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-wide text-zinc-400">
        <span>Progreso</span>
        <span>{valor}%</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-yellow-500 transition-all"
          style={{ width: `${valor}%` }}
        />
      </div>
    </div>
  );
}

function obtenerTipoClase(clase) {
  if (clase?.video_url && clase?.pdf_url) return "Video + material";
  if (clase?.video_url) return "Video";
  if (clase?.pdf_url) return "Material";
  if (clase?.contenido) return "Texto";
  return "Clase";
}

function obtenerIconoClase(clase) {
  if (clase?.video_url) return "🎥";
  if (clase?.pdf_url) return "📄";
  if (clase?.contenido) return "📘";
  return "📘";
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  return {
    title: "Aula privada | SERVICAN",
    description: `Acceso privado al curso ${slug} en SERVICAN.`,
  };
}

export default async function CursoPrivadoPage({ params }) {
  const { slug } = await params;

  const supabase = await createClient();

  const {
    data: { user },
    error: errorUsuario,
  } = await supabase.auth.getUser();

  if (errorUsuario || !user) {
    redirect(`/login?redirect=/panel/cursos/${slug}`);
  }

  const { data: perfil, error: errorPerfil } = await supabase
    .from("perfiles")
    .select("id, user_id, email, nombre, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (errorPerfil || !perfil) {
    redirect("/acceso-denegado");
  }

  const { data: curso, error: errorCurso } = await supabase
    .from("cursos")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (errorCurso || !curso) {
    notFound();
  }

  if (!curso.activo && perfil.role !== "admin") {
    redirect("/panel");
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

  if (!esAdmin && !esInstructor && (errorAcceso || !tieneAccesoActivo)) {
    redirect("/panel");
  }

  const nivelAlumno =
    esAdmin || esInstructor ? "plantel" : normalizarNivel(acceso?.nivel_acceso);

  const niveles = nivelesPermitidos(nivelAlumno);

  const { data: modulos, error: errorModulos } = await supabase
    .from("curso_modulos")
    .select(
      `
      id,
      titulo,
      descripcion,
      orden,
      activo,
      nivel_minimo_acceso,
      clases:curso_clases (
        id,
        titulo,
        descripcion,
        video_url,
        pdf_url,
        contenido,
        orden,
        activo,
        nivel_minimo_acceso
      )
    `
    )
    .eq("curso_id", curso.id)
    .eq("activo", true)
    .in("nivel_minimo_acceso", niveles)
    .order("orden", { ascending: true })
    .order("orden", {
      referencedTable: "curso_clases",
      ascending: true,
    });

  const modulosVisibles = (modulos || []).map((modulo) => ({
    ...modulo,
    clases: (modulo.clases || []).filter(
      (clase) =>
        clase.activo &&
        niveles.includes(normalizarNivel(clase.nivel_minimo_acceso))
    ),
  }));

  const clasesOrdenadas = aplanarClases(modulosVisibles);
  const claseIdsVisibles = clasesOrdenadas.map((clase) => clase.id);

  let progreso = [];

  if (claseIdsVisibles.length) {
    const { data: progresoData } = await supabase
      .from("clase_progreso")
      .select("clase_id, completada")
      .eq("user_id", user.id)
      .in("clase_id", claseIdsVisibles);

    progreso = progresoData || [];
  }

  const clasesCompletadas = new Set(
    progreso
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
        descripcion: "Esta clase ya fue marcada como completada.",
        claseBadge: "border-green-500/30 bg-green-500/10 text-green-300",
      };
    }

    if (indice === 0) {
      return {
        completada: false,
        bloqueada: false,
        texto: "Disponible",
        descripcion: "Podés comenzar por esta clase.",
        claseBadge: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
      };
    }

    const claseAnterior = clasesOrdenadas[indice - 1];
    const anteriorCompletada = clasesCompletadas.has(claseAnterior?.id);

    if (anteriorCompletada) {
      return {
        completada: false,
        bloqueada: false,
        texto: "Disponible",
        descripcion: "Esta clase ya está desbloqueada.",
        claseBadge: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
      };
    }

    return {
      completada: false,
      bloqueada: true,
      texto: "Bloqueada",
      descripcion: "Completá la clase anterior para desbloquearla.",
      claseBadge: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
    };
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-yellow-500/20 bg-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
          <Link href="/panel" className="flex items-center gap-4">
            <img
              src="/logo-servican.jpeg"
              alt="Logo SERVICAN"
              className="h-16 w-16 rounded-full object-contain"
            />

            <div>
              <p className="text-xl font-black tracking-[0.25em] text-yellow-500">
                SERVICAN
              </p>

              <p className="text-sm text-zinc-400">Aula privada</p>
            </div>
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/panel"
              className="rounded-2xl border border-yellow-500/40 bg-yellow-500/10 px-5 py-3 text-center text-sm font-bold text-yellow-200 transition hover:bg-yellow-500/20"
            >
              Volver al panel
            </Link>

            <Link
              href="/cursos"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/20"
            >
              Ver cursos
            </Link>

            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/20"
            >
              Inicio
            </Link>

<BotonCerrarSesion className="..." />

          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-zinc-900 px-4 py-12 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#3f3210_0%,#111_34%,#000_78%)]" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black to-transparent" />

        <div className="relative mx-auto max-w-[1500px]">
          <div className="overflow-hidden rounded-[2rem] border border-yellow-500/20 bg-black/60 shadow-2xl backdrop-blur">
            <div className="grid lg:grid-cols-[1.12fr_0.88fr]">
              <div className="p-7 md:p-10">
                <div className="mb-5 flex flex-wrap gap-3">
                  <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300">
                    Curso privado
                  </Badge>

                  <Badge className={clasePlan(nivelAlumno)}>
                    Plan {nombrePlan(nivelAlumno)}
                  </Badge>

                  {acceso?.estado && (
                    <Badge className={claseEstado(acceso.estado)}>
                      {textoEstado(acceso.estado)}
                    </Badge>
                  )}

                  {cursoCompletado && (
                    <Badge className="border-green-500/30 bg-green-500/10 text-green-300">
                      Curso completado
                    </Badge>
                  )}

                  {esAdmin && (
                    <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300">
                      Vista admin
                    </Badge>
                  )}

                  {esInstructor && (
                    <Badge className="border-blue-500/30 bg-blue-500/10 text-blue-300">
                      Vista instructor
                    </Badge>
                  )}
                </div>

                <h1 className="text-4xl font-black md:text-6xl">
                  {curso.titulo}
                </h1>

                <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
                  {curso.descripcion ||
                    "Contenido privado del curso SERVICAN. En esta sección se cargan módulos, clases, videos, materiales y recursos de apoyo."}
                </p>

                <p className="mt-4 text-sm text-zinc-500">
                  Sesión iniciada como{" "}
                  <span className="font-bold text-zinc-300">
                    {perfil?.email || user?.email}
                  </span>
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <ResumenMini titulo="Módulos" valor={modulosVisibles.length} />
                  <ResumenMini titulo="Clases" valor={totalClases} />
                  <ResumenMini
                    titulo="Completadas"
                    valor={totalCompletadas}
                    color="green"
                  />
                  <ResumenMini titulo="Progreso" valor={`${porcentaje}%`} />
                </div>
              </div>

              <div className="relative min-h-[340px] bg-zinc-900">
                {curso.imagen_url ? (
                  <img
                    src={curso.imagen_url}
                    alt={curso.titulo}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-[340px] items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-zinc-950">
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

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 rounded-3xl border border-white/10 bg-black/60 p-5 backdrop-blur">
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
                    Tu avance
                  </p>

                  <div className="mt-4">
                    <BarraProgreso porcentaje={porcentaje} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {cursoCompletado && (
            <div className="mt-6 rounded-[2rem] border border-green-500/30 bg-green-500/10 p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-green-200">
                    Curso finalizado
                  </h2>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-green-100">
                    Completaste todas las clases visibles para tu plan. Si ya se
                    emitió el certificado, podés verlo desde esta misma aula.
                  </p>
                </div>

                {certificado ? (
                  <Link
                    href={`/panel/certificados/${certificado.codigo}`}
                    className="rounded-2xl bg-yellow-500 px-6 py-3 text-center text-sm font-black text-black transition hover:bg-yellow-400"
                  >
                    Ver certificado
                  </Link>
                ) : (
                  <span className="rounded-full border border-yellow-500/30 bg-black/30 px-5 py-3 text-sm font-black text-yellow-100">
                    Certificado pendiente
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6 shadow-2xl">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
                Progreso
              </p>

              <h2 className="mt-3 text-3xl font-black">Estado del curso</h2>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black p-5">
                <BarraProgreso porcentaje={porcentaje} />

                <p className="mt-4 text-sm leading-6 text-zinc-400">
                  Completaste{" "}
                  <span className="font-black text-green-300">
                    {totalCompletadas}
                  </span>{" "}
                  de{" "}
                  <span className="font-black text-yellow-300">
                    {totalClases}
                  </span>{" "}
                  clase{totalClases === 1 ? "" : "s"}.
                </p>
              </div>

              <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-300">
                  Plan {nombrePlan(nivelAlumno)}
                </p>

                <p className="mt-2 text-sm leading-6 text-yellow-100">
                  {descripcionPlan(nivelAlumno)}
                </p>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black p-5">
                <p className="text-sm font-black text-white">
                  Reglas del aula
                </p>

                <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-400">
                  <li>• Las clases se desbloquean en orden.</li>
                  <li>• Para avanzar, completá la clase anterior.</li>
                  <li>• Solo ves el contenido incluido en tu plan.</li>
                  <li>• Los materiales solo se abren con acceso activo.</li>
                </ul>
              </div>

              {certificado && (
                <div className="mt-5 rounded-2xl border border-green-500/30 bg-green-500/10 p-5">
                  <p className="text-sm font-black text-green-200">
                    Certificado disponible
                  </p>

                  <p className="mt-2 text-sm leading-6 text-green-100">
                    Código:{" "}
                    <span className="font-black">{certificado.codigo}</span>
                  </p>

                  <p className="mt-1 text-sm text-green-100">
                    Emitido:{" "}
                    {formatearFecha(
                      certificado.emitido_at || certificado.created_at
                    )}
                  </p>

                  <Link
                    href={`/panel/certificados/${certificado.codigo}`}
                    className="mt-4 inline-block rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-black text-black transition hover:bg-yellow-400"
                  >
                    Ver certificado
                  </Link>
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
                Accesos rápidos
              </p>

              <div className="mt-5 grid gap-3">
                <Link
                  href="/panel"
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/20"
                >
                  Volver al panel
                </Link>

                <Link
                  href="/cursos"
                  className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-3 text-center text-sm font-bold text-yellow-200 transition hover:bg-yellow-500/20"
                >
                  Ver otros cursos
                </Link>

                <Link
                  href="/verificar-certificado"
                  className="rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-3 text-center text-sm font-bold text-green-200 transition hover:bg-green-500/20"
                >
                  Verificar certificado
                </Link>
              </div>
            </div>
          </aside>

          <section className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-8">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
                Contenido
              </p>

              <h2 className="mt-3 text-4xl font-black">Módulos y clases</h2>

              <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-400">
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
              <div className="rounded-3xl border border-white/10 bg-black p-8 text-center">
                <h3 className="text-2xl font-black">
                  Todavía no hay módulos visibles
                </h3>

                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                  Este curso ya tiene aula privada, pero todavía no tiene
                  contenido activo para tu plan.
                </p>
              </div>
            )}

            {!errorModulos && modulosVisibles.length > 0 && (
              <div className="space-y-6">
                {modulosVisibles.map((modulo) => (
                  <article
                    key={modulo.id}
                    className="overflow-hidden rounded-[2rem] border border-white/10 bg-black"
                  >
                    <div className="border-b border-white/10 bg-white/[0.03] p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-500">
                            Módulo {modulo.orden}
                          </p>

                          <h3 className="mt-2 text-2xl font-black">
                            {modulo.titulo}
                          </h3>

                          {modulo.descripcion && (
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
                              {modulo.descripcion}
                            </p>
                          )}
                        </div>

                        <span className="rounded-full border border-white/10 bg-zinc-950 px-4 py-2 text-xs font-black uppercase tracking-wide text-zinc-300">
                          {modulo.clases.length} clase
                          {modulo.clases.length === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>

                    {modulo.clases.length === 0 ? (
                      <div className="p-6 text-sm text-zinc-400">
                        Este módulo todavía no tiene clases activas para tu
                        plan.
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
                              className={`p-6 ${
                                estadoClase.bloqueada ? "opacity-70" : ""
                              }`}
                            >
                              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div className="flex gap-4">
                                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-500 text-2xl text-black">
                                    {obtenerIconoClase(clase)}
                                  </div>

                                  <div>
                                    <div className="flex flex-wrap gap-2">
                                      <span className="rounded-full border border-white/10 bg-zinc-950 px-3 py-1 text-xs font-bold uppercase tracking-wide text-zinc-300">
                                        Clase {clase.orden}
                                      </span>

                                      <span className="rounded-full border border-white/10 bg-zinc-950 px-3 py-1 text-xs font-bold uppercase tracking-wide text-zinc-300">
                                        {obtenerTipoClase(clase)}
                                      </span>

                                      <span
                                        className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${estadoClase.claseBadge}`}
                                      >
                                        {estadoClase.texto}
                                      </span>
                                    </div>

                                    <h4 className="mt-3 text-2xl font-black">
                                      {clase.titulo}
                                    </h4>

                                    {clase.descripcion && (
                                      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                                        {clase.descripcion}
                                      </p>
                                    )}

                                    <p className="mt-2 text-xs text-zinc-500">
                                      {estadoClase.descripcion}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {!estadoClase.bloqueada && videoEmbed && (
                                <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
                                  <iframe
                                    src={videoEmbed}
                                    title={clase.titulo}
                                    className="aspect-video w-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                  />
                                </div>
                              )}

                              {!estadoClase.bloqueada &&
                                clase.video_url &&
                                !videoEmbed && (
                                  <div className="mt-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-sm leading-6 text-yellow-100">
                                    El video cargado no tiene formato compatible
                                    para embeber. Revisá que sea un enlace de
                                    YouTube válido.
                                  </div>
                                )}

                              {!estadoClase.bloqueada && clase.contenido && (
                                <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-950 p-5">
                                  <p className="whitespace-pre-line text-sm leading-7 text-zinc-300">
                                    {clase.contenido}
                                  </p>
                                </div>
                              )}

                              {!estadoClase.bloqueada && clase.pdf_url && (
                                <a
                                  href={`/api/panel/materiales?clase_id=${clase.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-5 inline-block rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-black text-black transition hover:bg-yellow-400"
                                >
                                  Abrir material de la clase
                                </a>
                              )}

                              {estadoClase.bloqueada && (
                                <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-950 p-5 text-sm leading-6 text-zinc-400">
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
        </div>
      </section>
    </main>
  );
}

function ResumenMini({ titulo, valor, color = "yellow" }) {
  const colores = {
    yellow: "text-yellow-500",
    green: "text-green-400",
    white: "text-white",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
        {titulo}
      </p>

      <p className={`mt-1 text-2xl font-black ${colores[color]}`}>
        {valor}
      </p>
    </div>
  );
}