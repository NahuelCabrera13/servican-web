"use client";

import { useState } from "react";

function normalizarEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function emailValido(email) {
  const valor = normalizarEmail(email);

  if (!valor) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

async function leerRespuestaSegura(respuesta) {
  const texto = await respuesta.text();

  try {
    return JSON.parse(texto);
  } catch {
    return {
      ok: false,
      error:
        "La API respondió con un formato inesperado. Revisá los logs de Vercel.",
      detalle: texto.slice(0, 500),
    };
  }
}

export default function BotonComprarMembresia({
  texto = "Contratar membresía mensual",
}) {
  const [mercadopagoEmail, setMercadopagoEmail] = useState("");
  const [mostrarEmail, setMostrarEmail] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function crearSuscripcion() {
    setError("");

    const email = normalizarEmail(mercadopagoEmail);

    if (email && !emailValido(email)) {
      setError("Ingresá un correo de Mercado Pago válido.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch("/api/membresia/crear-suscripcion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          mercadopagoEmail: email || null,
        }),
      });

      const data = await leerRespuestaSegura(respuesta);

      if (!respuesta.ok) {
        if (respuesta.status === 401) {
          const destino = encodeURIComponent(window.location.pathname);
          window.location.href = `/login?redirect=${destino}`;
          return;
        }

        const requestId = data?.mp_request_id
          ? ` ID Mercado Pago: ${data.mp_request_id}`
          : "";

        setError(
          `${data?.error || "No se pudo crear la suscripción."}${requestId}`
        );

        console.error("Error creando membresía:", data);
        return;
      }

      const urlPago = data?.init_point || data?.sandbox_init_point;

      if (!urlPago) {
        setError("Mercado Pago no devolvió un link de pago.");
        console.error("Respuesta sin link de pago:", data);
        return;
      }

      window.location.href = urlPago;
    } catch (error) {
      console.error("Error iniciando membresía:", error);
      setError("Error de conexión al iniciar la membresía.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-5">
      <div className="mb-5">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-300">
          Membresía mensual
        </p>

        <p className="mt-2 text-sm leading-6 text-yellow-100/90">
          Para evitar rechazos de Mercado Pago, podés ingresar el correo que el
          comprador usa en Mercado Pago. Si lo dejás vacío, se usará el correo
          de la cuenta SERVICAN.
        </p>
      </div>

      {mostrarEmail ? (
        <div className="mb-5">
          <label className="block">
            <span className="mb-2 block text-sm font-black text-yellow-100">
              Correo de Mercado Pago del comprador
            </span>

            <input
              type="email"
              value={mercadopagoEmail}
              onChange={(event) => setMercadopagoEmail(event.target.value)}
              placeholder="correo@ejemplo.com"
              disabled={cargando}
              className="w-full rounded-2xl border border-yellow-500/30 bg-black px-4 py-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <p className="mt-2 text-xs leading-5 text-yellow-100/70">
            Este correo se enviará a Mercado Pago como comprador de la
            suscripción.
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setMostrarEmail(true)}
          disabled={cargando}
          className="mb-5 w-full rounded-2xl border border-yellow-500/40 bg-black/40 px-5 py-3 text-sm font-black text-yellow-100 transition hover:bg-yellow-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          Usar otro correo de Mercado Pago
        </button>
      )}

      <button
        type="button"
        onClick={crearSuscripcion}
        disabled={cargando}
        className="w-full rounded-full bg-yellow-500 px-7 py-4 text-center font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {cargando ? "Preparando suscripción..." : texto}
      </button>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold leading-6 text-red-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}