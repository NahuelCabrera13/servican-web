"use client";

import { useState } from "react";

export default function BotonComprarMembresia({
  texto = "Contratar membresía mensual",
  className = "",
}) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function contratarMembresia() {
    setCargando(true);
    setError("");

    try {
      const respuesta = await fetch("/api/membresia/crear-suscripcion", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });

      const data = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        if (respuesta.status === 401) {
          const destino = encodeURIComponent("/panel/membresia");
          window.location.href = `/login?redirect=${destino}`;
          return;
        }

        setError(
          data?.error ||
            "No se pudo iniciar la contratación de la membresía."
        );
        return;
      }

      if (!data?.init_point) {
        setError("Mercado Pago no devolvió un enlace de pago válido.");
        return;
      }

      window.location.href = data.init_point;
    } catch (error) {
      console.error("Error contratando membresía:", error);
      setError("Error de conexión al iniciar la membresía.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={contratarMembresia}
        disabled={cargando}
        className={
          className ||
          "rounded-2xl bg-yellow-500 px-6 py-3 text-sm font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {cargando ? "Redirigiendo a Mercado Pago..." : texto}
      </button>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}