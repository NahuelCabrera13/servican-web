import Link from "next/link";
import BotonComprarMembresia from "@/app/components/BotonComprarMembresia";

function formatearPrecio(producto) {
  const precio = Number(producto?.precio || 0);

  if (!precio) {
    return "Precio mensual configurable";
  }

  return `${producto?.moneda || "UYU"} ${Math.round(precio)}`;
}

export default function MembresiaDestacadaCursos({ membresia }) {
  return (
    <section className="mb-16 overflow-hidden rounded-[2.5rem] border border-yellow-500/30 bg-gradient-to-br from-yellow-500/20 via-zinc-950 to-black p-6 shadow-2xl shadow-yellow-500/10 md:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
            Membresía mensual SERVICAN
          </p>

          <h2 className="mt-4 text-4xl font-black leading-tight text-white md:text-6xl">
            Acceso privado, beneficios exclusivos y contenido mensual
          </h2>

          <p className="mt-5 max-w-4xl text-base leading-8 text-zinc-300 md:text-lg">
            La membresía mensual está pensada para alumnos, guías caninos y
            personas interesadas en seguir de cerca el trabajo profesional de
            SERVICAN. Te permite acceder a contenido privado, beneficios en
            cursos y material exclusivo dentro de tu panel.
          </p>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <Beneficio
              titulo="Galería privada"
              texto="Acceso a fotos, videos y material exclusivo de entrenamientos, perros, actividades y trabajos de SERVICAN."
            />

            <Beneficio
              titulo="10% de descuento"
              texto="Beneficio para compras de cursos principales dentro de la plataforma cuando tu membresía esté activa."
            />

            <Beneficio
              titulo="1 curso pequeño"
              texto="Cuando estén cargados los cursos pequeños, vas a poder elegir uno incluido con tu membresía activa."
            />
          </div>

          <div className="mt-7 rounded-3xl border border-white/10 bg-black/50 p-5">
            <h3 className="text-xl font-black text-yellow-300">
              ¿Cómo funciona?
            </h3>

            <div className="mt-4 grid gap-4 text-sm leading-6 text-zinc-300 md:grid-cols-3">
              <Paso
                numero="01"
                titulo="Contratás"
                texto="Tocás el botón y Mercado Pago gestiona la suscripción mensual."
              />

              <Paso
                numero="02"
                titulo="Se confirma"
                texto="El sistema espera la confirmación segura de Mercado Pago por webhook."
              />

              <Paso
                numero="03"
                titulo="Se desbloquea"
                texto="Cuando el pago queda confirmado, se habilitan los beneficios en tu panel."
              />
            </div>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-yellow-500/25 bg-black/70 p-6 shadow-xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-300">
            Acceso mensual
          </p>

          <h3 className="mt-3 text-3xl font-black text-yellow-100">
            {membresia?.nombre || "Membresía mensual"}
          </h3>

          <p className="mt-3 text-sm leading-6 text-yellow-100/80">
            {membresia?.descripcion ||
              "Acceso mensual a galería privada, beneficios exclusivos y contenido especial de SERVICAN."}
          </p>

          <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-300">
              Precio
            </p>

            <p className="mt-1 text-4xl font-black text-white">
              {formatearPrecio(membresia)}
            </p>

            <p className="mt-2 text-xs leading-5 text-yellow-100/70">
              Pago recurrente mensual mediante Mercado Pago.
            </p>
          </div>

          <div className="mt-5">
            <BotonComprarMembresia
              texto={
                membresia?.texto_boton || "Contratar membresía mensual"
              }
            />
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <Link
              href="/panel/membresia"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-white hover:text-black"
            >
              Ver mi membresía
            </Link>

            <p className="rounded-2xl border border-white/10 bg-black/50 p-3 text-xs leading-5 text-zinc-400">
              La membresía no se activa desde el navegador. Se activa solamente
              cuando Mercado Pago confirma el pago de forma segura.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Beneficio({ titulo, texto }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/50 p-5 transition hover:border-yellow-500/40">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-500 text-lg font-black text-black">
        ✓
      </div>

      <h3 className="text-lg font-black text-white">{titulo}</h3>

      <p className="mt-2 text-sm leading-6 text-zinc-400">{texto}</p>
    </div>
  );
}

function Paso({ numero, titulo, texto }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
      <p className="text-xl font-black text-yellow-500">{numero}</p>
      <h4 className="mt-2 font-black text-white">{titulo}</h4>
      <p className="mt-1 text-zinc-400">{texto}</p>
    </div>
  );
}