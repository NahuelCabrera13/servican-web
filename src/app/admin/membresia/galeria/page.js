import Link from "next/link";
import AdminGaleriaMembresiaClient from "./AdminGaleriaMembresiaClient";

export const dynamic = "force-dynamic";

export default function AdminGaleriaMembresiaPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 shadow-2xl shadow-black/40">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
                  Admin SERVICAN
                </p>

                <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                  Galería de membresía
                </h1>

                <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400">
                  Cargá y administrá fotos, videos, archivos o materiales
                  exclusivos para usuarios con membresía mensual activa.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin/membresia"
                  className="rounded-2xl bg-yellow-500 px-5 py-3 text-center text-sm font-black text-black transition hover:bg-yellow-400"
                >
                  Ver membresías
                </Link>

                <Link
                  href="/admin/membresia/config"
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-white/20"
                >
                  Configurar
                </Link>

                <Link
                  href="/admin"
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-white/20"
                >
                  Volver al admin
                </Link>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm font-black text-yellow-500">
                  Contenido privado
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Todo lo cargado acá se muestra únicamente dentro de la galería
                  privada del alumno.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm font-black text-yellow-500">
                  Fotos y videos
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Podés usar imágenes, videos directos, enlaces de YouTube o
                  archivos del bucket privado.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm font-black text-yellow-500">
                  Control de visibilidad
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Activá, desactivá, destacá u ordená el contenido sin borrar el
                  historial.
                </p>
              </div>
            </div>
          </div>
        </div>

        <AdminGaleriaMembresiaClient />
      </section>
    </main>
  );
}