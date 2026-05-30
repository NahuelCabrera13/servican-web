"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [inscripciones, setInscripciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

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

  function cerrarSesion() {
    localStorage.removeItem("servican_admin_password");
    setPassword("");
    setIsLogged(false);
    setInscripciones([]);
    setBusqueda("");
    setError("");
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

  const inscripcionesFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return inscripciones;

    return inscripciones.filter((inscripcion) => {
      return Object.values(inscripcion).some((valor) =>
        String(valor || "").toLowerCase().includes(texto)
      );
    });
  }, [busqueda, inscripciones]);

  const columnas = useMemo(() => {
    if (!inscripcionesFiltradas.length) return [];

    const columnasDetectadas = Object.keys(inscripcionesFiltradas[0]);

    const ordenPreferido = [
      "id",
      "nombre",
      "apellido",
      "telefono",
      "email",
      "correo",
      "curso",
      "mensaje",
      "estado",
      "created_at",
      "fecha",
    ];

    const primero = ordenPreferido.filter((columna) =>
      columnasDetectadas.includes(columna)
    );

    const resto = columnasDetectadas.filter(
      (columna) => !primero.includes(columna)
    );

    return [...primero, ...resto];
  }, [inscripcionesFiltradas]);

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
                Gestión inicial de inscripciones guardadas en Supabase.
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

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-neutral-400">Total de inscripciones</p>
            <p className="mt-2 text-4xl font-bold text-yellow-400">
              {inscripciones.length}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-neutral-400">Mostrando</p>
            <p className="mt-2 text-4xl font-bold">
              {inscripcionesFiltradas.length}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-neutral-400">Próxima mejora</p>
            <p className="mt-2 text-lg font-semibold">
              Estados, eliminar y editar
            </p>
          </div>
        </section>

        <section className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5">
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
        </section>

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
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead className="bg-white/10 text-xs uppercase tracking-wide text-neutral-300">
                  <tr>
                    {columnas.map((columna) => (
                      <th key={columna} className="px-4 py-4">
                        {columna.replaceAll("_", " ")}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {inscripcionesFiltradas.map((inscripcion, index) => (
                    <tr
                      key={inscripcion.id || index}
                      className="border-t border-white/10 transition hover:bg-white/5"
                    >
                      {columnas.map((columna) => (
                        <td
                          key={columna}
                          className="max-w-[260px] px-4 py-4 align-top text-neutral-200"
                        >
                          <span className="line-clamp-4">
                            {formatearValor(inscripcion[columna])}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}