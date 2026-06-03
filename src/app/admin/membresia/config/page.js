import Link from "next/link";
import ConfigMembresiaForm from "./ConfigMembresiaForm";

export const dynamic = "force-dynamic";

export default function AdminConfigMembresiaPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
              Admin SERVICAN
            </p>

            <h1 className="mt-3 text-4xl font-black">
              Configurar membresía
            </h1>

            <p className="mt-3 max-w-2xl text-zinc-400">
              Ajustá el precio mensual, visibilidad y textos de la membresía
              sin tocar código.
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

        <ConfigMembresiaForm />

        <div className="mt-6 rounded-[2rem] border border-yellow-500/20 bg-yellow-500/10 p-6">
          <h2 className="text-xl font-black text-yellow-100">
            Importante sobre cambios de precio
          </h2>

          <p className="mt-3 text-sm leading-6 text-yellow-100/80">
            Cambiar el precio acá afecta las nuevas contrataciones. Las
            suscripciones ya creadas en Mercado Pago pueden mantener el monto
            anterior según cómo Mercado Pago gestione esa suscripción. Para
            cambios de precio a usuarios existentes, conviene revisarlo con
            cuidado antes de aplicarlo masivamente.
          </p>
        </div>
      </section>
    </main>
  );
}