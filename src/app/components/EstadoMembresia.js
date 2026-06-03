"use client";

import { useEffect, useState } from "react";

export default function EstadoMembresia() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [membresia, setMembresia] = useState(null);

  async function cargarEstado() {
    setCargando(true);
    setError("");

    try {
      const respuesta = await fetch("/api/membresia/estado", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo cargar el estado de la membresía.");
        setMembresia(null);
        return;
      }

      setMembresia(data?.membresia || null);
    } catch (error) {
      console.error("Error cargando membresía:", error);
      setError("Error de conexión al cargar la membresía.");
      setMembresia(null);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarEstado();
  }, []);

  if (cargando) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6">
        <p className="text-sm font-bold text-zinc-400">
          Cargando estado de membresía...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-red-500/30 bg-red-500/10 p-6">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-red-300">
          Error
        </p>
        <p className="mt-3 text-sm text-red-100">{error}</p>
      </div>
    );
  }

  if (!membresia) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-zinc-500">
          Sin membresía
        </p>

        <h2 className="mt-3 text-2xl font-black text-white">
          Todavía no tenés una membresía creada
        </h2>

        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Podés contratarla desde el botón de Mercado Pago. La membresía se
          activará automáticamente cuando el pago sea confirmado.
        </p>
      </div>
    );
  }

  const estado = membresia.estado || "pausada";

  if (estado === "activa") {
    return <MembresiaActiva membresia={membresia} />;
  }

  if (estado === "cancelada") {
    return <MembresiaCancelada membresia={membresia} />;
  }

  if (estado === "vencida") {
    return <MembresiaVencida membresia={membresia} />;
  }

  return <MembresiaPausada membresia={membresia} />;
}

function MembresiaActiva({ membresia }) {
  return (
    <div className="rounded-[2rem] border border-green-500/30 bg-green-500/10 p-6">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-green-300">
        Membresía activa
      </p>

      <h2 className="mt-3 text-2xl font-black text-green-100">
        Tu membresía está activa
      </h2>

      <p className="mt-3 text-sm leading-6 text-green-100/80">
        Ya tenés acceso a los beneficios de la membresía SERVICAN.
      </p>

      <DatosMembresia membresia={membresia} />
    </div>
  );
}

function MembresiaPausada({ membresia }) {
  return (
    <div className="rounded-[2rem] border border-yellow-500/30 bg-yellow-500/10 p-6">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-300">
        Pendiente de confirmación
      </p>

      <h2 className="mt-3 text-2xl font-black text-yellow-100">
        Tu membresía está pausada
      </h2>

      <p className="mt-3 text-sm leading-6 text-yellow-100/80">
        Esto es normal si recién contrataste. La membresía queda pausada hasta
        que Mercado Pago confirme el pago mediante webhook.
      </p>

      <DatosMembresia membresia={membresia} />
    </div>
  );
}

function MembresiaCancelada({ membresia }) {
  return (
    <div className="rounded-[2rem] border border-red-500/30 bg-red-500/10 p-6">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-red-300">
        Membresía cancelada
      </p>

      <h2 className="mt-3 text-2xl font-black text-red-100">
        Tu membresía está cancelada
      </h2>

      <p className="mt-3 text-sm leading-6 text-red-100/80">
        Podés volver a contratarla cuando quieras.
      </p>

      <DatosMembresia membresia={membresia} />
    </div>
  );
}

function MembresiaVencida({ membresia }) {
  return (
    <div className="rounded-[2rem] border border-orange-500/30 bg-orange-500/10 p-6">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-orange-300">
        Membresía vencida
      </p>

      <h2 className="mt-3 text-2xl font-black text-orange-100">
        Tu membresía está vencida
      </h2>

      <p className="mt-3 text-sm leading-6 text-orange-100/80">
        Para recuperar el acceso, tenés que volver a contratar la membresía.
      </p>

      <DatosMembresia membresia={membresia} />
    </div>
  );
}

function DatosMembresia({ membresia }) {
  return (
    <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
      <Dato titulo="Estado" valor={membresia.estado || "Sin estado"} />
      <Dato
        titulo="Estado Mercado Pago"
        valor={membresia.mercadopago_status || "Sin confirmar"}
      />
      <Dato
        titulo="Descuento"
        valor={`${membresia.descuento_porcentaje || 0}%`}
      />
      <Dato
        titulo="Curso pequeño"
        valor={
          membresia.curso_pequeno_usado
            ? "Ya usado"
            : membresia.curso_pequeno_disponible
              ? "Disponible"
              : "No disponible"
        }
      />
    </div>
  );
}

function Dato({ titulo, valor }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
        {titulo}
      </p>
      <p className="mt-2 font-bold text-white">{valor}</p>
    </div>
  );
}