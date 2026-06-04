"use client";

import { useEffect, useState } from "react";

function formatearPrecio(moneda, precio) {
  const numero = Number(precio || 0);

  try {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: moneda || "UYU",
      maximumFractionDigits: 0,
    }).format(numero);
  } catch {
    return `${moneda || "UYU"} ${numero}`;
  }
}

export default function BotonComprarMembresia({
  texto = "",
  className = "",
}) {
  const [cargando, setCargando] = useState(false);
  const [cargandoProducto, setCargandoProducto] = useState(true);
  const [error, setError] = useState("");
  const [producto, setProducto] = useState(null);
  const [disponible, setDisponible] = useState(false);

  async function cargarProducto() {
    setCargandoProducto(true);
    setError("");

    try {
      const respuesta = await fetch("/api/membresia/producto", {
        method: "GET",
        cache: "no-store",
      });

      const data = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo cargar la membresía.");
        setDisponible(false);
        setProducto(null);
        return;
      }

      setDisponible(Boolean(data?.disponible));
      setProducto(data?.producto || null);
    } catch (error) {
      console.error("Error cargando producto membresía:", error);
      setError("Error de conexión al cargar la membresía.");
      setDisponible(false);
      setProducto(null);
    } finally {
      setCargandoProducto(false);
    }
  }

  useEffect(() => {
    cargarProducto();
  }, []);

  async function contratarMembresia() {
    if (cargando || cargandoProducto || !disponible || !producto) {
      return;
    }

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

  if (cargandoProducto) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-bold text-zinc-400">
        Cargando membresía...
      </div>
    );
  }

  if (!disponible || !producto) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm leading-6 text-orange-100">
          La membresía mensual no está disponible en este momento.
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={cargarProducto}
          className="w-full rounded-2xl border border-white/10 bg-white/10 px-6 py-3 text-sm font-black text-white transition hover:bg-white hover:text-black"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const precio = producto.precio || 0;
  const moneda = producto.moneda || "UYU";
  const textoBoton =
    texto || producto.texto_boton || "Contratar membresía mensual";

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
          Precio mensual
        </p>

        <p className="mt-1 text-3xl font-black text-white">
          {formatearPrecio(moneda, precio)}
        </p>

        {producto.descripcion ? (
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {producto.descripcion}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={contratarMembresia}
        disabled={cargando}
        className={
          className ||
          "w-full rounded-2xl bg-yellow-500 px-6 py-3 text-sm font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {cargando ? "Redirigiendo a Mercado Pago..." : textoBoton}
      </button>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}