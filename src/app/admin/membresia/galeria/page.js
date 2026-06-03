import Link from "next/link";
import AdminGaleriaMembresiaClient from "./AdminGaleriaMembresiaClient";

export const dynamic = "force-dynamic";

export default function AdminGaleriaMembresiaPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
              Admin SERVICAN
            </p>

            <h1 className="mt-3 text-4xl font-black">
              Galería de membresía
            </h1>

            <p className="mt-3 max-w-3xl text-zinc-400">
              Cargá fotos, videos, archivos o textos exclusivos para usuarios
              con membresía mensual activa.
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
              href="/admin/membresia/config"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/20"
            >
              Configurar membresía
            </Link>

            <Link
              href="/admin"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/20"
            >
              Volver al admin
            </Link>
          </div>
        </div>

        <AdminGaleriaMembresiaClient />
      </section>
    </main>
  );
}