import Link from "next/link";
import GaleriaMembresiaPrivada from "@/app/components/GaleriaMembresiaPrivada";

export const dynamic = "force-dynamic";

export default function PanelGaleriaMembresiaPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 shadow-2xl shadow-black/40">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
                  SERVICAN
                </p>

                <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                  Galería privada
                </h1>

                <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400">
                  Contenido exclusivo para usuarios con membresía mensual
                  activa. Fotos, videos, archivos y material privado de
                  SERVICAN.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/panel/membresia"
                  className="rounded-2xl bg-yellow-500 px-5 py-3 text-center text-sm font-black text-black transition hover:bg-yellow-400"
                >
                  Mi membresía
                </Link>

                <Link
                  href="/panel"
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-white/20"
                >
                  Volver al panel
                </Link>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm font-black text-yellow-500">
                  Fotos privadas
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Imágenes exclusivas cargadas desde el panel administrador.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm font-black text-yellow-500">
                  Videos privados
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Material audiovisual disponible solo para miembros activos.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm font-black text-yellow-500">
                  Acceso protegido
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  El contenido se muestra únicamente si la membresía está
                  activa.
                </p>
              </div>
            </div>
          </div>
        </div>

        <GaleriaMembresiaPrivada />
      </section>
    </main>
  );
}