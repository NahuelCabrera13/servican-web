import Link from "next/link";
import PanelMembresiaCliente from "@/app/components/PanelMembresiaCliente";

export const dynamic = "force-dynamic";

export default function PanelMembresiaPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-6 shadow-2xl shadow-black/40 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
                SERVICAN
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                Mi membresía
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400">
                Desde esta sección podés consultar el estado de tu membresía
                mensual, acceder a la galería privada, revisar tus beneficios y
                ver los contenidos incluidos.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/panel"
                className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-white/20"
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

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm font-black text-yellow-500">
                Galería privada
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Acceso a fotos y videos exclusivos para miembros activos.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm font-black text-yellow-500">
                Beneficios activos
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Descuentos, contenido extra y acceso a materiales especiales.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm font-black text-yellow-500">
                Cursos incluidos
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Espacio preparado para cursos pequeños incluidos en la membresía.
              </p>
            </div>
          </div>
        </div>

        <PanelMembresiaCliente />
      </section>
    </main>
  );
}