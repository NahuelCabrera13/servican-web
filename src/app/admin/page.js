"use client";

import { useEffect, useMemo, useState } from "react";

const ESTADOS = [
  "pendiente",
  "contactado",
  "interesado",
  "pagó",
  "rechazado",
];

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [inscripciones, setInscripciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [cargando, setCargando] = useState(false);
  const [accionandoId, setAccionandoId] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const savedPassword = localStorage.getItem("servican_admin_password");

    if (savedPassword) {
      setPassword(savedPassword);
      cargarInscripciones(savedPassword, false);
    }
  }, []);

  async function cargarInscripciones(passwordToUse = password, guardar = true) {
    setCargando(true);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetch("/api/admin/inscripciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: passwordToUse,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setIsLogged(false);
        setInscripciones([]);
        setError(data?.error || "No se pudieron cargar las inscripciones.");
        return;
      }

      setInscripciones(data.inscripciones || []);
      setIsLogged(true);

      if (guardar) {
        localStorage.setItem("servican_admin_password", passwordToUse);
      }
    } catch (error) {
      setError("Error de conexión con el panel administrador.");
      setIsLogged(false);
      setInscripciones([]);
    } finally {
      setCargando(false);
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
          password,
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
          password,
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

  function cerrarSesion() {
    localStorage.removeItem("servican_admin_password");
    setPassword("");
    setIsLogged(false);
    setInscripciones([]);
    setBusqueda("");
    setFiltroEstado("todos");
    setError("");
    setMensaje("");
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

  if (!isLogged) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white">
        <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
            <div className="mb-8 text-center">
              <img
                src="/logo-servican.jpeg"
                alt="Logo SERVICAN"
                className="mx-auto mb-5 h-24 w-24 rounded-full object-cover ring-4 ring-yellow-500/30"
              />

              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                SERVICAN
              </p>

              <h1 className="text-3xl font-bold">
                Panel administrador
              </h1>

              <p className="mt-3 text-sm text-neutral-300">
                Acceso privado para gestionar las inscripciones de la plataforma.
              </p>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                cargarInscripciones();
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-200">
                  Contraseña de administrador
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Ingresar contraseña"
                  className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="w-full rounded-2xl bg-yellow-500 px-5 py-3 font-bold text-neutral-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cargando ? "Ingresando..." : "Entrar al panel"}
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }

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
                Gestión de inscripciones guardadas en Supabase.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => cargarInscripciones(password, false)}
              disabled={cargando}
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/20 disabled:opacity-60"
            >
              {cargando ? "Actualizando..." : "Actualizar"}
            </button>

            <button
              onClick={cerrarSesion}
              className="rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

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
                        onClick={() => eliminarInscripcion(inscripcion.id)}
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
      </section>
    </main>
  );
}