import Link from "next/link";

export default function PagoErrorPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-red-500/30 bg-red-500/10 p-8 text-center shadow-2xl">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-red-300">
          Pago no completado
        </p>

        <h1 className="mt-4 text-5xl font-black">
          No se pudo completar el pago
        </h1>

        <p className="mt-5 leading-8 text-red-100">
          El pago fue rechazado, cancelado o no pudo procesarse. Podés volver a
          intentarlo o consultar con SERVICAN.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/cursos"
            className="rounded-full bg-red-400 px-8 py-4 font-black text-black transition hover:bg-red-300"
          >
            Volver a cursos
          </Link>

          <Link
            href="/inscripcion"
            className="rounded-full border border-red-400 px-8 py-4 font-black text-red-200 transition hover:bg-red-400 hover:text-black"
          >
            Consultar
          </Link>
        </div>
      </section>
    </main>
  );
}