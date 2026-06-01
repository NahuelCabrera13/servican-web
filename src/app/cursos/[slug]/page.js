import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import HeaderAcceso from "../../components/HeaderAcceso";
import BotonComprarProducto from "../../components/BotonComprarProducto";
import { obtenerCursoPorSlug } from "@/lib/cursosPublicos";
import { obtenerProductosActivosPorCurso } from "@/lib/productosPublicos";

export const dynamic = "force-dynamic";

const whatsapp = "59898188257";

function construirLinkConsulta(curso) {
  const mensaje = `Hola SERVICAN, quiero consultar por el curso: ${curso.titulo}`;

  return `/inscripcion?curso=${encodeURIComponent(
    curso.titulo
  )}&mensaje=${encodeURIComponent(mensaje)}`;
}

function construirLinkWhatsApp(curso) {
  const mensaje = `Hola SERVICAN, quiero consultar por el curso: ${curso.titulo}`;

  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

function formatearPrecio(producto) {
  const precio = Number(producto.precio || 0);

  if (!precio) {
    return "Consultar";
  }

  return `${producto.moneda || "UYU"} ${precio.toLocaleString("es-UY")}`;
}

function nombrePlan(plan) {
  const nombres = {
    basico: "Plan Básico",
    extenso: "Plan Extenso",
    pro: "Plan Pro",
    plantel: "Plan Plantel",
  };

  return nombres[plan] || plan || "Plan";
}

function descripcionPlan(producto) {
  if (producto.descripcion) {
    return producto.descripcion;
  }

  if (producto.plan === "basico") {
    return "Contenido principal del curso, videos básicos y material base.";
  }

  if (producto.plan === "extenso") {
    return "Todo lo del plan básico, más videos y material complementario.";
  }

  if (producto.plan === "pro") {
    return "Todo lo del plan extenso, más asesoramiento personalizado semanal.";
  }

  if (producto.plan === "plantel") {
    return "Todo lo del plan Pro, para comprador más 3 participantes registrados.";
  }

  return "Producto de formación SERVICAN.";
}

function Badge({ children }) {
  if (!children) return null;

  return (
    <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-yellow-300">
      {children}
    </span>
  );
}

function InfoBox({ titulo, texto, icono }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-black p-7 transition hover:border-yellow-500/60">
      <p className="mb-4 text-4xl">{icono}</p>

      <h3 className="text-xl font-black text-yellow-500">{titulo}</h3>

      <p className="mt-3 leading-7 text-zinc-300">{texto}</p>
    </div>
  );
}

function PlanCard({ producto }) {
  const esGrupal = Number(producto.cantidad_maxima_usuarios || 1) > 1;

  return (
    <article className="flex flex-col rounded-[2rem] border border-zinc-800 bg-black p-6 shadow-xl transition hover:border-yellow-500/60">
      <div className="flex flex-wrap gap-2">
        <Badge>{nombrePlan(producto.plan)}</Badge>
        {producto.destacado && <Badge>Destacado</Badge>}
        {esGrupal && <Badge>Hasta {producto.cantidad_maxima_usuarios} usuarios</Badge>}
      </div>

      <h3 className="mt-5 text-2xl font-black text-white">
        {producto.nombre}
      </h3>

      <p className="mt-4 text-4xl font-black text-yellow-500">
        {formatearPrecio(producto)}
      </p>

      <p className="mt-4 flex-1 leading-7 text-zinc-300">
        {descripcionPlan(producto)}
      </p>

      <div className="mt-5 space-y-2 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-zinc-300">
        <p>
          <strong className="text-white">Usuarios incluidos:</strong>{" "}
          {producto.cantidad_maxima_usuarios || 1}
        </p>

        <p>
          <strong className="text-white">Participantes:</strong>{" "}
          {producto.requiere_participantes
            ? "requiere correos registrados antes de pagar"
            : "no requiere participantes"}
        </p>

        <p>
          <strong className="text-white">Acceso:</strong>{" "}
          {producto.plan === "plantel"
            ? "beneficios Pro para el grupo"
            : nombrePlan(producto.plan)}
        </p>
      </div>

      <div className="mt-6">
        <BotonComprarProducto producto={producto} />
      </div>
    </article>
  );
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { curso } = await obtenerCursoPorSlug(slug);

  if (!curso) {
    return {
      title: "Curso no encontrado | SERVICAN",
    };
  }

  return {
    title: `${curso.titulo} | SERVICAN`,
    description:
      curso.descripcion ||
      "Curso de formación canina de SERVICAN en Uruguay.",
  };
}

