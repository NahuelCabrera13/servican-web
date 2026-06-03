"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const COLORES_PLAN = {
  basico: "border-zinc-500/30 bg-zinc-500/10 text-zinc-200",
  extenso: "border-blue-500/30 bg-blue-500/10 text-blue-200",
  pro: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
  plantel: "border-green-500/30 bg-green-500/10 text-green-200",
};

const PLANES = {
  basico: {
    nombre: "Básico",
    resumen: "Acceso al contenido base del curso.",
  },
  extenso: {
    nombre: "Extenso",
    resumen: "Incluye lo básico y contenido ampliado.",
  },
  pro: {
    nombre: "Pro",
    resumen: "Incluye básico, extenso y beneficios profesionales.",
  },
  plantel: {
    nombre: "Plantel",
    resumen: "Incluye beneficios Pro y acceso grupal.",
  },
};

function formatearFecha(fecha) {
  if (!fecha) return "—";

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) return "—";

  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const anio = date.getFullYear();

  return `${dia}/${mes}/${anio}`;
}

function normalizarNivel(nivel) {
  const valor = String(nivel || "basico").toLowerCase().trim();

  if (PLANES[valor]) return valor;

  return "basico";
}

function obtenerIconoClase(clase) {
  if (clase?.video_url) return "🎥";
  if (clase?.pdf_url) return "📄";
  if (clase?.contenido) return "📘";

  return "📘";
}

function obtenerTipoClase(clase) {
  if (clase?.video_url && clase?.pdf_url) return "Video + material";
  if (clase?.video_url) return "Video";
  if (clase?.pdf_url) return "Material";
  if (clase?.contenido) return "Texto";

  return "Clase";
}

