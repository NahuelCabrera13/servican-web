"use client";

import { useEffect, useMemo, useState } from "react";

const ESTADOS = [
  "pendiente",
  "contactado",
  "interesado",
  "pagó",
  "rechazado",
];

const CURSO_INICIAL = {
  titulo: "",
  slug: "",
  descripcion: "",
  categoria: "",
  precio: "",
  duracion: "",
  modalidad: "",
  imagen_url: "",
  activo: true,
  destacado: false,
};

export default function AdminPanel({ usuario, perfil }) {
  const [tabActiva, setTabActiva] = useState("inscripciones");

  const [inscripciones, setInscripciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [cursos, setCursos] = useState([]);
  const [formCurso, setFormCurso] = useState(CURSO_INICIAL);
  const [cursoEditandoId, setCursoEditandoId] = useState(null);
  const [busquedaCursos, setBusquedaCursos] = useState("");

  const [cargando, setCargando] = useState(true);
  const [accionandoId, setAccionandoId] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    actualizarTodo();
  }, []);

  async function actualizarTodo() {
    setCargando(true);
    setError("");
    setMensaje("");

    await cargarInscripciones();
    await cargarCursos();

    setCargando(false);
  }

  async function cargarInscripciones() {
    try {
      const respuesta = await fetch("/api/admin/inscripciones", {
        method: "GET",
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setInscripciones([]);
        setError(data?.error || "No se pudieron cargar las inscripciones.");
        return false;
      }

      setInscripciones(data.inscripciones || []);
      return true;
    } catch (error) {
      setError("Error de conexión al cargar inscripciones.");
      setInscripciones([]);
      return false;
    }
  }

  async function cargarCursos() {
    try {
      const respuesta = await fetch("/api/admin/cursos", {
        method: "GET",
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setCursos([]);
        setError(data?.error || "No se pudieron cargar los cursos.");
        return false;
      }

      setCursos(data.cursos || []);
      return true;
    } catch (error) {
      setError("Error de conexión al cargar cursos.");
      setCursos([]);
      return false;
    }
  }

  async function cambiarEstado(id, nuevoEstado) {
    setAccionandoId(id);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetch("/api/admin/inscripciones", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          estado: nuevoEstado,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo cambiar el estado.");
        return;
      }

      setInscripciones((actuales) =>
        actuales.map((inscripcion) =>
          inscripcion.id === id
            ? { ...inscripcion, estado: nuevoEstado }
            : inscripcion
        )
      );

      setMensaje("Estado actualizado correctamente.");
    } catch (error) {
      setError("Error de conexión al cambiar el estado.");
    } finally {
      setAccionandoId(null);
    }
  }

  async function eliminarInscripcion(id) {
    const confirmar = window.confirm(
      "¿Seguro que querés eliminar esta inscripción? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    setAccionandoId(id);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetch("/api/admin/inscripciones", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo eliminar la inscripción.");
        return;
      }

      setInscripciones((actuales) =>
        actuales.filter((inscripcion) => inscripcion.id !== id)
      );

      setMensaje("Inscripción eliminada correctamente.");
    } catch (error) {
      setError("Error de conexión al eliminar la inscripción.");
    } finally {
      setAccionandoId(null);
    }
  }

  function limpiarSlug(texto) {
    return String(texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ñ/g, "n")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function actualizarCampoCurso(campo, valor) {
    setFormCurso((actual) => {
      const actualizado = {
        ...actual,
        [campo]: valor,
      };

      if (campo === "titulo" && !cursoEditandoId) {
        actualizado.slug = limpiarSlug(valor);
      }

      return actualizado;
    });
  }

  function resetearFormularioCurso() {
    setFormCurso(CURSO_INICIAL);
    setCursoEditandoId(null);
  }

  function editarCurso(curso) {
    setCursoEditandoId(curso.id);
    setFormCurso({
      titulo: curso.titulo || "",
      slug: curso.slug || "",
      descripcion: curso.descripcion || "",
      categoria: curso.categoria || "",
      precio: curso.precio || "",
      duracion: curso.duracion || "",
      modalidad: curso.modalidad || "",
      imagen_url: curso.imagen_url || "",
      activo: Boolean(curso.activo),
      destacado: Boolean(curso.destacado),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function guardarCurso(event) {
    event.preventDefault();

    setCargando(true);
    setError("");
    setMensaje("");

    const metodo = cursoEditandoId ? "PATCH" : "PUT";

    try {
      const respuesta = await fetch("/api/admin/cursos", {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: cursoEditandoId,
          curso: formCurso,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo guardar el curso.");
        return;
      }

      if (cursoEditandoId) {
        setCursos((actuales) =>
          actuales.map((curso) =>
            curso.id === cursoEditandoId ? data.curso : curso
          )
        );

        setMensaje("Curso actualizado correctamente.");
      } else {
        setCursos((actuales) => [data.curso, ...actuales]);
        setMensaje("Curso creado correctamente.");
      }

      resetearFormularioCurso();
    } catch (error) {
      setError("Error de conexión al guardar el curso.");
    } finally {
      setCargando(false);
    }
  }

  async function eliminarCurso(id) {
    const confirmar = window.confirm(
      "¿Seguro que querés eliminar este curso? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    setAccionandoId(id);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetch("/api/admin/cursos", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo eliminar el curso.");
        return;
      }

      setCursos((actuales) => actuales.filter((curso) => curso.id !== id));

      if (cursoEditandoId === id) {
        resetearFormularioCurso();
      }

      setMensaje("Curso eliminado correctamente.");
    } catch (error) {
      setError("Error de conexión al eliminar el curso.");
    } finally {
      setAccionandoId(null);
    }
  }

  function formatearValor(valor) {
    if (valor === null || valor === undefined || valor === "") {
      return "—";
    }

    if (typeof valor === "boolean") {
      return valor ? "Sí" : "No";
    }

    if (
      typeof valor === "string" &&
      valor.includes("T") &&
      !Number.isNaN(Date.parse(valor))
    ) {
      return new Date(valor).toLocaleString("es-UY", {
        dateStyle: "short",
        timeStyle: "short",
      });
    }

    return String(valor);
  }

  function claseEstado(estado) {
    if (estado === "pagó") {
      return "border-green-500/30 bg-green-500/10 text-green-200";
    }

    if (estado === "contactado") {
      return "border-blue-500/30 bg-blue-500/10 text-blue-200";
    }

    if (estado === "interesado") {
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-200";
    }

    if (estado === "rechazado") {
      return "border-red-500/30 bg-red-500/10 text-red-200";
    }

    return "border-white/10 bg-white/10 text-neutral-200";
  }

  const inscripcionesFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return inscripciones.filter((inscripcion) => {
      const coincideTexto = !texto
        ? true
        : Object.values(inscripcion).some((valor) =>
            String(valor || "").toLowerCase().includes(texto)
          );

      const coincideEstado =
        filtroEstado === "todos"
          ? true
          : (inscripcion.estado || "pendiente") === filtroEstado;

      return coincideTexto && coincideEstado;
    });
  }, [busqueda, filtroEstado, inscripciones]);

  const resumenEstados = useMemo(() => {
    return ESTADOS.reduce((acc, estado) => {
      acc[estado] = inscripciones.filter(
        (inscripcion) => (inscripcion.estado || "pendiente") === estado
      ).length;

      return acc;
    }, {});
  }, [inscripciones]);

  const cursosFiltrados = useMemo(() => {
    const texto = busquedaCursos.toLowerCase().trim();

    if (!texto) return cursos;

    return cursos.filter((curso) =>
      Object.values(curso).some((valor) =>
        String(valor || "").toLowerCase().includes(texto)
      )
    );
  }, [busquedaCursos, cursos]);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
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
                Panel administrador
              </h1>

              <p className="mt-1 text-sm text-neutral-300">
                Sesión iniciada como {perfil?.email || usuario?.email}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={actualizarTodo}
              disabled={cargando}
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/20 disabled:opacity-60"
            >
              {cargando ? "Actualizando..." : "Actualizar"}
            </button>

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

        <nav className="mb-6 flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-3 sm:flex-row">
          <button
            onClick={() => setTabActiva("inscripciones")}
            className={`rounded-2xl px-5 py-3 text-sm font-bold transition ${
              tabActiva === "inscripciones"
                ? "bg-yellow-500 text-neutral-950"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            Inscripciones
          </button>

          <button
            onClick={() => setTabActiva("cursos")}
            className={`rounded-2xl px-5 py-3 text-sm font-bold transition ${
              tabActiva === "cursos"
                ? "bg-yellow-500 text-neutral-950"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            Cursos
          </button>
        </nav>

        {mensaje && (
          <div className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {tabActiva === "inscripciones" && (
          <>
            <section className="mb-6 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-neutral-400">Total</p>
                <p className="mt-2 text-4xl font-bold text-yellow-400">
                  {inscripciones.length}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-neutral-400">Pendientes</p>
                <p className="mt-2 text-4xl font-bold">
                  {resumenEstados.pendiente || 0}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-neutral-400">Contactados</p>
                <p className="mt-2 text-4xl font-bold">
                  {resumenEstados.contactado || 0}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-neutral-400">Interesados</p>
                <p className="mt-2 text-4xl font-bold">
                  {resumenEstados.interesado || 0}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-neutral-400">Pagaron</p>
                <p className="mt-2 text-4xl font-bold text-green-300">
                  {resumenEstados["pagó"] || 0}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-neutral-400">Mostrando</p>
                <p className="mt-2 text-4xl font-bold">
                  {inscripcionesFiltradas.length}
                </p>
              </div>
            </section>

            <section className="mb-6 grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-200">
                  Buscar inscripción
                </label>

                <input
                  type="text"
                  value={busqueda}
                  onChange={(event) => setBusqueda(event.target.value)}
                  placeholder="Buscar por nombre, teléfono, email, curso, mensaje..."
                  className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-200">
                  Filtrar por estado
                </label>

                <select
                  value={filtroEstado}
                  onChange={(event) => setFiltroEstado(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                >
                  <option value="todos">Todos los estados</option>
                  {ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            {!inscripcionesFiltradas.length ? (
              <section className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
                <h2 className="text-2xl font-bold">
                  No hay inscripciones para mostrar
                </h2>

                <p className="mt-3 text-neutral-300">
                  Cuando alguien complete el formulario de inscripción, aparecerá acá.
                </p>
              </section>
            ) : (
              <section className="grid gap-4">
                {inscripcionesFiltradas.map((inscripcion) => {
                  const estadoActual = inscripcion.estado || "pendiente";

                  return (
                    <article
                      key={inscripcion.id}
                      className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1">
                          <div className="mb-4 flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-neutral-950">
                              #{inscripcion.id}
                            </span>

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${claseEstado(
                                estadoActual
                              )}`}
                            >
                              {estadoActual}
                            </span>

                            {inscripcion.created_at && (
                              <span className="text-sm text-neutral-400">
                                {formatearValor(inscripcion.created_at)}
                              </span>
                            )}
                          </div>

                          <h2 className="text-2xl font-bold">
                            {inscripcion.nombre ||
                              inscripcion.name ||
                              "Sin nombre"}
                          </h2>

                          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {Object.entries(inscripcion)
                              .filter(([campo]) => {
                                return ![
                                  "id",
                                  "created_at",
                                  "estado",
                                ].includes(campo);
                              })
                              .map(([campo, valor]) => (
                                <div
                                  key={campo}
                                  className="rounded-2xl border border-white/10 bg-neutral-950/60 p-4"
                                >
                                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                    {campo.replaceAll("_", " ")}
                                  </p>

                                  <p className="break-words text-sm text-neutral-200">
                                    {formatearValor(valor)}
                                  </p>
                                </div>
                              ))}
                          </div>
                        </div>

                        <div className="w-full rounded-2xl border border-white/10 bg-neutral-950/60 p-4 lg:w-72">
                          <label className="mb-2 block text-sm font-medium text-neutral-200">
                            Cambiar estado
                          </label>

                          <select
                            value={estadoActual}
                            disabled={accionandoId === inscripcion.id}
                            onChange={(event) =>
                              cambiarEstado(inscripcion.id, event.target.value)
                            }
                            className="mb-3 w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400 disabled:opacity-60"
                          >
                            {ESTADOS.map((estado) => (
                              <option key={estado} value={estado}>
                                {estado}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() =>
                              eliminarInscripcion(inscripcion.id)
                            }
                            disabled={accionandoId === inscripcion.id}
                            className="w-full rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {accionandoId === inscripcion.id
                              ? "Procesando..."
                              : "Eliminar inscripción"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}
          </>
        )}

        {tabActiva === "cursos" && (
          <>
            <section className="mb-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-neutral-400">Total cursos</p>
                <p className="mt-2 text-4xl font-bold text-yellow-400">
                  {cursos.length}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-neutral-400">Activos</p>
                <p className="mt-2 text-4xl font-bold">
                  {cursos.filter((curso) => curso.activo).length}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-neutral-400">Destacados</p>
                <p className="mt-2 text-4xl font-bold">
                  {cursos.filter((curso) => curso.destacado).length}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-neutral-400">Mostrando</p>
                <p className="mt-2 text-4xl font-bold">
                  {cursosFiltrados.length}
                </p>
              </div>
            </section>

            <section className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                    Cursos
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    {cursoEditandoId
                      ? "Editar curso"
                      : "Crear nuevo curso"}
                  </h2>
                </div>

                {cursoEditandoId && (
                  <button
                    onClick={resetearFormularioCurso}
                    className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/20"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>

              <form onSubmit={guardarCurso} className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-200">
                      Título del curso *
                    </label>

                    <input
                      type="text"
                      value={formCurso.titulo}
                      onChange={(event) =>
                        actualizarCampoCurso("titulo", event.target.value)
                      }
                      placeholder="Ej: Guía Canino desde Cero"
                      className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-200">
                      Slug / URL
                    </label>

                    <input
                      type="text"
                      value={formCurso.slug}
                      onChange={(event) =>
                        actualizarCampoCurso("slug", event.target.value)
                      }
                      placeholder="guia-canino-desde-cero"
                      className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-200">
                    Descripción
                  </label>

                  <textarea
                    value={formCurso.descripcion}
                    onChange={(event) =>
                      actualizarCampoCurso("descripcion", event.target.value)
                    }
                    placeholder="Descripción general del curso..."
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-200">
                      Categoría
                    </label>

                    <input
                      type="text"
                      value={formCurso.categoria}
                      onChange={(event) =>
                        actualizarCampoCurso("categoria", event.target.value)
                      }
                      placeholder="Formación inicial"
                      className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-200">
                      Precio
                    </label>

                    <input
                      type="text"
                      value={formCurso.precio}
                      onChange={(event) =>
                        actualizarCampoCurso("precio", event.target.value)
                      }
                      placeholder="Consultar / $..."
                      className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-200">
                      Duración
                    </label>

                    <input
                      type="text"
                      value={formCurso.duracion}
                      onChange={(event) =>
                        actualizarCampoCurso("duracion", event.target.value)
                      }
                      placeholder="8 semanas"
                      className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-200">
                      Modalidad
                    </label>

                    <input
                      type="text"
                      value={formCurso.modalidad}
                      onChange={(event) =>
                        actualizarCampoCurso("modalidad", event.target.value)
                      }
                      placeholder="Presencial / Online"
                      className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-200">
                    URL de imagen
                  </label>

                  <input
                    type="text"
                    value={formCurso.imagen_url}
                    onChange={(event) =>
                      actualizarCampoCurso("imagen_url", event.target.value)
                    }
                    placeholder="https://..."
                    className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-neutral-900 p-4">
                    <input
                      type="checkbox"
                      checked={formCurso.activo}
                      onChange={(event) =>
                        actualizarCampoCurso("activo", event.target.checked)
                      }
                      className="h-5 w-5"
                    />

                    <span>
                      <span className="block font-semibold">
                        Curso activo
                      </span>
                      <span className="text-sm text-neutral-400">
                        Si está activo, luego podrá mostrarse en la web pública.
                      </span>
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-neutral-900 p-4">
                    <input
                      type="checkbox"
                      checked={formCurso.destacado}
                      onChange={(event) =>
                        actualizarCampoCurso("destacado", event.target.checked)
                      }
                      className="h-5 w-5"
                    />

                    <span>
                      <span className="block font-semibold">
                        Curso destacado
                      </span>
                      <span className="text-sm text-neutral-400">
                        Sirve para marcar cursos principales.
                      </span>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="rounded-2xl bg-yellow-500 px-5 py-3 font-bold text-neutral-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cargando
                    ? "Guardando..."
                    : cursoEditandoId
                    ? "Guardar cambios"
                    : "Crear curso"}
                </button>
              </form>
            </section>

            <section className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5">
              <label className="mb-2 block text-sm font-medium text-neutral-200">
                Buscar curso
              </label>

              <input
                type="text"
                value={busquedaCursos}
                onChange={(event) => setBusquedaCursos(event.target.value)}
                placeholder="Buscar por título, categoría, modalidad..."
                className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
              />
            </section>

            {!cursosFiltrados.length ? (
              <section className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
                <h2 className="text-2xl font-bold">
                  No hay cursos para mostrar
                </h2>

                <p className="mt-3 text-neutral-300">
                  Cuando crees un curso desde el formulario, aparecerá acá.
                </p>
              </section>
            ) : (
              <section className="grid gap-4 md:grid-cols-2">
                {cursosFiltrados.map((curso) => (
                  <article
                    key={curso.id}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl"
                  >
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-neutral-950">
                        #{curso.id}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                          curso.activo
                            ? "border-green-500/30 bg-green-500/10 text-green-200"
                            : "border-red-500/30 bg-red-500/10 text-red-200"
                        }`}
                      >
                        {curso.activo ? "Activo" : "Inactivo"}
                      </span>

                      {curso.destacado && (
                        <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-200">
                          Destacado
                        </span>
                      )}
                    </div>

                    {curso.imagen_url && (
                      <img
                        src={curso.imagen_url}
                        alt={curso.titulo}
                        className="mb-4 h-48 w-full rounded-2xl object-cover"
                      />
                    )}

                    <h2 className="text-2xl font-bold">
                      {curso.titulo}
                    </h2>

                    <p className="mt-2 text-sm text-yellow-400">
                      /cursos/{curso.slug}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-neutral-300">
                      {curso.descripcion || "Sin descripción."}
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-4">
                        <p className="text-xs uppercase tracking-wide text-neutral-500">
                          Categoría
                        </p>
                        <p className="mt-1 text-sm text-neutral-200">
                          {formatearValor(curso.categoria)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-4">
                        <p className="text-xs uppercase tracking-wide text-neutral-500">
                          Precio
                        </p>
                        <p className="mt-1 text-sm text-neutral-200">
                          {formatearValor(curso.precio)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-4">
                        <p className="text-xs uppercase tracking-wide text-neutral-500">
                          Duración
                        </p>
                        <p className="mt-1 text-sm text-neutral-200">
                          {formatearValor(curso.duracion)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-4">
                        <p className="text-xs uppercase tracking-wide text-neutral-500">
                          Modalidad
                        </p>
                        <p className="mt-1 text-sm text-neutral-200">
                          {formatearValor(curso.modalidad)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button
                        onClick={() => editarCurso(curso)}
                        className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold transition hover:bg-white/20"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => eliminarCurso(curso.id)}
                        disabled={accionandoId === curso.id}
                        className="flex-1 rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {accionandoId === curso.id
                          ? "Eliminando..."
                          : "Eliminar"}
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}