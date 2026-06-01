import Link from "next/link";

export const metadata = {
  title: "Pago aprobado | SERVICAN",
  description: "Tu pago fue aprobado correctamente en SERVICAN.",
};

export default function PagoExitoPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <section className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-green-500/30 bg-zinc-950 shadow-2xl">
        <div className="border-b border-green-500/20 bg-green-500/10 p-8 text-center">
          <img
            src="/logo-servican.jpeg"
            alt="Logo SERVICAN"
            className="mx-auto h-24 w-24 rounded-full object-contain ring-4 ring-green-500/20"
          />

          <p className="mt-6 text-sm font-black uppercase tracking-[0.35em] text-green-300">
            Pago aprobado
          </p>

          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            Pago realizado correctamente
          </h1>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-green-100">
            Mercado Pago recibió tu operación. Si el pago ya fue confirmado, el
            curso se habilitará automáticamente en tu panel.
          </p>
        </div>

        <div className="p-8">
          <div className="rounded-3xl border border-white/10 bg-black p-6 text-left">
            <h2 className="text-2xl font-black text-green-300">
              ¿Qué hago ahora?
            </h2>

            <p className="mt-4 leading-7 text-zinc-300">
              Entrá a tu panel de alumno. En la mayoría de los casos el acceso
              aparece en pocos segundos. Si no aparece inmediatamente, tocá el
              botón de actualizar dentro del panel.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                <p className="text-3xl">✅</p>
                <p className="mt-3 font-bold">Pago recibido</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Mercado Pago procesa la confirmación.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                <p className="text-3xl">🔓</p>
                <p className="mt-3 font-bold">Acceso automático</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  El sistema habilita el curso comprado.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                <p className="text-3xl">🎓</p>
                <p className="mt-3 font-bold">Entrá al aula</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Vas a poder ver tus clases y materiales.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/panel"
              className="rounded-full bg-green-400 px-8 py-4 text-center font-black text-black transition hover:bg-green-300"
            >
              Entrar a mi panel
            </Link>

            <Link
              href="/cursos"
              className="rounded-full border border-green-400 px-8 py-4 text-center font-black text-green-200 transition hover:bg-green-400 hover:text-black"
            >
              Volver a cursos
            </Link>

            <Link
              href="/"
              className="rounded-full border border-white/10 bg-white/10 px-8 py-4 text-center font-black text-white transition hover:bg-white/20"
            >
              Inicio
            </Link>
          </div>

          <p className="mt-8 text-center text-sm leading-6 text-zinc-500">
            Si tu curso no aparece luego de unos minutos, comunicate con
            SERVICAN para revisar la operación.
          </p>
        </div>
      </section>
    </main>
  );
}