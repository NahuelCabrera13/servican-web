"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BotonComprarMembresia from "@/app/components/BotonComprarMembresia";

function formatearFecha(fecha) {
  if (!fecha) {
    return "Sin fecha definida";
  }

  try {
    return new Intl.DateTimeFormat("es-UY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(fecha));
  } catch {
    return "Fecha no disponible";
  }
}

function normalizarEstado(estado) {
  return String(estado || "").trim().toLowerCase();
}

function EstadoBadge({ estado }) {
  const estadoNormalizado = normalizarEstado(estado);

  if (estadoNormalizado === "activa") {
    return (
      <span className="rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-green-200">
        Activa
      </span>
    );
  }

  if (estadoNormalizado === "cancelada") {
    return (
      <span className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-red-200">
        Cancelada
      </span>
    );
  }

  if (estadoNormalizado === "pausada") {
    return (
      <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-orange-200">
        Pausada
      </span>
    );
  }

  return (
    <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-yellow-200">
      Pendiente
    </span>
  );
}

export default function PanelMembresiaCliente() {
  const [cargando, setCargando] = useState(true);
  const [reintentando, setReintentando] = useState(false);
  const [error, setError] = useState("");
  const [membresia, setMembresia] = useState(null);

  async function cargarEstado({ silencioso = false } = {}) {
    if (silencioso) {
      setReintentando(true);
    } else {
      setCargando(true);
    }

    setError("");

    try {
      const respuesta = await fetch("/api/membresia/estado", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo consultar tu membresía.");
        setMembresia(null);
        return;
      }

      setMembresia(data?.membresia || null);
    } catch (error) {
      console.error("Error cargando membresía:", error);
      setError("Error de conexión al consultar la membresía.");
      setMembresia(null);
    } finally {
      setCargando(false);
      setReintentando(false);
    }
  }

  useEffect(() => {
    cargarEstado();
  }, []);

  if (cargando) {
    return <EstadoCargando />;
  }

  if (error) {
    return (
      <EstadoError
        error={error}
        reintentando={reintentando}
        onReintentar={() => cargarEstado({ silencioso: true })}
      />
    );
  }

  if (!membresia) {
    return <SinMembresia />;
  }

  const estadoNormalizado = normalizarEstado(membresia.estado);
  const activa = estadoNormalizado === "activa";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section
        className={`overflow-hidden rounded-[2rem] border ${
          activa
            ? "border-green-500/30 bg-green-500/10"
            : "border-yellow-500/30 bg-yellow-500/10"
        }`}
      >
        <div className="border-b border-white/10 bg-black/20 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <EstadoBadge estado={membresia.estado} />

            {membresia.mercadopago_status ? (
              <span className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-bold uppercase tracking-wide text-zinc-300">
                Mercado Pago: {membresia.mercadopago_status}
              </span>
            ) : null}
          </div>

          <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
            {activa
              ? "Tu membresía está activa"
              : "Tu membresía todavía no está activa"}
          </h2>

          <p className="mt-4 max-w-3xl leading-7 text-zinc-300">
            {activa
              ? "Ya podés acceder a la galería privada y a los beneficios exclusivos de la membresía mensual SERVICAN."
              : "El sistema está verificando el estado de Mercado Pago. Si ya realizaste el pago y la suscripción fue autorizada, podés volver a verificar el estado desde esta misma pantalla."}
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <Dato
              titulo="Inicio"
              valor={formatearFecha(membresia.fecha_inicio)}
            />

            <Dato
              titulo="Vigencia"
              valor={formatearFecha(membresia.fecha_fin)}
            />

            <Dato
              titulo="Descuento"
              valor={`${membresia.descuento_porcentaje || 10}%`}
            />

            <Dato
              titulo="Curso pequeño"
              valor={
                membresia.curso_pequeno_usado
                  ? "Ya utilizado"
                  : membresia.curso_pequeno_disponible
                    ? "Disponible"
                    : "Pendiente de habilitación"
              }
            />
          </div>

          {activa ? (
            <AccionesMembresiaActiva />
          ) : (
            <AccionesMembresiaPendiente
              reintentando={reintentando}
              onReintentar={() => cargarEstado({ silencioso: true })}
            />
          )}
        </div>
      </section>

      <Beneficios activa={activa} />
    </div>
  );
}

function EstadoCargando() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-zinc-950 p-8">
      <div className="flex items-center gap-4">
        <div className="h-4 w-4 animate-pulse rounded-full bg-yellow-500" />

        <p className="text-sm font-bold text-zinc-400">
          Verificando estado de membresía...
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="h-24 rounded-2xl bg-white/[0.04]" />
        <div className="h-24 rounded-2xl bg-white/[0.04]" />
      </div>
    </div>
  );
}

function EstadoError({ error, reintentando, onReintentar }) {
  return (
    <div className="rounded-[2rem] border border-red-500/30 bg-red-500/10 p-8">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-red-200">
        Error
      </p>

      <h2 className="mt-3 text-3xl font-black text-red-100">
        No se pudo consultar la membresía
      </h2>

      <p className="mt-3 text-sm leading-6 text-red-100/80">{error}</p>

      <button
        type="button"
        onClick={onReintentar}
        disabled={reintentando}
        className="mt-6 rounded-2xl bg-red-500 px-6 py-3 text-sm font-black text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {reintentando ? "Consultando..." : "Intentar de nuevo"}
      </button>
    </div>
  );
}

