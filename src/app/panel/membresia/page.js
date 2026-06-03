import Link from "next/link";
import BotonComprarMembresia from "@/app/components/BotonComprarMembresia";
import EstadoMembresia from "@/app/components/EstadoMembresia";

export const dynamic = "force-dynamic";

export default function PanelMembresiaPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
              SERVICAN
            </p>

            <h1 className="mt-3 text-4xl font-black">Membresía mensual</h1>

            <p className="mt-3 max-w-2xl text-zinc-400">
              Acceso mensual a contenido privado, galería exclusiva, 10% de
              descuento en cursos y 1 curso pequeño a elección cuando esté
              disponible.
            </p>
          </div>

          <Link
            href="/panel"
            className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/20"
          >
            Volver al panel
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <article className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-500">
              Beneficios
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Tu acceso privado SERVICAN
            </h2>

            <p className="mt-4 text-sm leading-6 text-zinc-400">
              La membresía mensual está pensada para alumnos y seguidores de
              SERVICAN que quieran acceder a contenido exclusivo, material
              privado y beneficios especiales dentro de la plataforma.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Beneficio
                titulo="Galería privada"
                texto="Fotos, videos y contenido exclusivo para miembros."
              />

              <Beneficio
                titulo="10% de descuento"
                texto="Beneficio aplicable a cursos principales cuando lo activemos."
              />

              <Beneficio
                titulo="Curso pequeño incluido"
                texto="Podrás elegir 1 curso pequeño cuando esa sección esté disponible."
              />

              <Beneficio
                titulo="Acceso mensual"
                texto="La membresía se mantiene activa mientras Mercado Pago confirme los cobros."
              />
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-black p-5">
              <h3 className="text-lg font-black text-white">
                Seguridad del acceso
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                La membresía no se activa manualmente desde el navegador. Queda
                pendiente hasta que Mercado Pago confirme el pago mediante el
                webhook seguro de SERVICAN.
              </p>
            </div>
          </article>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-yellow-500/20 bg-yellow-500/10 p-6">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-300">
                Contratar
              </p>

              <h2 className="mt-3 text-3xl font-black text-yellow-100">
                Membresía mensual
              </h2>

              <p className="mt-3 text-sm leading-6 text-yellow-100">
                Al tocar el botón vas a ser redirigido a Mercado Pago. La
                membresía se activa solamente cuando Mercado Pago confirma el
                pago.
              </p>

              <div className="mt-6">
                <BotonComprarMembresia />
              </div>
            </div>

            <EstadoMembresia />
          </aside>
        </div>
      </section>
    </main>
  );
}

function Beneficio({ titulo, texto }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black p-5">
      <h3 className="text-lg font-black text-white">{titulo}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{texto}</p>
    </div>
  );
}