function PlanBadge({ nivel }) {
  const normalizado = normalizarNivel(nivel);
  const plan = PLANES[normalizado];

  return (
    <span
      className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.2em] ${
        COLORES_PLAN[normalizado] || COLORES_PLAN.basico
      }`}
    >
      Plan {plan.nombre}
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

function CargandoPanel() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <section className="mx-auto max-w-4xl rounded-[2rem] border border-yellow-500/30 bg-zinc-950 p-8 text-center shadow-2xl">
        <img
          src="/logo-servican.jpeg"
          alt="Logo SERVICAN"
          className="mx-auto h-24 w-24 rounded-full object-contain"
        />

        <p className="mt-6 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
          SERVICAN
        </p>

        <h1 className="mt-3 text-4xl font-black">Cargando tu panel</h1>

        <p className="mt-4 text-zinc-400">
          Estamos verificando tus cursos, progreso y certificados.
        </p>
      </section>
    </main>
  );
}

function ResumenCard({ titulo, valor, texto, destacado = false }) {
  return (
    <div
      className={`rounded-3xl border p-5 ${
        destacado
          ? "border-yellow-500/30 bg-yellow-500/10"
          : "border-white/10 bg-zinc-950"
      }`}
    >
      <p className="text-sm text-zinc-400">{titulo}</p>

      <p
        className={`mt-2 text-4xl font-black ${
          destacado ? "text-yellow-500" : "text-white"
        }`}
      >
        {valor}
      </p>

      {texto && <p className="mt-2 text-xs leading-5 text-zinc-500">{texto}</p>}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-zinc-950 p-10 text-center shadow-2xl">
      <img
        src="/logo-servican.jpeg"
        alt="Logo SERVICAN"
        className="mx-auto h-20 w-20 rounded-full object-contain opacity-80"
      />

      <h2 className="mt-6 text-3xl font-black">
        Todavía no tenés cursos habilitados
      </h2>

      <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-400">
        Cuando compres un curso o SERVICAN habilite tu acceso, aparecerá
        automáticamente en este panel.
      </p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/cursos"
          className="rounded-full bg-yellow-500 px-8 py-4 font-black text-black transition hover:bg-yellow-400"
        >
          Ver cursos disponibles
        </Link>

        <Link
          href="/inscripcion"
          className="rounded-full border border-white/10 bg-white/10 px-8 py-4 font-black text-white transition hover:bg-white hover:text-black"
        >
          Hacer una consulta
        </Link>
      </div>
    </div>
  );
}

export default function PanelAlumnoPage() {
  const [usuario, setUsuario] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [cursoAbiertoId, setCursoAbiertoId] = useState(null);

  const totalCursos = cursos.length;

  const resumen = useMemo(() => {
    const totalClases = cursos.reduce(
      (total, item) => total + Number(item.total_clases || 0),
      0
    );

    const completadas = cursos.reduce(
      (total, item) => total + Number(item.clases_completadas || 0),
      0
    );

    const certificados = cursos.filter((item) => item.certificado).length;

    const porcentaje =
      totalClases > 0 ? Math.round((completadas / totalClases) * 100) : 0;

    const cursosFinalizados = cursos.filter(
      (item) => Number(item.porcentaje || 0) >= 100
    ).length;

    return {
      totalClases,
      completadas,
      certificados,
      porcentaje,
      cursosFinalizados,
    };
  }, [cursos]);

  const cursoAbierto = useMemo(() => {
    return cursos.find((item) => item.curso.id === cursoAbiertoId) || null;
  }, [cursos, cursoAbiertoId]);

  useEffect(() => {
    cargarPanel();
  }, []);

  async function cargarPanel() {
    setCargando(true);
    setError("");

    try {
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user || !session?.access_token) {
        window.location.href = "/login?redirect=/panel";
        return;
      }

      setUsuario(session.user);

      const respuesta = await fetch("/api/panel/mis-cursos", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo cargar tu panel.");
        setCursos([]);
        return;
      }

      const cursosRecibidos = data.cursos || [];

      setCursos(cursosRecibidos);

      if (cursosRecibidos.length) {
        setCursoAbiertoId((actual) => actual || cursosRecibidos[0].curso.id);
      }
    } catch (error) {
      console.error("Error cargando panel:", error);
      setError("Error de conexión al cargar tu panel.");
    } finally {
      setCargando(false);
    }
  }

  if (cargando) {
    return <CargandoPanel />;
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-yellow-500/20 bg-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
          <Link href="/" className="flex items-center gap-4">
            <img
              src="/logo-servican.jpeg"
              alt="Logo SERVICAN"
              className="h-16 w-16 rounded-full object-contain"
            />

            <div>
              <p className="text-xl font-black tracking-[0.25em] text-yellow-500">
                SERVICAN
              </p>
              <p className="text-sm text-zinc-400">Panel privado del alumno</p>
            </div>
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/20"
            >
              Inicio
            </Link>

            <Link
              href="/cursos"
              className="rounded-2xl border border-yellow-500/40 bg-yellow-500/10 px-5 py-3 text-center text-sm font-bold text-yellow-200 transition hover:bg-yellow-500/20"
            >
              Ver cursos
            </Link>

            <button
              type="button"
              onClick={cargarPanel}
              disabled={cargando}
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold transition hover:bg-white/20 disabled:opacity-60"
            >
              Actualizar
            </button>

            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className="w-full rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-100 transition hover:bg-red-500/20"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-zinc-900 px-4 py-14 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#3f3210_0%,#111_34%,#000_78%)]" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black to-transparent" />

        <div className="relative mx-auto max-w-[1500px]">
          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
                Mi formación
              </p>

              <h1 className="mt-4 text-4xl font-black md:text-6xl">
                Tus cursos habilitados
              </h1>

              <p className="mt-5 max-w-3xl leading-8 text-zinc-300">
                Este panel muestra tus cursos activos, progreso, clases
                disponibles y certificados. El contenido se filtra según el plan
                comprado y tu avance dentro de cada curso.
              </p>

              {usuario?.email && (
                <p className="mt-4 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-zinc-400 sm:inline-block">
                  Sesión iniciada como{" "}
                  <span className="font-bold text-zinc-200">
                    {usuario.email}
                  </span>
                </p>
              )}
            </div>

            <div className="rounded-[2rem] border border-yellow-500/20 bg-black/60 p-6 shadow-2xl backdrop-blur">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
                Progreso general
              </p>

              <p className="mt-3 text-5xl font-black text-yellow-500">
                {resumen.porcentaje}%
              </p>

              <p className="mt-3 text-sm leading-6 text-zinc-300">
                Calculado sobre todas las clases visibles en tus cursos
                habilitados.
              </p>

              <div className="mt-5">
                <BarraProgreso porcentaje={resumen.porcentaje} />
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <ResumenCard
              titulo="Cursos activos"
              valor={totalCursos}
              texto="Cursos habilitados en tu cuenta."
              destacado
            />

            <ResumenCard
              titulo="Clases visibles"
              valor={resumen.totalClases}
              texto="Contenido disponible según tu plan."
            />

            <ResumenCard
              titulo="Completadas"
              valor={resumen.completadas}
              texto="Clases marcadas como finalizadas."
            />

            <ResumenCard
              titulo="Finalizados"
              valor={resumen.cursosFinalizados}
              texto="Cursos con progreso completo."
            />

            <ResumenCard
              titulo="Certificados"
              valor={resumen.certificados}
              texto="Certificados disponibles."
              destacado
            />
          </div>

          <div className="mt-8 rounded-[2rem] border border-yellow-500/20 bg-yellow-500/10 p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-300">
                  Próximamente
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Membresía mensual SERVICAN
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-yellow-100">
                  Más adelante este panel también tendrá acceso a contenido
                  exclusivo, galería privada, videos, fotos y beneficios de
                  membresía mensual.
                </p>
              </div>

              <span className="rounded-full border border-yellow-500/30 bg-black/30 px-5 py-3 text-sm font-black text-yellow-200">
                En desarrollo
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          {error && (
            <div className="mb-8 rounded-[2rem] border border-red-500/30 bg-red-500/10 p-6 text-red-200">
              <h2 className="text-2xl font-black">Error cargando el panel</h2>
              <p className="mt-2">{error}</p>

              <button
                type="button"
                onClick={cargarPanel}
                className="mt-5 rounded-2xl bg-red-500 px-6 py-3 text-sm font-black text-white transition hover:bg-red-400"
              >
                Reintentar
              </button>
            </div>
          )}

          {!error && cursos.length === 0 && <EmptyState />}

          {cursos.length > 0 && (
            <div className="grid gap-8 xl:grid-cols-[0.75fr_1.25fr]">
              <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
                <div className="rounded-[2rem] border border-white/10 bg-zinc-950 p-5">
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-500">
                    Mis cursos
                  </p>

                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Seleccioná un curso para ver el resumen de módulos, clases y
                    certificado.
                  </p>
                </div>

                {cursos.map((item) => {
                  const abierto = cursoAbiertoId === item.curso.id;
                  const nivel = normalizarNivel(item.nivel_acceso);
                  const plan = PLANES[nivel];

                  return (
                    <button
                      key={item.curso.id}
                      type="button"
                      onClick={() => setCursoAbiertoId(item.curso.id)}
                      className={`w-full rounded-[2rem] border p-5 text-left transition ${
                        abierto
                          ? "border-yellow-500 bg-yellow-500/10 shadow-2xl"
                          : "border-white/10 bg-zinc-950 hover:border-yellow-500/40"
                      }`}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <PlanBadge nivel={nivel} />

                          {item.certificado && (
                            <span className="rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-green-200">
                              Certificado
                            </span>
                          )}
                        </div>

                        <h2 className="text-2xl font-black">
                          {item.curso.titulo}
                        </h2>

                        <p className="text-sm leading-6 text-zinc-400">
                          {item.curso.descripcion || "Curso SERVICAN."}
                        </p>
                      </div>

                      <p className="mt-4 text-sm text-zinc-300">
                        {plan.resumen}
                      </p>

                      <div className="mt-5">
                        <BarraProgreso porcentaje={item.porcentaje || 0} />
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-black p-3">
                          <p className="text-xs text-zinc-500">Módulos</p>
                          <p className="mt-1 text-xl font-black">
                            {item.modulos?.length || 0}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black p-3">
                          <p className="text-xs text-zinc-500">Clases</p>
                          <p className="mt-1 text-xl font-black">
                            {item.total_clases || 0}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black p-3">
                          <p className="text-xs text-zinc-500">Hechas</p>
                          <p className="mt-1 text-xl font-black">
                            {item.clases_completadas || 0}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </aside>

              <section>
                {cursoAbierto && (
                  <div className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6 shadow-2xl">
                    <div className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <PlanBadge nivel={cursoAbierto.nivel_acceso} />

                          <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-300">
                            Acceso activo
                          </span>
                        </div>

                        <h2 className="mt-4 text-4xl font-black">
                          {cursoAbierto.curso.titulo}
                        </h2>

                        <p className="mt-4 max-w-3xl leading-7 text-zinc-300">
                          Estás viendo el resumen del contenido habilitado para
                          tu plan. Para reproducir videos, abrir materiales y
                          marcar clases como completadas, entrá al aula privada.
                        </p>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                          <Link
                            href={`/panel/cursos/${cursoAbierto.curso.slug}`}
                            className="rounded-2xl bg-yellow-500 px-6 py-4 text-center text-sm font-black text-black transition hover:bg-yellow-400"
                          >
                            Entrar al aula
                          </Link>

                          <Link
                            href="/cursos"
                            className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-center text-sm font-black text-white transition hover:bg-white hover:text-black"
                          >
                            Ver más cursos
                          </Link>

                          {cursoAbierto.certificado && (
                            <Link
                              href={`/panel/certificados/${cursoAbierto.certificado.codigo}`}
                              className="rounded-2xl border border-green-500/30 bg-green-500/10 px-6 py-4 text-center text-sm font-black text-green-200 transition hover:bg-green-500/20"
                            >
                              Ver certificado
                            </Link>
                          )}
                        </div>
                      </div>

                      <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-5 lg:min-w-72">
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
                          Tu plan
                        </p>

                        <p className="mt-2 text-3xl font-black">
                          {PLANES[normalizarNivel(cursoAbierto.nivel_acceso)]
                            ?.nombre || "Básico"}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-yellow-100">
                          {
                            PLANES[normalizarNivel(cursoAbierto.nivel_acceso)]
                              ?.resumen
                          }
                        </p>

                        <div className="mt-5">
                          <BarraProgreso
                            porcentaje={cursoAbierto.porcentaje || 0}
                          />
                        </div>
                      </div>
                    </div>

                    {cursoAbierto.error_contenido && (
                      <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
                        {cursoAbierto.error_contenido}
                      </div>
                    )}

                    {!cursoAbierto.modulos?.length && (
                      <div className="mt-8 rounded-3xl border border-white/10 bg-black p-8 text-center">
                        <h3 className="text-2xl font-black">
                          No hay contenido visible para este plan todavía
                        </h3>

                        <p className="mt-3 text-zinc-400">
                          Cuando SERVICAN cargue módulos y clases para tu plan,
                          aparecerán acá.
                        </p>
                      </div>
                    )}

                    <div className="mt-8 space-y-6">
                      {cursoAbierto.modulos?.map((modulo, moduloIndex) => (
                        <article
                          key={modulo.id}
                          className="overflow-hidden rounded-[2rem] border border-white/10 bg-black"
                        >
                          <div className="border-b border-white/10 bg-white/[0.03] p-6">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-500">
                                  Módulo {moduloIndex + 1}
                                </p>

                                <h3 className="mt-2 text-2xl font-black">
                                  {modulo.titulo || "Módulo sin título"}
                                </h3>

                                {modulo.descripcion && (
                                  <p className="mt-3 leading-7 text-zinc-400">
                                    {modulo.descripcion}
                                  </p>
                                )}
                              </div>

                              <span className="rounded-full border border-white/10 bg-zinc-950 px-4 py-2 text-xs font-bold uppercase tracking-wide text-zinc-300">
                                {modulo.clases?.length || 0} clase
                                {(modulo.clases?.length || 0) === 1 ? "" : "s"}
                              </span>
                            </div>
                          </div>

                          <div className="divide-y divide-white/10">
                            {!modulo.clases?.length && (
                              <div className="p-6 text-zinc-500">
                                Este módulo todavía no tiene clases visibles
                                para tu plan.
                              </div>
                            )}

                            {modulo.clases?.map((clase, claseIndex) => (
                              <div
                                key={clase.id}
                                className="flex flex-col gap-4 p-6 md:flex-row md:items-start md:justify-between"
                              >
                                <div className="flex gap-4">
                                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-500 text-xl text-black">
                                    {obtenerIconoClase(clase)}
                                  </div>

                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="rounded-full border border-white/10 bg-zinc-950 px-3 py-1 text-xs font-bold uppercase tracking-wide text-zinc-300">
                                        {obtenerTipoClase(clase)}
                                      </span>

                                      {clase.completada && (
                                        <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-200">
                                          Completada
                                        </span>
                                      )}
                                    </div>

                                    <h4 className="mt-3 text-xl font-black">
                                      {claseIndex + 1}.{" "}
                                      {clase.titulo || "Clase sin título"}
                                    </h4>

                                    {clase.descripcion && (
                                      <p className="mt-2 leading-7 text-zinc-400">
                                        {clase.descripcion}
                                      </p>
                                    )}

                                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                      {clase.video_url && (
                                        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-300">
                                          Tiene video
                                        </span>
                                      )}

                                      {clase.pdf_url && (
                                        <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-yellow-300">
                                          Tiene material
                                        </span>
                                      )}

                                      {clase.contenido && (
                                        <span className="rounded-full bg-green-500/10 px-3 py-1 text-green-300">
                                          Tiene texto
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>

                    {cursoAbierto.certificado && (
                      <div className="mt-8 rounded-[2rem] border border-green-500/30 bg-green-500/10 p-6">
                        <h3 className="text-2xl font-black text-green-200">
                          Certificado disponible
                        </h3>

                        <p className="mt-3 text-green-100">
                          Código:{" "}
                          <span className="font-black">
                            {cursoAbierto.certificado.codigo ||
                              cursoAbierto.certificado.id}
                          </span>
                        </p>

                        <p className="mt-2 text-sm text-green-100">
                          Emitido:{" "}
                          {formatearFecha(
                            cursoAbierto.certificado.emitido_at ||
                              cursoAbierto.certificado.created_at
                          )}
                        </p>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                          <Link
                            href={`/panel/certificados/${cursoAbierto.certificado.codigo}`}
                            className="rounded-2xl bg-yellow-500 px-6 py-3 text-center text-sm font-black text-black transition hover:bg-yellow-400"
                          >
                            Ver certificado
                          </Link>

                          <Link
                            href="/verificar-certificado"
                            className="rounded-2xl border border-green-500/30 bg-black/30 px-6 py-3 text-center text-sm font-black text-green-100 transition hover:bg-green-500/20"
                          >
                            Verificar código
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
