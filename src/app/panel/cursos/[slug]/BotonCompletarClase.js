"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BotonCompletarClase({
  claseId,
  completadaInicial = false,
  bloqueada = false,
}) {
  const router = useRouter();

  const [completada, setCompletada] = useState(completadaInicial);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function cambiarProgreso() {
    if (bloqueada) return;

    setCargando(true);
    setError("");

    const nuevoEstado = !completada;

    try {
      const respuesta = await fetch("/api/panel/progreso", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clase_id: claseId,
          completada: nuevoEstado,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo actualizar el progreso.");
        setCargando(false);
        return;
      }

      setCompletada(nuevoEstado);
      router.refresh();
    } catch (error) {
      setError("Error de conexión al actualizar el progreso.");
    } finally {
      setCargando(false);
    }
  }

  if (bloqueada) {
    return (
      <div className="flex flex-col gap-2">
        <button
          disabled
          className="rounded-2xl bg-neutral-800 px-5 py-3 text-sm font-bold text-neutral-500"
        >
          Clase bloqueada
        </button>

        <p className="text-xs text-neutral-500">
          Completá primero la clase anterior.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={cambiarProgreso}
        disabled={cargando}
        className={`rounded-2xl px-5 py-3 text-sm font-bold transition disabled:opacity-60 ${
          completada
            ? "bg-green-500 text-white hover:bg-green-400"
            : "bg-yellow-500 text-black hover:bg-yellow-400"
        }`}
      >
        {cargando
          ? "Actualizando..."
          : completada
          ? "Clase completada"
          : "Marcar como completada"}
      </button>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </p>
      )}
    </div>
  );
}