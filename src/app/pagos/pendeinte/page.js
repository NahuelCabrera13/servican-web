import Link from "next/link";

export default function PagoPendientePage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-yellow-500/30 bg-yellow-500/10 p-8 text-center shadow-2xl">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-300">
          Pago pendiente
        </p>

        <h1 className="mt-4 text-5xl font-black">Tu pago está pendiente</h1>

        <p className="mt-5 leading-8 text-yellow-100">
          Mercado Pago todavía no confirmó el pago. Cuando quede aprobado, el
          curso se habilitará automáticamente.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/panel"
            className="rounded-full bg-yellow-400 px-8 py-4 font-black text-black transition hover:bg-yellow-300"
          >
            Entrar a mi panel
          </Link>

          <Link
            href="/cursos"
            className="rounded-full border border-yellow-400 px-8 py-4 font-black text-yellow-200 transition hover:bg-yellow-400 hover:text-black"
          >
            Volver a cursos
          </Link>
        </div>
      </section>
    </main>
  );
}