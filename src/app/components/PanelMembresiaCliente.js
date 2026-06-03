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

function EstadoBadge({ estado }) {
  const estadoNormalizado = String(estado || "").toLowerCase();

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

  return (
    <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-yellow-200">
      Pausada / pendiente
    </span>
  );
}

export default function PanelMembresiaCliente() {
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
    }
  }

  useEffect(() => {
    cargarEstado();
  }, []);

  if (cargando) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-zinc-950 p-8">
        <p className="text-sm font-bold text-zinc-400">
          Verificando estado de membresía...
        </p>
      </div>
    );
  }

  if (error) {
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
          onClick={cargarEstado}
          className="mt-6 rounded-2xl bg-red-500 px-6 py-3 text-sm font-black text-white transition hover:bg-red-400"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  if (!membresia) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <section className="rounded-[2rem] border border-yellow-500/25 bg-yellow-500/10 p-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-300">
            Membresía mensual
          </p>

          <h2 className="mt-3 text-4xl font-black text-yellow-100">
            Todavía no tenés una membresía
          </h2>

          <p className="mt-4 max-w-3xl leading-7 text-yellow-100/80">
            Desde acá podés contratar la membresía mensual de SERVICAN. Una vez
            que Mercado Pago confirme la suscripción, el sistema habilita el
            acceso privado.
          </p>

          <div className="mt-6">
            <BotonComprarMembresia texto="Contratar membresía mensual" />
          </div>
        </section>

        <Beneficios />
      </div>
    );
  }

  const activa = membresia.estado === "activa";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section
        className={`rounded-[2rem] border p-8 ${
          activa
            ? "border-green-500/30 bg-green-500/10"
            : "border-yellow-500/30 bg-yellow-500/10"
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <EstadoBadge estado={membresia.estado} />

          {membresia.mercadopago_status ? (
            <span className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-bold uppercase tracking-wide text-zinc-300">
              Mercado Pago: {membresia.mercadopago_status}
            </span>
          ) : null}
        </div>

        <h2 className="mt-5 text-4xl font-black text-white">
          {activa
            ? "Tu membresía está activa"
            : "Tu membresía todavía no está activa"}
        </h2>

        <p className="mt-4 max-w-3xl leading-7 text-zinc-300">
          {activa
            ? "Ya podés acceder a los beneficios privados de la membresía mensual SERVICAN."
            : "El sistema está verificando el estado de Mercado Pago. Si ya pagaste y Mercado Pago autorizó la suscripción, al recargar esta página debería actualizarse automáticamente."}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
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
                  : "No disponible"
            }
          />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {activa ? (
            <>
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
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={cargarEstado}
                className="rounded-2xl bg-yellow-500 px-6 py-3 text-center text-sm font-black text-black transition hover:bg-yellow-400"
              >
                Verificar nuevamente
              </button>

              <Link
                href="/cursos#membresia"
                className="rounded-2xl border border-white/10 bg-white/10 px-6 py-3 text-center text-sm font-black text-white transition hover:bg-white hover:text-black"
              >
                Ver membresía
              </Link>
            </>
          )}
        </div>
      </section>

      <Beneficios />
    </div>
  );
}

function Beneficios() {
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
        />

        <Beneficio
          titulo="10% de descuento"
          texto="Beneficio para cursos principales mientras la membresía esté activa."
        />

        <Beneficio
          titulo="1 curso pequeño"
          texto="Disponible cuando se carguen los cursos pequeños en la plataforma."
        />
      </div>
    </aside>
  );
}

function Beneficio({ titulo, texto }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-4">
      <h4 className="font-black text-yellow-500">{titulo}</h4>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{texto}</p>
    </div>
  );
}

function Dato({ titulo, valor }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
        {titulo}
      </p>

      <p className="mt-2 text-sm font-bold text-white">{valor}</p>
    </div>
  );
}