import Link from "next/link";
import GaleriaMembresiaPrivada from "@/app/components/GaleriaMembresiaPrivada";

export const dynamic = "force-dynamic";

export default function PanelGaleriaMembresiaPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
              SERVICAN
            </p>

            <h1 className="mt-3 text-4xl font-black">
              Galería privada
            </h1>

            <p className="mt-3 max-w-3xl text-zinc-400">
              Contenido exclusivo para usuarios con membresía mensual activa.
              Fotos, videos, archivos y material privado de SERVICAN.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/panel/membresia"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/20"
            >
              Mi membresía
            </Link>

            <Link
              href="/panel"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/20"
            >
              Volver al panel
            </Link>
          </div>
        </div>

        <GaleriaMembresiaPrivada />
      </section>
    </main>
  );
}