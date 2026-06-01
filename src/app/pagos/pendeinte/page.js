import Link from "next/link";

export const metadata = {
  title: "Pago pendiente | SERVICAN",
  description: "Tu pago está pendiente de confirmación en SERVICAN.",
};

export default function PagoPendientePage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <section className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-yellow-500/30 bg-zinc-950 shadow-2xl">
        <div className="border-b border-yellow-500/20 bg-yellow-500/10 p-8 text-center">
          <img
            src="/logo-servican.jpeg"
            alt="Logo SERVICAN"
            className="mx-auto h-24 w-24 rounded-full object-contain ring-4 ring-yellow-500/20"
          />

          <p className="mt-6 text-sm font-black uppercase tracking-[0.35em] text-yellow-300">
            Pago pendiente
          </p>

          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            Tu pago está pendiente
          </h1>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-yellow-100">
            Mercado Pago todavía no confirmó la operación. Cuando el pago quede
            aprobado, el curso se habilitará automáticamente en tu panel.
          </p>
        </div>

        <div className="p-8">
          <div className="rounded-3xl border border-white/10 bg-black p-6 text-left">
            <h2 className="text-2xl font-black text-yellow-300">
              ¿Por qué puede quedar pendiente?
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                <p className="text-3xl">⏳</p>
                <p className="mt-3 font-bold">Confirmación en proceso</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Algunas formas de pago demoran más en aprobarse.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                <p className="text-3xl">🏦</p>
                <p className="mt-3 font-bold">Pago externo</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Puede depender del banco, tarjeta o medio elegido.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                <p className="text-3xl">🔓</p>
                <p className="mt-3 font-bold">Acceso automático</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Apenas se apruebe, el sistema habilita tu curso.
                </p>
              </div>
            </div>

            <p className="mt-6 leading-7 text-zinc-300">
              Podés entrar a tu panel para revisar si el curso ya aparece. Si
              todavía no está habilitado, esperá la confirmación de Mercado Pago
              o consultá con SERVICAN.
            </p>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/panel"
              className="rounded-full bg-yellow-400 px-8 py-4 text-center font-black text-black transition hover:bg-yellow-300"
            >
              Entrar a mi panel
            </Link>

            <Link
              href="/cursos"
              className="rounded-full border border-yellow-400 px-8 py-4 text-center font-black text-yellow-200 transition hover:bg-yellow-400 hover:text-black"
            >
              Volver a cursos
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