function SinMembresia() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section className="overflow-hidden rounded-[2rem] border border-yellow-500/25 bg-yellow-500/10">
        <div className="border-b border-yellow-500/20 bg-black/20 p-6 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-300">
            Membresía mensual
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-yellow-100 sm:text-4xl">
            Todavía no tenés una membresía activa
          </h2>

          <p className="mt-4 max-w-3xl leading-7 text-yellow-100/80">
            Desde acá podés contratar la membresía mensual de SERVICAN. Una vez
            que Mercado Pago confirme la suscripción, el sistema habilita el
            acceso privado automáticamente.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid gap-4 md:grid-cols-3">
            <MiniBeneficio
              titulo="Galería privada"
              texto="Fotos y videos exclusivos."
            />

            <MiniBeneficio
              titulo="10% de descuento"
              texto="En cursos principales."
            />

            <MiniBeneficio
              titulo="Curso pequeño"
              texto="1 curso incluido."
            />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <BotonComprarMembresia texto="Contratar membresía mensual" />

            <Link
              href="/cursos#membresia"
              className="rounded-2xl border border-white/10 bg-white/10 px-6 py-3 text-center text-sm font-black text-white transition hover:bg-white hover:text-black"
            >
              Ver información
            </Link>
          </div>
        </div>
      </section>

      <Beneficios activa={false} />
    </div>
  );
}

function AccionesMembresiaActiva() {
  return (
    <div className="mt-8">
      <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5">
        <p className="text-sm font-black text-green-200">
          Acceso habilitado
        </p>

        <p className="mt-2 text-sm leading-6 text-green-100/80">
          Tu cuenta tiene permisos activos para entrar al contenido privado de
          la membresía.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/panel/membresia/galeria"
          className="rounded-2xl bg-yellow-500 px-6 py-3 text-center text-sm font-black text-black transition hover:bg-yellow-400"
        >
          Entrar a galería privada
        </Link>

        <Link
          href="/cursos"
          className="rounded-2xl border border-white/10 bg-white/10 px-6 py-3 text-center text-sm font-black text-white transition hover:bg-white hover:text-black"
        >
          Ver cursos con beneficios
        </Link>
      </div>
    </div>
  );
}

function AccionesMembresiaPendiente({ reintentando, onReintentar }) {
  return (
    <div className="mt-8">
      <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">
        <p className="text-sm font-black text-yellow-200">
          Membresía pendiente de confirmación
        </p>

        <p className="mt-2 text-sm leading-6 text-yellow-100/80">
          Si ya realizaste el pago, puede tardar unos instantes en reflejarse.
          También podés volver a verificar el estado manualmente.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onReintentar}
          disabled={reintentando}
          className="rounded-2xl bg-yellow-500 px-6 py-3 text-center text-sm font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {reintentando ? "Verificando..." : "Verificar nuevamente"}
        </button>

        <Link
          href="/cursos#membresia"
          className="rounded-2xl border border-white/10 bg-white/10 px-6 py-3 text-center text-sm font-black text-white transition hover:bg-white hover:text-black"
        >
          Ver membresía
        </Link>
      </div>
    </div>
  );
}

function Beneficios({ activa }) {
  return (
    <aside className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-500">
        Beneficios
      </p>

      <h3 className="mt-3 text-2xl font-black text-white">
        Qué incluye la membresía
      </h3>

      <div className="mt-5 space-y-4">
        <Beneficio
          titulo="Galería privada"
          texto="Fotos, videos y contenido exclusivo de SERVICAN."
          disponible={activa}
        />

        <Beneficio
          titulo="10% de descuento"
          texto="Beneficio para cursos principales mientras la membresía esté activa."
          disponible={activa}
        />

        <Beneficio
          titulo="1 curso pequeño"
          texto="Disponible cuando se carguen los cursos pequeños en la plataforma."
          disponible={activa}
        />
      </div>

      {!activa ? (
        <p className="mt-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm leading-6 text-yellow-100/80">
          Estos beneficios se habilitan automáticamente cuando la membresía
          queda activa.
        </p>
      ) : null}
    </aside>
  );
}

function Beneficio({ titulo, texto, disponible }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-black text-yellow-500">{titulo}</h4>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${
            disponible
              ? "bg-green-500/10 text-green-200"
              : "bg-zinc-800 text-zinc-400"
          }`}
        >
          {disponible ? "Activo" : "Bloqueado"}
        </span>
      </div>

      <p className="mt-2 text-sm leading-6 text-zinc-400">{texto}</p>
    </div>
  );
}

function MiniBeneficio({ titulo, texto }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <p className="text-sm font-black text-yellow-300">{titulo}</p>
      <p className="mt-2 text-sm leading-6 text-yellow-100/70">{texto}</p>
    </div>
  );
}

function Dato({ titulo, valor }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
        {titulo}
      </p>

      <p className="mt-2 text-sm font-bold text-white">
        {valor || "No disponible"}
      </p>
    </div>
  );
}