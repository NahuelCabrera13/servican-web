"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const ROLES = ["admin", "instructor", "alumno"];

export default function UsuariosPanel({ usuarioActual, perfilActual }) {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [cargando, setCargando] = useState(true);
  const [accionandoId, setAccionandoId] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

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
        setError(data?.error || "No se pudieron cargar los usuarios.");
        return;
      }

      setUsuarios(data.usuarios || []);
    } catch (error) {
      setError("Error de conexión al cargar usuarios.");
      setUsuarios([]);
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
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
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
                  </div>

                  <div className="w-full rounded-2xl border border-white/10 bg-neutral-950/60 p-4 lg:w-80">
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