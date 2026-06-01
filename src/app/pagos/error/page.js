import Link from "next/link";

export const metadata = {
  title: "Pago no completado | SERVICAN",
  description: "El pago no pudo completarse correctamente en SERVICAN.",
};

export default function PagoErrorPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <section className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-red-500/30 bg-zinc-950 shadow-2xl">
        <div className="border-b border-red-500/20 bg-red-500/10 p-8 text-center">
          <img
            src="/logo-servican.jpeg"
            alt="Logo SERVICAN"
            className="mx-auto h-24 w-24 rounded-full object-contain ring-4 ring-red-500/20"
          />

          <p className="mt-6 text-sm font-black uppercase tracking-[0.35em] text-red-300">
            Pago no completado
          </p>

          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            No se pudo completar el pago
          </h1>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-red-100">
            El pago fue rechazado, cancelado o no pudo procesarse correctamente.
            Podés volver a intentarlo desde la página de cursos.
          </p>
        </div>

        <div className="p-8">
          <div className="rounded-3xl border border-white/10 bg-black p-6 text-left">
            <h2 className="text-2xl font-black text-red-300">
              Posibles motivos
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                <p className="text-3xl">❌</p>
                <p className="mt-3 font-bold">Pago rechazado</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  La tarjeta o el medio de pago pudo haber sido rechazado.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                <p className="text-3xl">↩️</p>
                <p className="mt-3 font-bold">Operación cancelada</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Puede que hayas cerrado Mercado Pago antes de finalizar.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                <p className="text-3xl">🔁</p>
                <p className="mt-3 font-bold">Podés reintentar</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Volvé al curso y generá una nueva operación de pago.
                </p>
              </div>
            </div>

            <p className="mt-6 leading-7 text-zinc-300">
              Si el dinero fue descontado pero el curso no aparece en tu panel,
              no vuelvas a pagar sin consultar primero con SERVICAN.
            </p>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/cursos"
              className="rounded-full bg-red-400 px-8 py-4 text-center font-black text-black transition hover:bg-red-300"
            >
              Volver a cursos
            </Link>

            <Link
              href="/panel"
              className="rounded-full border border-red-400 px-8 py-4 text-center font-black text-red-200 transition hover:bg-red-400 hover:text-black"
            >
              Revisar mi panel
            </Link>

            <Link
              href="/inscripcion"
              className="rounded-full border border-white/10 bg-white/10 px-8 py-4 text-center font-black text-white transition hover:bg-white/20"
            >
              Consultar
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}