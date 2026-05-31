"use client";

import { useState } from "react";
import Link from "next/link";

function formatearFecha(fecha) {
  if (!fecha) return "—";

  return new Date(fecha).toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function VerificarCertificadoPage() {
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function verificarCertificado(event) {
    event.preventDefault();

    setCargando(true);
    setError("");
    setResultado(null);

    try {
      const respuesta = await fetch("/api/certificados/verificar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo verificar el certificado.");
        return;
      }

      setResultado(data);
    } catch (error) {
      setError("Error de conexión al verificar el certificado.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8 flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-4">
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
                Verificar certificado
              </h1>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-semibold transition hover:bg-white/20"
          >
            Volver al inicio
          </Link>
        </header>

        <section className="rounded-3xl border border-yellow-500/20 bg-white/5 p-6 shadow-2xl md:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-400">
              Validación pública
            </p>

            <h2 className="mt-4 text-4xl font-black md:text-6xl">
              Comprobá si un certificado es válido
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-neutral-300">
              Ingresá el código del certificado emitido por SERVICAN. Esta
              página solo confirma la validez del certificado, no muestra ni
              permite descargar el documento original.
            </p>
          </div>

          <form
            onSubmit={verificarCertificado}
            className="mx-auto mt-8 grid max-w-3xl gap-4 md:grid-cols-[1fr_auto]"
          >
            <input
              type="text"
              value={codigo}
              onChange={(event) => setCodigo(event.target.value)}
              placeholder="Ej: SERVICAN-2026-ABC123"
              className="rounded-2xl border border-white/10 bg-neutral-900 px-5 py-4 text-white outline-none transition focus:border-yellow-400"
            />

            <button
              type="submit"
              disabled={cargando}
              className="rounded-2xl bg-yellow-500 px-6 py-4 font-bold text-neutral-950 transition hover:bg-yellow-400 disabled:opacity-60"
            >
              {cargando ? "Verificando..." : "Verificar"}
            </button>
          </form>

          {error && (
            <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {resultado?.encontrado === false && (
            <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-center">
              <p className="text-4xl">❌</p>

              <h3 className="mt-4 text-2xl font-bold text-red-200">
                Certificado no encontrado
              </h3>

              <p className="mt-3 text-sm leading-6 text-red-100">
                No se encontró ningún certificado emitido por SERVICAN con ese
                código. Revisá que el código esté escrito correctamente.
              </p>
            </div>
          )}

          {resultado?.encontrado && (
            <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-green-500/30 bg-green-500/10 p-6">
              <div className="text-center">
                <p className="text-5xl">✅</p>

                <h3 className="mt-4 text-3xl font-black text-green-200">
                  Certificado válido
                </h3>

                <p className="mt-3 text-sm leading-6 text-green-100">
                  Este código corresponde a un certificado emitido por SERVICAN.
                </p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-neutral-950/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                    Código
                  </p>
                  <p className="mt-2 break-words font-bold text-white">
                    {resultado.certificado.codigo}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-neutral-950/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                    Alumno
                  </p>
                  <p className="mt-2 font-bold text-white">
                    {resultado.certificado.alumno}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-neutral-950/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                    Curso
                  </p>
                  <p className="mt-2 font-bold text-white">
                    {resultado.certificado.curso}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-neutral-950/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                    Fecha de emisión
                  </p>
                  <p className="mt-2 font-bold text-white">
                    {formatearFecha(resultado.certificado.emitido_at)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-neutral-950/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                    Emitido por
                  </p>
                  <p className="mt-2 font-bold text-white">
                    {resultado.certificado.emisor}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-neutral-950/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                    Estado
                  </p>
                  <p className="mt-2 font-bold uppercase text-green-300">
                    {resultado.certificado.estado}
                  </p>
                </div>
              </div>

              <p className="mt-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm leading-6 text-yellow-100">
                Por seguridad, esta verificación no muestra el certificado
                completo ni permite descargarlo. Solo confirma que el código fue
                emitido por SERVICAN.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}