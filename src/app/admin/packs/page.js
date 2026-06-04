import Link from "next/link";
import { verificarAdminPage } from "@/lib/admin/verificarAdminPage";
import AdminGenerarPacksClient from "./AdminGenerarPacksClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Generar packs | SERVICAN Admin",
  description: "Generación automática de packs de cursos SERVICAN.",
};

export default async function AdminPacksPage() {
  const { user, perfil } = await verificarAdminPage("/admin/packs");

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-zinc-950 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
              Panel administrador
            </p>

            <h1 className="mt-3 text-4xl font-black">
              Generar packs de cursos
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
              Desde esta sección podés crear o actualizar automáticamente el Pack
              Básico y el Pack Pro de los dos cursos principales.
            </p>

            <p className="mt-2 text-xs text-zinc-500">
              Usuario: {user?.email || "Administrador"} · Rol:{" "}
              {perfil?.role || "admin"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/20"
            >
              Volver al admin
            </Link>

            <Link
              href="/cursos"
              className="rounded-2xl bg-yellow-500 px-5 py-3 text-center text-sm font-black text-black transition hover:bg-yellow-400"
            >
              Ver cursos
            </Link>
          </div>
        </div>

        <AdminGenerarPacksClient />
      </section>
    </main>
  );
}