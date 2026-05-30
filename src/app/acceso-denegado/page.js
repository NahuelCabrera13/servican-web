import Link from "next/link";

export default function AccesoDenegadoPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
          <img
            src="/logo-servican.jpeg"
            alt="Logo SERVICAN"
            className="mx-auto mb-6 h-24 w-24 rounded-full object-cover ring-4 ring-red-500/30"
          />

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-red-400">
            Acceso restringido
          </p>

          <h1 className="text-4xl font-bold">
            No tenés permisos para entrar acá
          </h1>

          <p className="mt-4 text-neutral-300">
            Esta sección está reservada para usuarios con permisos de administrador.
            Si creés que esto es un error, pedile al administrador principal que revise tu rol.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="rounded-2xl bg-yellow-500 px-5 py-3 font-bold text-neutral-950 transition hover:bg-yellow-400"
            >
              Ir al inicio
            </Link>

            <Link
              href="/login"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/20"
            >
              Iniciar sesión con otra cuenta
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}