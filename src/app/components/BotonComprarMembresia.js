"use client";

import { useState } from "react";

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
  texto = "Comprar membresía",
}) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function crearSuscripcion() {
    setCargando(true);
    setError("");

    try {
      const respuesta = await fetch("/api/membresia/crear-suscripcion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
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
      <button
        type="button"
        onClick={crearSuscripcion}
        disabled={cargando}
        className="w-full rounded-full bg-yellow-500 px-7 py-4 text-center font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {cargando ? "Redirigiendo a Mercado Pago..." : texto}
      </button>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold leading-6 text-red-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}