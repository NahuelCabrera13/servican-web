import Link from "next/link";
import PanelMembresiaCliente from "@/app/components/PanelMembresiaCliente";

export const dynamic = "force-dynamic";

export default function PanelMembresiaPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
              SERVICAN
            </p>

            <h1 className="mt-3 text-4xl font-black">
              Mi membresía
            </h1>

            <p className="mt-3 max-w-3xl text-zinc-400">
              Estado de tu membresía mensual, acceso a la galería privada,
              beneficios y cursos incluidos.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/panel"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/20"
            >
              Volver al panel
            </Link>

            <Link
              href="/cursos#membresia"
              className="rounded-2xl bg-yellow-500 px-5 py-3 text-center text-sm font-black text-black transition hover:bg-yellow-400"
            >
              Ver membresía
            </Link>
          </div>
        </div>

        <PanelMembresiaCliente />
      </section>
    </main>
  );
}