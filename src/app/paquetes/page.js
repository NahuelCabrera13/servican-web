import Link from "next/link";
import HeaderAcceso from "../components/HeaderAcceso";
import BotonComprarProducto from "../components/BotonComprarProducto";
import { obtenerPaquetesActivos } from "@/lib/paquetesPublicos";

export const dynamic = "force-dynamic";

function formatearPrecio(precio, moneda) {
  const numero = Number(precio || 0);

  if (!numero) {
    return "Consultar";
  }

  try {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: moneda || "UYU",
      maximumFractionDigits: 0,
    }).format(numero);
  } catch {
    return `${moneda || "$"} ${numero}`;
  }
}

function obtenerBeneficios(producto) {
  if (Array.isArray(producto?.beneficios) && producto.beneficios.length > 0) {
    return producto.beneficios;
  }

  return [
    "Incluye los dos cursos principales de SERVICAN",
    "Acceso para comprador y hasta 3 participantes adicionales",
    "Beneficios Pro en ambos cursos",
    "Todos los participantes deben tener cuenta registrada",
  ];
}

function cursosDelPaquete(producto) {
  return [...(producto?.producto_cursos || [])]
    .sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0))
    .map((relacion) => relacion.cursos)
    .filter(Boolean);
}

function PaqueteCard({ paquete }) {
  const precio = formatearPrecio(paquete.precio, paquete.moneda);
  const beneficios = obtenerBeneficios(paquete);
  const cursos = cursosDelPaquete(paquete);
  const cantidadUsuarios = Number(paquete.cantidad_maxima_usuarios || 1);

  return (
    <article className="overflow-hidden rounded-[2.5rem] border border-yellow-500/40 bg-zinc-950 shadow-2xl">
      <div className="grid gap-0 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="border-b border-yellow-500/20 bg-gradient-to-br from-yellow-500/20 via-black to-black p-8 xl:border-b-0 xl:border-r">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
            Paquete especial
          </p>

          <h2 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
            {paquete.nombre}
          </h2>

          <p className="mt-6 leading-8 text-zinc-300">
            {paquete.descripcion ||
              "Paquete profesional que reúne los cursos principales de SERVICAN en una sola compra."}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-black p-5">
              <p className="text-sm font-bold uppercase tracking-wide text-zinc-500">
                Precio
              </p>
              <p className="mt-3 text-4xl font-black text-yellow-400">
                {precio}
              </p>
              <p className="mt-2 text-sm text-zinc-500">Pago único</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black p-5">
              <p className="text-sm font-bold uppercase tracking-wide text-zinc-500">
                Usuarios incluidos
              </p>
              <p className="mt-3 text-4xl font-black">
                {cantidadUsuarios}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Comprador + participantes
              </p>
            </div>
          </div>

          <div className="mt-8">
            <BotonComprarProducto producto={paquete} />
          </div>
        </div>

        <div className="p-8">
          <div className="rounded-[2rem] border border-green-500/30 bg-green-500/10 p-6">
            <h3 className="text-2xl font-black text-green-200">
              Qué incluye el paquete
            </h3>

            <ul className="mt-5 space-y-3">
              {beneficios.map((beneficio) => (
                <li
                  key={beneficio}
                  className="flex gap-3 text-sm leading-6 text-green-50"
                >
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-400 text-xs font-black text-black">
                    ✓
                  </span>
                  <span>{beneficio}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <h3 className="text-2xl font-black">Cursos incluidos</h3>

            {cursos.length === 0 ? (
              <div className="mt-4 rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-red-100">
                Este paquete todavía no tiene cursos asociados. Revisá la tabla
                producto_cursos o generalo nuevamente desde el SQL.
              </div>
            ) : (
              <div className="mt-5 grid gap-4">
                {cursos.map((curso, index) => (
                  <div
                    key={curso.id}
                    className="rounded-3xl border border-white/10 bg-black p-5"
                  >
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-500">
                      Curso {index + 1}
                    </p>

                    <h4 className="mt-3 text-2xl font-black">
                      {curso.titulo}
                    </h4>

                    {curso.descripcion && (
                      <p className="mt-3 leading-7 text-zinc-400">
                        {curso.descripcion}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3">
                      {curso.categoria && (
                        <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-zinc-300">
                          {curso.categoria}
                        </span>
                      )}

                      {curso.modalidad && (
                        <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-zinc-300">
                          {curso.modalidad}
                        </span>
                      )}

                      <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-black text-yellow-200">
                        Acceso Pro
                      </span>
                    </div>

                    <Link
                      href={`/cursos/${curso.slug}`}
                      className="mt-5 inline-block rounded-full border border-yellow-500/40 bg-yellow-500/10 px-5 py-3 text-sm font-black text-yellow-200 transition hover:bg-yellow-500 hover:text-black"
                    >
                      Ver curso individual
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 rounded-[2rem] border border-yellow-500/30 bg-yellow-500/10 p-6">
            <h3 className="text-xl font-black text-yellow-200">
              Importante para compras grupales
            </h3>

            <p className="mt-3 leading-7 text-yellow-100">
              Antes de pagar, el comprador deberá ingresar los correos de los
              otros participantes. Todos deben tener una cuenta registrada en
              SERVICAN. Si un correo no está registrado, el sistema no dejará
              continuar con la compra.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default async function PaquetesPage() {
  const paquetes = await obtenerPaquetesActivos();

  return (
    <main className="min-h-screen bg-black text-white">
      <HeaderAcceso />

      <section className="relative overflow-hidden border-b border-yellow-500/20 bg-gradient-to-br from-black via-zinc-950 to-black px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.10),transparent_30%)]" />

        <div className="relative mx-auto max-w-[1500px]">
          <Link
            href="/cursos"
            className="inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-5 py-3 text-sm font-black text-yellow-300 transition hover:bg-yellow-500 hover:text-black"
          >
            ← Volver a cursos
          </Link>

          <p className="mt-10 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
            SERVICAN
          </p>

          <h1 className="mt-5 max-w-5xl text-5xl font-black leading-tight md:text-7xl">
            Paquetes especiales de formación
          </h1>

          <p className="mt-6 max-w-4xl text-lg leading-8 text-zinc-300">
            Accedé a más de un curso en una sola compra. Estos paquetes están
            pensados para alumnos, equipos, instituciones o planteles que buscan
            una formación más completa con beneficios superiores.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          {paquetes.length === 0 ? (
            <div className="rounded-[2rem] border border-yellow-500/30 bg-yellow-500/10 p-8">
              <h2 className="text-3xl font-black">
                No hay paquetes activos todavía
              </h2>

              <p className="mt-4 max-w-3xl leading-7 text-yellow-100">
                El paquete especial ya puede existir en admin, pero falta ponerle
                precio, activarlo y dejarlo visible en web.
              </p>

              <Link
                href="/inscripcion"
                className="mt-6 inline-block rounded-full bg-yellow-500 px-8 py-4 font-black text-black transition hover:bg-yellow-400"
              >
                Consultar disponibilidad
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              {paquetes.map((paquete) => (
                <PaqueteCard key={paquete.id} paquete={paquete} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}