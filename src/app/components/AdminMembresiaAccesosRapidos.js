"use client";

import Link from "next/link";

export default function AdminMembresiaAccesosRapidos() {
  return (
    <section className="mb-8 overflow-hidden rounded-[2rem] border border-yellow-500/20 bg-zinc-950 shadow-2xl">
      <div className="border-b border-white/10 bg-yellow-500/10 p-6">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
          Membresía mensual
        </p>

        <h2 className="mt-2 text-3xl font-black text-white">
          Gestión rápida de membresía
        </h2>

        <p className="mt-3 max-w-4xl text-sm leading-6 text-zinc-300">
          Accesos directos para revisar miembros, configurar el producto,
          administrar la galería privada y sincronizar pagos con Mercado Pago si
          alguna suscripción no se activa automáticamente.
        </p>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/admin/membresia"
          className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-5 transition hover:-translate-y-1 hover:bg-yellow-500/20"
        >
          <p className="text-3xl">⭐</p>

          <h3 className="mt-3 text-xl font-black text-yellow-100">
            Ver membresías
          </h3>

          <p className="mt-2 text-sm leading-6 text-yellow-100/80">
            Revisá miembros activos, pausados, cancelados y sus estados.
          </p>
        </Link>

        <Link
          href="/admin/membresia/config"
          className="rounded-3xl border border-blue-500/30 bg-blue-500/10 p-5 transition hover:-translate-y-1 hover:bg-blue-500/20"
        >
          <p className="text-3xl">⚙️</p>

          <h3 className="mt-3 text-xl font-black text-blue-100">
            Configurar membresía
          </h3>

          <p className="mt-2 text-sm leading-6 text-blue-100/80">
            Precio, texto del botón, visibilidad y datos públicos.
          </p>
        </Link>

        <Link
          href="/admin/membresia/galeria"
          className="rounded-3xl border border-green-500/30 bg-green-500/10 p-5 transition hover:-translate-y-1 hover:bg-green-500/20"
        >
          <p className="text-3xl">🖼️</p>

          <h3 className="mt-3 text-xl font-black text-green-100">
            Galería privada
          </h3>

          <p className="mt-2 text-sm leading-6 text-green-100/80">
            Subí fotos, videos y contenido exclusivo para miembros.
          </p>
        </Link>

        <Link
          href="/admin/membresia/sincronizar"
          className="rounded-3xl border border-red-500/30 bg-red-500/10 p-5 transition hover:-translate-y-1 hover:bg-red-500/20"
        >
          <p className="text-3xl">🔄</p>

          <h3 className="mt-3 text-xl font-black text-red-100">
            Sincronizar pago
          </h3>

          <p className="mt-2 text-sm leading-6 text-red-100/80">
            Herramienta de respaldo si Mercado Pago no activa una membresía.
          </p>
        </Link>
      </div>
    </section>
  );
}