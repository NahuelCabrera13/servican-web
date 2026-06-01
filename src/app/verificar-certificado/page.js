"use client";

import { useState } from "react";
import Link from "next/link";

function formatearFecha(fecha) {
  if (!fecha) return "—";

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) return "—";

  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const anio = date.getFullYear();

  return `${dia}/${mes}/${anio}`;
}

function limpiarCodigo(valor) {
  return String(valor || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function estadoEsAnulado(estado) {
  return String(estado || "").toLowerCase().trim() === "anulado";
}

function EstadoBadge({ estado }) {
  const anulado = estadoEsAnulado(estado);

  return (
    <span
      className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.2em] ${
        anulado
          ? "border-red-500/30 bg-red-500/10 text-red-200"
          : "border-green-500/30 bg-green-500/10 text-green-200"
      }`}
    >
      {anulado ? "Anulado" : "Emitido"}
    </span>
  );
}

function DatoCertificado({ titulo, valor }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-5">
      <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
        {titulo}
      </p>

      <p className="mt-2 break-words text-base font-black text-white">
        {valor || "—"}
      </p>
    </div>
  );
}

export default function VerificarCertificadoPage() {
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function verificarCertificado(event) {
    event.preventDefault();

    const codigoLimpio = limpiarCodigo(codigo);

    setCargando(true);
    setError("");
    setResultado(null);

    if (!codigoLimpio || codigoLimpio.length < 6) {
      setError("Ingresá un código de certificado válido.");
      setCargando(false);
      return;
    }

    try {
      const respuesta = await fetch("/api/certificados/verificar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo: codigoLimpio,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo verificar el certificado.");
        return;
      }

      setResultado(data);
    } catch (error) {
      console.error("Error verificando certificado:", error);
      setError("Error de conexión al verificar el certificado.");
    } finally {
      setCargando(false);
    }
  }

  const certificado = resultado?.certificado || null;
  const encontrado = resultado?.encontrado === true;
  const noEncontrado = resultado?.encontrado === false;
  const anulado = certificado ? estadoEsAnulado(certificado.estado) : false;

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-yellow-500/20 bg-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
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

              <p className="text-sm text-zinc-400">
                Verificación pública de certificados
              </p>
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
              className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-3 text-center text-sm font-bold text-yellow-200 transition hover:bg-yellow-500/20"
            >
              Ver cursos
            </Link>

            <Link
              href="/inscripcion"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/20"
            >
              Contacto
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-zinc-900 px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#3f3210_0%,#111_34%,#000_78%)]" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black to-transparent" />

        <div className="relative mx-auto grid max-w-[1450px] gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Validación pública
            </p>

            <h1 className="mt-4 text-5xl font-black leading-tight md:text-7xl">
              Verificar certificado SERVICAN
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
              Ingresá el código del certificado para comprobar si fue emitido
              por SERVICAN y si se encuentra vigente. Esta verificación no
              muestra ni permite descargar el certificado completo.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-yellow-300">
                Código único
              </span>

              <span className="rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-green-200">
                Verificación pública
              </span>

              <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-zinc-200">
                Certificado privado protegido
              </span>
            </div>
          </div>

          <div className="rounded-[2rem] border border-yellow-500/20 bg-black/60 p-6 shadow-2xl backdrop-blur">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
              Buscar certificado
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Ingresá el código
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              El código suele tener un formato similar a:
            </p>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black p-4">
              <p className="break-words font-mono text-sm font-bold text-yellow-300">
                SERVICAN-2026-ABC12345
              </p>
            </div>

            <form onSubmit={verificarCertificado} className="mt-6 space-y-4">
              <input
                type="text"
                value={codigo}
                onChange={(event) => {
                  setCodigo(event.target.value);
                  setError("");
                }}
                placeholder="Pegá o escribí el código"
                className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400"
              />

              <button
                type="submit"
                disabled={cargando}
                className="w-full rounded-2xl bg-yellow-500 px-6 py-4 font-black text-black transition hover:bg-yellow-400 disabled:opacity-60"
              >
                {cargando ? "Verificando..." : "Verificar certificado"}
              </button>
            </form>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm leading-6 text-red-200">
                {error}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          {!resultado && !error && (
            <div className="rounded-[2rem] border border-white/10 bg-zinc-950 p-8 text-center shadow-2xl">
              <p className="text-5xl">🔎</p>

              <h2 className="mt-5 text-3xl font-black">
                Esperando un código de verificación
              </h2>

              <p className="mx-auto mt-3 max-w-2xl leading-7 text-zinc-400">
                Escribí el código del certificado para confirmar si fue emitido
                por SERVICAN.
              </p>
            </div>
          )}

          {noEncontrado && (
            <div className="rounded-[2rem] border border-red-500/30 bg-red-500/10 p-8 text-center shadow-2xl">
              <p className="text-6xl">❌</p>

              <h2 className="mt-5 text-3xl font-black text-red-200">
                Certificado no encontrado
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-red-100">
                No se encontró ningún certificado emitido por SERVICAN con ese
                código. Revisá que esté escrito correctamente, respetando
                letras, números y guiones.
              </p>

              <button
                type="button"
                onClick={() => {
                  setResultado(null);
                  setCodigo("");
                  setError("");
                }}
                className="mt-7 rounded-2xl border border-red-500/30 bg-black/30 px-6 py-3 text-sm font-black text-red-100 transition hover:bg-red-500/20"
              >
                Intentar con otro código
              </button>
            </div>
          )}

          {encontrado && certificado && (
            <div
              className={`rounded-[2rem] border p-8 shadow-2xl ${
                anulado
                  ? "border-red-500/30 bg-red-500/10"
                  : "border-green-500/30 bg-green-500/10"
              }`}
            >
              <div className="text-center">
                <p className="text-6xl">{anulado ? "⚠️" : "✅"}</p>

                <div className="mt-5 flex justify-center">
                  <EstadoBadge estado={certificado.estado} />
                </div>

                <h2
                  className={`mt-5 text-4xl font-black ${
                    anulado ? "text-red-200" : "text-green-200"
                  }`}
                >
                  {anulado
                    ? "Certificado anulado"
                    : "Certificado válido"}
                </h2>

                <p
                  className={`mx-auto mt-4 max-w-2xl text-sm leading-7 ${
                    anulado ? "text-red-100" : "text-green-100"
                  }`}
                >
                  {anulado
                    ? "Este código corresponde a un certificado emitido por SERVICAN, pero actualmente figura como anulado."
                    : "Este código corresponde a un certificado emitido por SERVICAN y figura como vigente en el sistema."}
                </p>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <DatoCertificado
                  titulo="Código"
                  valor={certificado.codigo}
                />

                <DatoCertificado
                  titulo="Alumno"
                  valor={certificado.alumno}
                />

                <DatoCertificado
                  titulo="Curso"
                  valor={certificado.curso}
                />

                <DatoCertificado
                  titulo="Fecha de emisión"
                  valor={formatearFecha(certificado.emitido_at)}
                />

                <DatoCertificado
                  titulo="Emitido por"
                  valor={certificado.emisor || "SERVICAN"}
                />

                <DatoCertificado
                  titulo="Estado"
                  valor={anulado ? "Anulado" : "Emitido"}
                />
              </div>

              <div className="mt-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-sm leading-7 text-yellow-100">
                Por seguridad, esta verificación pública no muestra el
                certificado completo ni permite descargarlo. Solo confirma la
                existencia, estado y datos básicos del certificado emitido por
                SERVICAN.
              </div>

              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setResultado(null);
                    setCodigo("");
                    setError("");
                  }}
                  className="rounded-2xl border border-white/10 bg-white/10 px-6 py-3 text-sm font-black transition hover:bg-white/20"
                >
                  Verificar otro código
                </button>

                <Link
                  href="/"
                  className="rounded-2xl bg-yellow-500 px-6 py-3 text-center text-sm font-black text-black transition hover:bg-yellow-400"
                >
                  Volver a SERVICAN
                </Link>
              </div>
            </div>
          )}

          <div className="mt-8 rounded-[2rem] border border-white/10 bg-zinc-950 p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-500">
                  Privacidad
                </p>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  El certificado completo solo puede verlo el alumno desde su
                  cuenta privada.
                </p>
              </div>

              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-500">
                  Validez
                </p>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  El código permite confirmar si fue emitido y si sigue vigente.
                </p>
              </div>

              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-500">
                  Seguridad
                </p>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Un certificado anulado no debe usarse como constancia válida.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-900 px-6 py-10 text-center">
        <p className="text-xl font-black tracking-[0.25em] text-yellow-500">
          SERVICAN
        </p>

        <p className="mt-2 text-zinc-500">
          Formación y trabajo canino
        </p>
      </footer>
    </main>
  );
}