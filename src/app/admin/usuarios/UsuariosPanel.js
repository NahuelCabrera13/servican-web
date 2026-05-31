"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const ROLES = ["admin", "instructor", "alumno"];
const ESTADOS_ACCESO = ["activo", "pendiente", "pausado", "finalizado", "cancelado"];

export default function UsuariosPanel({ usuarioActual, perfilActual }) {
  const [usuarios, setUsuarios] = useState([]);
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [cargando, setCargando] = useState(true);
  const [accionandoId, setAccionandoId] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [cursoSeleccionado, setCursoSeleccionado] = useState({});
  const [estadoSeleccionado, setEstadoSeleccionado] = useState({});

  useEffect(() => {
    cargarUsuarios();
  }, []);

  async function cargarUsuarios() {
    setCargando(true);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetch("/api/admin/usuarios", {
        method: "GET",
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setUsuarios([]);
        setCursosDisponibles([]);
        setError(data?.error || "No se pudieron cargar los usuarios.");
        return;
      }

      setUsuarios(data.usuarios || []);
      setCursosDisponibles(data.cursos || []);
    } catch (error) {
      setError("Error de conexión al cargar usuarios.");
      setUsuarios([]);
      setCursosDisponibles([]);
    } finally {
      setCargando(false);
    }
  }

  async function cambiarRol(userId, nuevoRol) {
    setAccionandoId(userId);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetch("/api/admin/usuarios", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          role: nuevoRol,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo cambiar el rol.");
        return;
      }

      setUsuarios((actuales) =>
        actuales.map((usuario) =>
          usuario.user_id === userId
            ? {
                ...usuario,
                role: nuevoRol,
              }
            : usuario
        )
      );

      setMensaje("Rol actualizado correctamente.");
    } catch (error) {
      setError("Error de conexión al cambiar el rol.");
    } finally {
      setAccionandoId(null);
    }
  }

  async function habilitarCurso(userId) {
    const cursoId = cursoSeleccionado[userId];
    const estado = estadoSeleccionado[userId] || "activo";

    if (!cursoId) {
      setError("Seleccioná un curso para habilitar.");
      return;
    }

    setAccionandoId(`${userId}-${cursoId}`);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetch("/api/admin/usuarios", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "acceso_curso",
          user_id: userId,
          curso_id: Number(cursoId),
          estado,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo habilitar el curso.");
        return;
      }

      setUsuarios((actuales) =>
        actuales.map((usuario) => {
          if (usuario.user_id !== userId) return usuario;

          const accesosActuales = usuario.cursos_habilitados || [];
          const accesosSinRepetir = accesosActuales.filter(
            (acceso) => acceso.curso_id !== Number(cursoId)
          );

          return {
            ...usuario,
            cursos_habilitados: [data.acceso, ...accesosSinRepetir],
          };
        })
      );

      setMensaje("Curso habilitado correctamente.");
    } catch (error) {
      setError("Error de conexión al habilitar el curso.");
    } finally {
      setAccionandoId(null);
    }
  }

  async function cambiarEstadoAcceso(acceso, nuevoEstado) {
    setAccionandoId(`acceso-${acceso.id}`);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetch("/api/admin/usuarios", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "acceso_curso",
          user_id: acceso.user_id,
          curso_id: acceso.curso_id,
          estado: nuevoEstado,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo cambiar el estado del curso.");
        return;
      }

      setUsuarios((actuales) =>
        actuales.map((usuario) => {
          if (usuario.user_id !== acceso.user_id) return usuario;

          return {
            ...usuario,
            cursos_habilitados: (usuario.cursos_habilitados || []).map(
              (item) => (item.id === acceso.id ? data.acceso : item)
            ),
          };
        })
      );

      setMensaje("Estado del curso actualizado.");
    } catch (error) {
      setError("Error de conexión al cambiar estado del curso.");
    } finally {
      setAccionandoId(null);
    }
  }

  async function quitarAcceso(acceso) {
    const confirmar = window.confirm(
      `¿Quitar el acceso al curso "${acceso.curso?.titulo || "curso"}"?`
    );

    if (!confirmar) return;

    setAccionandoId(`acceso-${acceso.id}`);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetch("/api/admin/usuarios", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "acceso_curso",
          id: acceso.id,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo quitar el acceso.");
        return;
      }

      setUsuarios((actuales) =>
        actuales.map((usuario) => {
          if (usuario.user_id !== acceso.user_id) return usuario;

          return {
            ...usuario,
            cursos_habilitados: (usuario.cursos_habilitados || []).filter(
              (item) => item.id !== acceso.id
            ),
          };
        })
      );

      setMensaje("Acceso quitado correctamente.");
    } catch (error) {
      setError("Error de conexión al quitar acceso.");
    } finally {
      setAccionandoId(null);
    }
  }

  function formatearFecha(valor) {
    if (!valor) return "—";

    return new Date(valor).toLocaleString("es-UY", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  function claseRol(role) {
    if (role === "admin") {
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-200";
    }

    if (role === "instructor") {
      return "border-blue-500/30 bg-blue-500/10 text-blue-200";
    }

    return "border-green-500/30 bg-green-500/10 text-green-200";
  }

  function nombreRol(role) {
    if (role === "admin") return "Administrador";
    if (role === "instructor") return "Instructor";
    return "Alumno";
  }

  function claseEstadoAcceso(estado) {
    if (estado === "activo") {
      return "border-green-500/30 bg-green-500/10 text-green-200";
    }

    if (estado === "pendiente") {
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-200";
    }

    if (estado === "pausado") {
      return "border-blue-500/30 bg-blue-500/10 text-blue-200";
    }

    if (estado === "finalizado") {
      return "border-zinc-500/30 bg-zinc-500/10 text-zinc-200";
    }

    return "border-red-500/30 bg-red-500/10 text-red-200";
  }

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return usuarios.filter((usuario) => {
      const coincideTexto = !texto
        ? true
        : [
            usuario.nombre,
            usuario.email,
            usuario.role,
            usuario.user_id,
          ].some((valor) =>
            String(valor || "").toLowerCase().includes(texto)
          );

      const coincideRol =
        filtroRol === "todos" ? true : usuario.role === filtroRol;

      return coincideTexto && coincideRol;
    });
  }, [usuarios, busqueda, filtroRol]);

  const resumen = useMemo(() => {
    return {
      total: usuarios.length,
      admin: usuarios.filter((usuario) => usuario.role === "admin").length,
      instructor: usuarios.filter((usuario) => usuario.role === "instructor")
        .length,
      alumno: usuarios.filter((usuario) => usuario.role === "alumno").length,
    };
  }, [usuarios]);

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
                Usuarios y roles
              </h1>

              <p className="mt-1 text-sm text-neutral-300">
                Sesión iniciada como {perfilActual?.email || usuarioActual?.email}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-semibold transition hover:bg-white/20"
            >
              Volver al panel
            </Link>

            <button
              onClick={cargarUsuarios}
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

        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-neutral-400">Total usuarios</p>
            <p className="mt-2 text-4xl font-bold text-yellow-400">
              {resumen.total}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-neutral-400">Administradores</p>
            <p className="mt-2 text-4xl font-bold">
              {resumen.admin}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-neutral-400">Instructores</p>
            <p className="mt-2 text-4xl font-bold">
              {resumen.instructor}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-neutral-400">Alumnos</p>
            <p className="mt-2 text-4xl font-bold">
              {resumen.alumno}
            </p>
          </div>
        </section>

        <section className="mb-6 grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-200">
              Buscar usuario
            </label>

            <input
              type="text"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por nombre, email o rol..."
              className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-200">
              Filtrar por rol
            </label>

            <select
              value={filtroRol}
              onChange={(event) => setFiltroRol(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
            >
              <option value="todos">Todos los roles</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {nombreRol(role)}
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

        {cargando && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <h2 className="text-2xl font-bold">
              Cargando usuarios...
            </h2>
          </section>
        )}

        {!cargando && !usuariosFiltrados.length && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <h2 className="text-2xl font-bold">
              No hay usuarios para mostrar
            </h2>

            <p className="mt-3 text-neutral-300">
              Cuando se registren usuarios, aparecerán en esta sección.
            </p>
          </section>
        )}

        {!cargando && Boolean(usuariosFiltrados.length) && (
          <section className="grid gap-4">
            {usuariosFiltrados.map((usuario) => (
              <article
                key={usuario.user_id}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl"
              >
                <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                  <div>
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${claseRol(
                          usuario.role
                        )}`}
                      >
                        {nombreRol(usuario.role)}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                          usuario.confirmado
                            ? "border-green-500/30 bg-green-500/10 text-green-200"
                            : "border-red-500/30 bg-red-500/10 text-red-200"
                        }`}
                      >
                        {usuario.confirmado ? "Confirmado" : "Sin confirmar"}
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold">
                      {usuario.nombre || "Usuario sin nombre"}
                    </h2>

                    <p className="mt-2 text-sm text-yellow-400">
                      {usuario.email || "Sin email"}
                    </p>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-4">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          ID usuario
                        </p>

                        <p className="break-words text-sm text-neutral-200">
                          {usuario.user_id}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-4">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          Creado
                        </p>

                        <p className="text-sm text-neutral-200">
                          {formatearFecha(usuario.created_at)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-4">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          Último ingreso
                        </p>

                        <p className="text-sm text-neutral-200">
                          {formatearFecha(usuario.ultimo_ingreso)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-3xl border border-white/10 bg-neutral-950/60 p-5">
                      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                            Cursos habilitados
                          </p>

                          <h3 className="mt-2 text-xl font-bold">
                            Accesos del alumno
                          </h3>
                        </div>

                        <p className="text-sm text-neutral-400">
                          {(usuario.cursos_habilitados || []).length} acceso(s)
                        </p>
                      </div>

                      {(usuario.cursos_habilitados || []).length === 0 && (
                        <p className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-neutral-400">
                          Este usuario todavía no tiene cursos habilitados.
                        </p>
                      )}

                      {(usuario.cursos_habilitados || []).length > 0 && (
                        <div className="space-y-3">
                          {(usuario.cursos_habilitados || []).map((acceso) => (
                            <div
                              key={acceso.id}
                              className="rounded-2xl border border-white/10 bg-black/40 p-4"
                            >
                              <div className="mb-3 flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${claseEstadoAcceso(
                                    acceso.estado
                                  )}`}
                                >
                                  {acceso.estado}
                                </span>

                                {acceso.curso?.activo ? (
                                  <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-200">
                                    Curso público activo
                                  </span>
                                ) : (
                                  <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-200">
                                    Curso público inactivo
                                  </span>
                                )}
                              </div>

                              <h4 className="font-bold">
                                {acceso.curso?.titulo || "Curso eliminado"}
                              </h4>

                              <p className="mt-1 text-xs text-neutral-500">
                                {acceso.curso?.slug
                                  ? `/panel/cursos/${acceso.curso.slug}`
                                  : "Sin ruta"}
                              </p>

                              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                                <select
                                  value={acceso.estado}
                                  disabled={accionandoId === `acceso-${acceso.id}`}
                                  onChange={(event) =>
                                    cambiarEstadoAcceso(
                                      acceso,
                                      event.target.value
                                    )
                                  }
                                  className="rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-400 disabled:opacity-60"
                                >
                                  {ESTADOS_ACCESO.map((estado) => (
                                    <option key={estado} value={estado}>
                                      {estado}
                                    </option>
                                  ))}
                                </select>

                                <button
                                  onClick={() => quitarAcceso(acceso)}
                                  disabled={accionandoId === `acceso-${acceso.id}`}
                                  className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-400 disabled:opacity-60"
                                >
                                  Quitar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_auto]">
                        <select
                          value={cursoSeleccionado[usuario.user_id] || ""}
                          onChange={(event) =>
                            setCursoSeleccionado((actual) => ({
                              ...actual,
                              [usuario.user_id]: event.target.value,
                            }))
                          }
                          className="rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-400"
                        >
                          <option value="">Seleccionar curso</option>
                          {cursosDisponibles.map((curso) => (
                            <option key={curso.id} value={curso.id}>
                              {curso.titulo}
                            </option>
                          ))}
                        </select>

                        <select
                          value={estadoSeleccionado[usuario.user_id] || "activo"}
                          onChange={(event) =>
                            setEstadoSeleccionado((actual) => ({
                              ...actual,
                              [usuario.user_id]: event.target.value,
                            }))
                          }
                          className="rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-400"
                        >
                          {ESTADOS_ACCESO.map((estado) => (
                            <option key={estado} value={estado}>
                              {estado}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => habilitarCurso(usuario.user_id)}
                          disabled={accionandoId?.startsWith(usuario.user_id)}
                          className="rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-bold text-neutral-950 transition hover:bg-yellow-400 disabled:opacity-60"
                        >
                          Habilitar
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-4">
                    <label className="mb-2 block text-sm font-medium text-neutral-200">
                      Cambiar rol
                    </label>

                    <select
                      value={usuario.role}
                      disabled={accionandoId === usuario.user_id}
                      onChange={(event) =>
                        cambiarRol(usuario.user_id, event.target.value)
                      }
                      className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400 disabled:opacity-60"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {nombreRol(role)}
                        </option>
                      ))}
                    </select>

                    {usuario.user_id === usuarioActual?.id && (
                      <p className="mt-3 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-xs text-yellow-100">
                        Este es tu usuario actual. Tené cuidado al cambiar tu propio rol.
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}