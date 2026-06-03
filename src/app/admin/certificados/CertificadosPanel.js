"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BotonCerrarSesion from "@/app/components/BotonCerrarSesion";

const ESTADOS = ["emitido", "anulado"];

function formatearFecha(fecha) {
  if (!fecha) return "—";

  return new Date(fecha).toLocaleString("es-UY", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function claseEstado(estado) {
  if (estado === "emitido") {
    return "border-green-500/30 bg-green-500/10 text-green-300";
  }

  return "border-red-500/30 bg-red-500/10 text-red-300";
}

export default function CertificadosPanel({ usuario, perfil }) {
  const [certificados, setCertificados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [cargando, setCargando] = useState(true);
  const [accionandoId, setAccionandoId] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    cargarCertificados();
  }, []);

  async function cargarCertificados() {
    setCargando(true);
    setMensaje("");
    setError("");

    try {
      const respuesta = await fetch("/api/admin/certificados", {
        method: "GET",
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setCertificados([]);
        setError(data?.error || "No se pudieron cargar los certificados.");
        return;
      }

      setCertificados(data.certificados || []);
    } catch (error) {
      setCertificados([]);
      setError("Error de conexión al cargar certificados.");
    } finally {
      setCargando(false);
    }
  }

  async function cambiarEstado(id, estado) {
    setAccionandoId(id);
    setMensaje("");
    setError("");

    try {
      const respuesta = await fetch("/api/admin/certificados", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          estado,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo cambiar el estado.");
        return;
      }

      setCertificados((actuales) =>
        actuales.map((certificado) =>
          certificado.id === id ? data.certificado : certificado
        )
      );

      setMensaje("Estado del certificado actualizado.");
    } catch (error) {
      setError("Error de conexión al cambiar estado.");
    } finally {
      setAccionandoId(null);
    }
  }

  async function copiarCodigo(codigo) {
    try {
      await navigator.clipboard.writeText(codigo);
      alert("Código copiado correctamente.");
    } catch (error) {
      alert("No se pudo copiar el código.");
    }
  }

  const certificadosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return certificados.filter((certificado) => {
      const coincideTexto = !texto
        ? true
        : [
            certificado.codigo,
            certificado.nombre_alumno,
            certificado.email_alumno,
            certificado.titulo_curso,
            certificado.estado,
          ].some((valor) =>
            String(valor || "").toLowerCase().includes(texto)
          );

      const coincideEstado =
        filtroEstado === "todos"
          ? true
          : certificado.estado === filtroEstado;

      return coincideTexto && coincideEstado;
    });
  }, [certificados, busqueda, filtroEstado]);

  const resumen = useMemo(() => {
    return {
      total: certificados.length,
      emitidos: certificados.filter((item) => item.estado === "emitido").length,
      anulados: certificados.filter((item) => item.estado === "anulado").length,
      mostrando: certificadosFiltrados.length,
    };
  }, [certificados, certificadosFiltrados]);

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
                Certificados emitidos
              </h1>

              <p className="mt-1 text-sm text-neutral-300">
                Sesión iniciada como {perfil?.email || usuario?.email}
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
              onClick={cargarCertificados}
              disabled={cargando}
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/20 disabled:opacity-60"
            >
              {cargando ? "Actualizando..." : "Actualizar"}
            </button>

<BotonCerrarSesion className="..." />

          </div>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-neutral-400">Total</p>
            <p className="mt-2 text-4xl font-bold text-yellow-400">
              {resumen.total}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-neutral-400">Emitidos</p>
            <p className="mt-2 text-4xl font-bold text-green-300">
              {resumen.emitidos}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-neutral-400">Anulados</p>
            <p className="mt-2 text-4xl font-bold text-red-300">
              {resumen.anulados}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-neutral-400">Mostrando</p>
            <p className="mt-2 text-4xl font-bold">
              {resumen.mostrando}
            </p>
          </div>
        </section>

        <section className="mb-6 grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-200">
              Buscar certificado
            </label>

            <input
              type="text"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por alumno, email, curso, código..."
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

        {cargando && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <h2 className="text-2xl font-bold">
              Cargando certificados...
            </h2>
          </section>
        )}

        {!cargando && certificadosFiltrados.length === 0 && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <h2 className="text-2xl font-bold">
              No hay certificados para mostrar
            </h2>

            <p className="mt-3 text-neutral-300">
              Cuando los alumnos completen cursos, los certificados aparecerán acá.
            </p>
          </section>
        )}

        {!cargando && certificadosFiltrados.length > 0 && (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {certificadosFiltrados.map((certificado) => (
              <article
                key={certificado.id}
                className="rounded-3xl border border-yellow-500/20 bg-white/5 p-6 shadow-xl"
              >
                <div className="mb-4 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${claseEstado(
                      certificado.estado
                    )}`}
                  >
                    {certificado.estado}
                  </span>

                  <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-yellow-300">
                    SERVICAN
                  </span>
                </div>

                <h2 className="text-2xl font-bold">
                  {certificado.titulo_curso}
                </h2>

                <p className="mt-2 text-sm text-yellow-400">
                  {certificado.codigo}
                </p>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-neutral-950 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                      Alumno
                    </p>
                    <p className="mt-2 text-sm font-bold text-neutral-200">
                      {certificado.nombre_alumno || "Sin nombre"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-neutral-950 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                      Email
                    </p>
                    <p className="mt-2 break-words text-sm font-bold text-neutral-200">
                      {certificado.email_alumno || "Sin email"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-neutral-950 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                      Emitido
                    </p>
                    <p className="mt-2 text-sm font-bold text-neutral-200">
                      {formatearFecha(certificado.emitido_at)}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-sm font-medium text-neutral-200">
                    Estado
                  </label>

                  <select
                    value={certificado.estado}
                    disabled={accionandoId === certificado.id}
                    onChange={(event) =>
                      cambiarEstado(certificado.id, event.target.value)
                    }
                    className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400 disabled:opacity-60"
                  >
                    {ESTADOS.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-5 grid gap-3">
                  <Link
                    href={`/panel/certificados/${certificado.codigo}`}
                    className="rounded-2xl bg-yellow-500 px-5 py-3 text-center text-sm font-bold text-neutral-950 transition hover:bg-yellow-400"
                  >
                    Ver certificado privado
                  </Link>

                  <button
                    type="button"
                    onClick={() => copiarCodigo(certificado.codigo)}
                    className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                  >
                    Copiar código
                  </button>

                  <Link
                    href="/verificar-certificado"
                    className="rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-3 text-center text-sm font-bold text-green-200 transition hover:bg-green-500/20"
                  >
                    Verificar públicamente
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}