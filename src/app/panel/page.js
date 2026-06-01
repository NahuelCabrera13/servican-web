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
    resumen: "Incluye básico, extenso y soporte personalizado.",
  },
  plantel: {
    nombre: "Plantel",
    resumen: "Incluye beneficios Pro y acceso grupal.",
  },
};

function formatearFecha(fecha) {
  if (!fecha) return "—";

  try {
    return new Date(fecha).toLocaleDateString("es-UY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function normalizarNivel(nivel) {
  const valor = String(nivel || "basico").toLowerCase().trim();

  if (PLANES[valor]) return valor;

  return "basico";
}

function obtenerNombreTipo(tipo) {
  const tipos = {
    clase: "Clase",
    video: "Video",
    pdf: "PDF",
    material: "Material",
    evaluacion: "Evaluación",
    soporte: "Soporte",
    bonus: "Bonus",
  };

  return tipos[tipo] || "Clase";
}

function obtenerIconoTipo(tipo) {
  const tipos = {
    clase: "📘",
    video: "🎥",
    pdf: "📄",
    material: "📦",
    evaluacion: "📝",
    soporte: "🤝",
    bonus: "⭐",
  };

  return tipos[tipo] || "📘";
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
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-zinc-400">
        <span>Progreso</span>
        <span>{porcentaje}%</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-yellow-500 transition-all"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  );
}

function CargandoPanel() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <section className="mx-auto max-w-4xl rounded-[2rem] border border-yellow-500/30 bg-zinc-950 p-8 text-center">
        <img
          src="/logo-servican.jpeg"
          alt="Logo SERVICAN"
          className="mx-auto h-24 w-24 rounded-full object-contain"
        />

        <p className="mt-6 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
          SERVICAN
        </p>

        <h1 className="mt-3 text-4xl font-black">Cargando tu panel.</h1>

        <p className="mt-4 text-zinc-400">
          Estamos verificando tus cursos y el plan que compraste.
        </p>
      </section>
    </main>
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

    const porcentaje =
      totalClases > 0 ? Math.round((completadas / totalClases) * 100) : 0;

    return {
      totalClases,
      completadas,
      porcentaje,
    };
  }, [cursos]);

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
        window.location.href = "/login";
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

      setCursos(data.cursos || []);

      if (data.cursos?.length) {
        setCursoAbiertoId(data.cursos[0].curso.id);
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
      <header className="border-b border-yellow-500/20 bg-black/95">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
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
              Volver al inicio
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
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold transition hover:bg-white/20"
            >
              Actualizar
            </button>

            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className="w-full rounded-2xl bg-red-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-400"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="border-b border-zinc-900 bg-gradient-to-br from-zinc-950 via-black to-zinc-950 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
            Mi formación
          </p>

          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            Tus cursos habilitados
          </h1>

          <p className="mt-5 max-w-3xl leading-8 text-zinc-300">
            Acá solo vas a ver el contenido correspondiente al plan que
            compraste. Si compraste Básico, no se muestran materiales Extenso o
            Pro. Si compraste Pro o Plantel, se habilitan más recursos.
          </p>

          {usuario?.email && (
            <p className="mt-4 text-sm text-zinc-500">
              Sesión iniciada como {usuario.email}
            </p>
          )}

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-400">Cursos activos</p>
              <p className="mt-2 text-4xl font-black text-yellow-500">
                {totalCursos}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-400">Clases visibles</p>
              <p className="mt-2 text-4xl font-black">
                {resumen.totalClases}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-400">Completadas</p>
              <p className="mt-2 text-4xl font-black">
                {resumen.completadas}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-400">Progreso general</p>
              <p className="mt-2 text-4xl font-black text-yellow-500">
                {resumen.porcentaje}%
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          {error && (
            <div className="mb-8 rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
              <h2 className="text-2xl font-black">Error</h2>
              <p className="mt-2">{error}</p>
            </div>
          )}

          {!error && cursos.length === 0 && (
            <div className="rounded-[2rem] border border-white/10 bg-zinc-950 p-10 text-center">
              <h2 className="text-3xl font-black">
                Todavía no tenés cursos habilitados
              </h2>

              <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-400">
                Cuando compres un curso o SERVICAN habilite tu acceso, aparecerá
                automáticamente en este panel.
              </p>

              <Link
                href="/cursos"
                className="mt-8 inline-block rounded-full bg-yellow-500 px-8 py-4 font-black text-black transition hover:bg-yellow-400"
              >
                Ver cursos disponibles
              </Link>
            </div>
          )}

          {cursos.length > 0 && (
            <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
              <aside className="space-y-4">
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
                          ? "border-yellow-500 bg-yellow-500/10"
                          : "border-white/10 bg-zinc-950 hover:border-yellow-500/40"
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-2xl font-black">
                            {item.curso.titulo}
                          </h2>

                          <p className="mt-2 text-sm leading-6 text-zinc-400">
                            {item.curso.descripcion || "Curso SERVICAN."}
                          </p>
                        </div>

                        <PlanBadge nivel={nivel} />
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
                          <p className="text-xs text-zinc-500">Completadas</p>
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
                {cursos
                  .filter((item) => item.curso.id === cursoAbiertoId)
                  .map((item) => {
                    const nivel = normalizarNivel(item.nivel_acceso);
                    const plan = PLANES[nivel];

                    return (
                      <div
                        key={item.curso.id}
                        className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6 shadow-2xl"
                      >
                        <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <PlanBadge nivel={nivel} />

                            <h2 className="mt-4 text-4xl font-black">
                              {item.curso.titulo}
                            </h2>

                            <p className="mt-4 max-w-3xl leading-7 text-zinc-300">
                              Estás viendo el contenido habilitado para el plan{" "}
                              <span className="font-black text-yellow-500">
                                {plan.nombre}
                              </span>
                              . Los materiales de planes superiores no se
                              muestran en tu panel.
                            </p>
                          </div>

                          <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-5 lg:min-w-72">
                            <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
                              Tu plan
                            </p>
                            <p className="mt-2 text-3xl font-black">
                              {plan.nombre}
                            </p>
                            <p className="mt-3 text-sm leading-6 text-yellow-100">
                              {plan.resumen}
                            </p>
                          </div>
                        </div>

                        {item.error_contenido && (
                          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
                            {item.error_contenido}
                          </div>
                        )}

                        {!item.modulos?.length && (
                          <div className="mt-8 rounded-3xl border border-white/10 bg-black p-8 text-center">
                            <h3 className="text-2xl font-black">
                              No hay contenido visible para este plan todavía
                            </h3>
                            <p className="mt-3 text-zinc-400">
                              Cuando SERVICAN cargue módulos y clases para tu
                              plan, aparecerán acá.
                            </p>
                          </div>
                        )}

                        <div className="mt-8 space-y-6">
                          {item.modulos?.map((modulo, moduloIndex) => (
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
                                    Nivel mínimo:{" "}
                                    {PLANES[
                                      normalizarNivel(
                                        modulo.nivel_minimo_acceso
                                      )
                                    ]?.nombre || "Básico"}
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
                                        {obtenerIconoTipo(clase.tipo_contenido)}
                                      </div>

                                      <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="rounded-full border border-white/10 bg-zinc-950 px-3 py-1 text-xs font-bold uppercase tracking-wide text-zinc-300">
                                            {obtenerNombreTipo(
                                              clase.tipo_contenido
                                            )}
                                          </span>

                                          <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-yellow-200">
                                            {PLANES[
                                              normalizarNivel(
                                                clase.nivel_minimo_acceso
                                              )
                                            ]?.nombre || "Básico"}
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

                                        {clase.descripcion_plan && (
                                          <p className="mt-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-sm leading-6 text-yellow-100">
                                            {clase.descripcion_plan}
                                          </p>
                                        )}

                                        {clase.url_contenido && (
                                          <a
                                            href={clase.url_contenido}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-4 inline-block rounded-full bg-yellow-500 px-5 py-3 text-sm font-black text-black transition hover:bg-yellow-400"
                                          >
                                            Abrir contenido
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </article>
                          ))}
                        </div>

                        {item.certificado && (
                          <div className="mt-8 rounded-[2rem] border border-green-500/30 bg-green-500/10 p-6">
                            <h3 className="text-2xl font-black text-green-200">
                              Certificado disponible
                            </h3>

                            <p className="mt-3 text-green-100">
                              Código:{" "}
                              <span className="font-black">
                                {item.certificado.codigo || item.certificado.id}
                              </span>
                            </p>

                            <p className="mt-2 text-sm text-green-100">
                              Emitido:{" "}
                              {formatearFecha(item.certificado.created_at)}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </section>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}