export default async function CursoDetallePage({ params }) {
  const { slug } = await params;
  const { curso } = await obtenerCursoPorSlug(slug);

  if (!curso) {
    notFound();
  }

  const { productos } = await obtenerProductosActivosPorCurso(curso.id);

  const descripcionCurso =
    curso.descripcion ||
    "Curso de formación SERVICAN. Consultá por información, modalidad, cupos disponibles y próximos comienzos.";

  const incluye = [
    {
      titulo: "Contenido organizado",
      texto: "Cada curso puede estructurarse con módulos, clases, materiales, videos y recursos privados.",
      icono: "🎓",
    },
    {
      titulo: "Planes configurables",
      texto: "SERVICAN puede activar distintos planes, precios y beneficios desde el panel admin.",
      icono: "📦",
    },
    {
      titulo: "Pago online",
      texto: "Los planes activos pueden comprarse mediante Mercado Pago.",
      icono: "💳",
    },
    {
      titulo: "Acceso automático",
      texto: "Cuando el pago queda aprobado, el curso se habilita automáticamente en el panel del alumno.",
      icono: "🔐",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-yellow-500/20 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Image
              src="/logo-servican.jpeg"
              alt="Logo SERVICAN"
              width={56}
              height={56}
              priority
              className="h-14 w-14 rounded-full object-contain"
            />

            <div>
              <p className="text-xl font-black tracking-[0.25em] text-yellow-500">
                SERVICAN
              </p>
              <p className="text-xs text-zinc-400">
                Formación y trabajo canino
              </p>
            </div>
          </Link>

          <nav className="hidden gap-6 text-sm font-semibold text-zinc-300 lg:flex">
            <Link href="/" className="hover:text-yellow-500">
              Inicio
            </Link>

            <Link href="/cursos" className="hover:text-yellow-500">
              Cursos
            </Link>

            <Link href="/#servicios" className="hover:text-yellow-500">
              Servicios
            </Link>

            <Link href="/verificar-certificado" className="hover:text-yellow-500">
              Verificar certificado
            </Link>

            <Link href="/#contacto" className="hover:text-yellow-500">
              Contacto
            </Link>
          </nav>

          <HeaderAcceso />
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-zinc-900 px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#3f3210_0%,#111_35%,#000_78%)]" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black to-transparent" />

        <div className="relative mx-auto grid max-w-[1450px] gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-5 flex flex-wrap gap-3">
              <Badge>{curso.categoria}</Badge>
              <Badge>{curso.modalidad}</Badge>
              {curso.destacado && <Badge>Destacado</Badge>}
            </div>

            <p className="mb-4 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Curso SERVICAN
            </p>

            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              {curso.titulo}
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
              {descripcionCurso}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                  Precio desde
                </p>
                <p className="mt-1 font-black text-yellow-500">
                  {productos.length > 0
                    ? formatearPrecio(productos[0])
                    : curso.precio || "Consultar"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                  Duración
                </p>
                <p className="mt-1 font-black text-yellow-500">
                  {curso.duracion || "A definir"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                  Modalidad
                </p>
                <p className="mt-1 font-black text-yellow-500">
                  {curso.modalidad || "A definir"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                  Planes activos
                </p>
                <p className="mt-1 font-black text-yellow-500">
                  {productos.length}
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#planes"
                className="rounded-full bg-yellow-500 px-9 py-4 text-center font-black text-black transition hover:bg-yellow-400"
              >
                Ver planes
              </a>

              <Link
                href={construirLinkConsulta(curso)}
                className="rounded-full border border-yellow-500 px-9 py-4 text-center font-black text-yellow-500 transition hover:bg-yellow-500 hover:text-black"
              >
                Consultar
              </Link>

              <a
                href={construirLinkWhatsApp(curso)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 bg-white/10 px-9 py-4 text-center font-black text-white transition hover:bg-white hover:text-black"
              >
                WhatsApp
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-yellow-500/30 bg-zinc-950 shadow-2xl">
            <div className="relative aspect-[16/11] bg-zinc-900">
              {curso.imagen_url ? (
                <img
                  src={curso.imagen_url}
                  alt={curso.titulo}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-zinc-950">
                  <div className="text-center">
                    <Image
                      src="/logo-servican.jpeg"
                      alt="Logo SERVICAN"
                      width={112}
                      height={112}
                      priority
                      className="mx-auto h-28 w-28 rounded-full object-contain opacity-90"
                    />

                    <p className="mt-5 text-sm font-bold uppercase tracking-[0.3em] text-yellow-500">
                      SERVICAN
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-400">
                  Formación profesional
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  Planes configurables desde el panel admin
                </h2>
              </div>
            </div>

            <div className="p-6">
              <div className="rounded-3xl border border-yellow-500/25 bg-yellow-500/10 p-5">
                <h3 className="text-xl font-black text-yellow-400">
                  Acceso automático
                </h3>

                <p className="mt-3 leading-7 text-yellow-100">
                  Si el pago queda aprobado por Mercado Pago, el sistema
                  habilita el curso automáticamente en el panel del alumno.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="planes"
        className="border-b border-zinc-900 bg-zinc-950 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-[1450px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Planes disponibles
            </p>

            <h2 className="text-4xl font-black md:text-5xl">
              Elegí el plan que mejor se adapte a tu objetivo
            </h2>

            <p className="mt-4 leading-8 text-zinc-300">
              Los planes que aparecen acá son los que SERVICAN activó desde el
              panel de administración.
            </p>
          </div>

          {productos.length === 0 ? (
            <div className="mx-auto mt-12 max-w-3xl rounded-[2rem] border border-yellow-500/25 bg-yellow-500/10 p-8 text-center">
              <h3 className="text-2xl font-black text-yellow-300">
                No hay planes activos todavía
              </h3>

              <p className="mt-4 leading-7 text-yellow-100">
                Este curso todavía no tiene planes visibles para compra online.
                Podés consultar con SERVICAN para recibir información de
                disponibilidad, precios y próximos comienzos.
              </p>

              <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href={construirLinkConsulta(curso)}
                  className="rounded-full bg-yellow-500 px-8 py-4 font-black text-black transition hover:bg-yellow-400"
                >
                  Enviar consulta
                </Link>

                <a
                  href={construirLinkWhatsApp(curso)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-yellow-500 px-8 py-4 font-black text-yellow-200 transition hover:bg-yellow-500 hover:text-black"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
              {productos.map((producto) => (
                <PlanCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-b border-zinc-900 bg-black px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1450px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Qué incluye
            </p>

            <h2 className="text-4xl font-black md:text-5xl">
              Formación organizada y administrable
            </h2>

            <p className="mt-4 leading-8 text-zinc-300">
              La plataforma permite manejar cursos, planes, precios, accesos,
              materiales y certificados desde el panel de administración.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {incluye.map((item) => (
              <InfoBox
                key={item.titulo}
                titulo={item.titulo}
                texto={item.texto}
                icono={item.icono}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-yellow-500 px-4 py-20 text-black sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-4xl font-black md:text-6xl">
            ¿Querés consultar antes de comprar?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8">
            Podés comprar un plan activo o comunicarte con SERVICAN para recibir
            orientación sobre modalidad, cupos, contenido y próximos pasos.
          </p>

          <div className="mx-auto mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="#planes"
              className="rounded-full bg-black px-9 py-4 text-center font-black text-white transition hover:bg-zinc-800"
            >
              Ver planes
            </a>

            <Link
              href={construirLinkConsulta(curso)}
              className="rounded-full border-2 border-black px-9 py-4 text-center font-black text-black transition hover:bg-black hover:text-white"
            >
              Consultar
            </Link>

            <a
              href={construirLinkWhatsApp(curso)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-black px-9 py-4 text-center font-black text-black transition hover:bg-black hover:text-white"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-900 px-6 py-10 text-center">
        <p className="text-xl font-black tracking-[0.25em] text-yellow-500">
          SERVICAN
        </p>

        <p className="mt-2 text-zinc-500">Formación y trabajo canino</p>

        <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm font-semibold text-zinc-400">
          <Link href="/" className="hover:text-yellow-500">
            Inicio
          </Link>

          <Link href="/cursos" className="hover:text-yellow-500">
            Cursos
          </Link>

          <Link href="/inscripcion" className="hover:text-yellow-500">
            Consulta
          </Link>

          <Link href="/verificar-certificado" className="hover:text-yellow-500">
            Verificar certificado
          </Link>
        </div>

        <p className="mt-4 text-sm text-zinc-600">
          © 2026 SERVICAN. Todos los derechos reservados.
        </p>
      </footer>
    </main>
  );
}