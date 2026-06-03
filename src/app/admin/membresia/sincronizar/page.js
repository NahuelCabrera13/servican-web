import Link from "next/link";
import SincronizarMembresiaClient from "./SincronizarMembresiaClient";

export const dynamic = "force-dynamic";

export default function AdminSincronizarMembresiaPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
              Admin SERVICAN
            </p>

            <h1 className="mt-3 text-4xl font-black">
              Sincronizar membresía
            </h1>

            <p className="mt-3 max-w-3xl text-zinc-400">
              Usá esta herramienta cuando Mercado Pago haya cobrado una
              membresía pero el sistema todavía la muestre como pausada.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/membresia"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/20"
            >
              Ver membresías
            </Link>

            <Link
              href="/admin"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/20"
            >
              Volver al admin
            </Link>
          </div>
        </div>

        <SincronizarMembresiaClient />

        <div className="mt-6 rounded-[2rem] border border-yellow-500/20 bg-yellow-500/10 p-6">
          <h2 className="text-xl font-black text-yellow-100">
            Cuándo usar esto
          </h2>

          <p className="mt-3 text-sm leading-6 text-yellow-100/80">
            Usalo solo si el cliente pagó correctamente en Mercado Pago, vos
            recibiste el dinero, pero en SERVICAN la membresía sigue apareciendo
            como pausada. Esta acción consulta Mercado Pago y actualiza el
            estado real de la suscripción.
          </p>
        </div>
      </section>
    </main>
  );
}