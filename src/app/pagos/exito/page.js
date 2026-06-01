import Link from "next/link";

export default function PagoExitoPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-green-500/30 bg-green-500/10 p-8 text-center shadow-2xl">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-green-300">
          Pago aprobado
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Pago realizado correctamente
        </h1>

        <p className="mt-5 leading-8 text-green-100">
          Si Mercado Pago ya confirmó el pago, el curso se habilitará
          automáticamente en tu panel. Puede tardar unos segundos.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/panel"
            className="rounded-full bg-green-400 px-8 py-4 font-black text-black transition hover:bg-green-300"
          >
            Entrar a mi panel
          </Link>

          <Link
            href="/cursos"
            className="rounded-full border border-green-400 px-8 py-4 font-black text-green-200 transition hover:bg-green-400 hover:text-black"
          >
            Volver a cursos
          </Link>
        </div>
      </section>
    </main>
  );
}