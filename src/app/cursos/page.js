import Image from "next/image";
import Link from "next/link";
import HeaderAcceso from "../components/HeaderAcceso";
import { obtenerCursosActivos } from "@/lib/cursosPublicos";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const whatsapp = "59898188257";

const PACKS_FALLBACK = [
  {
    id: "fallback-pack-basico",
    nombre: "Pack Básico 2 cursos",
    slug: "pack-basico-2-cursos",
    descripcion:
      "Incluye Formación inicial Básico + K9 Básico, PDFs, videos principales y certificados simples.",
    precio: 449,
    moneda: "USD",
    plan: "basico",
    destacado: false,
  },
  {
    id: "fallback-pack-pro",
    nombre: "Pack Pro 2 cursos",
    slug: "pack-pro-2-cursos",
    descripcion:
      "Incluye Formación inicial Pro + K9 Pro, videos completos, ejercicios, evaluaciones, certificados profesionales y soporte prioritario.",
    precio: 1149,
    moneda: "USD",
    plan: "pro",
    destacado: true,
  },
];

function construirLinkWhatsApp(curso) {
  const mensaje = curso
    ? `Hola SERVICAN, quiero consultar por el curso: ${curso.titulo}`
    : "Hola SERVICAN, quiero consultar por los cursos y packs disponibles.";

  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

async function obtenerProductosPublicos() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("productos")
      .select(
        `
        id,
        nombre,
        slug,
        descripcion,
        tipo_producto,
        plan,
        curso_id,
        precio,
        moneda,
        cantidad_maxima_usuarios,
        requiere_participantes,
        requiere_correos_registrados,
        es_recurrente,
        activo,
        visible_en_web,
        destacado,
        orden,
        texto_boton
      `
      )
      .eq("activo", true)
      .eq("visible_en_web", true)
      .order("orden", { ascending: true })
      .order("precio", { ascending: true });

    if (error) {
      return {
        productos: [],
        error: error.message,
      };
    }

    return {
      productos: data || [],
      error: "",
    };
  } catch (error) {
    return {
      productos: [],
      error: error?.message || "No se pudieron cargar los productos.",
    };
  }
}

function formatearPrecio(producto) {
  const precio = Number(producto?.precio || 0);

  if (!precio) {
    return "Consultar";
  }

  try {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: producto?.moneda || "USD",
      maximumFractionDigits: precio < 100 ? 2 : 0,
    }).format(precio);
  } catch {
    return `${producto?.moneda || "USD"} ${precio}`;
  }
}

function Badge({ children, color = "yellow" }) {
  const colores = {
    yellow: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    green: "border-green-500/30 bg-green-500/10 text-green-200",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-200",
    red: "border-red-500/30 bg-red-500/10 text-red-200",
    neutral: "border-white/10 bg-white/10 text-zinc-200",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${colores[color]}`}
    >
      {children}
    </span>
  );
}

function esCursoK9(curso) {
  const texto = `${curso?.titulo || ""} ${curso?.slug || ""}`.toLowerCase();

  return (
    texto.includes("k9") ||
    texto.includes("detector") ||
    texto.includes("detectores") ||
    texto.includes("deteccion") ||
    texto.includes("detección")
  );
}

function descripcionCurso(curso) {
  if (esCursoK9(curso)) {
    return (
      curso.descripcion ||
      "Formación especializada en detección, búsqueda, asociación de olor, marcación, lectura del perro y trabajo operativo."
    );
  }

  return (
    curso.descripcion ||
    "Formación inicial para construir una base profesional como guía canino, con conducta, aprendizaje, obediencia inicial y trabajo guía-perro."
  );
}

function obtenerResumenPlanesCurso(curso) {
  if (esCursoK9(curso)) {
    return [
      "Plan Básico K9: entrada seria al trabajo de detección.",
      "Plan Pro K9: contenido completo, evaluación, corrección y soporte.",
      "Plan Plantel K9: hasta 4 usuarios, certificados individuales y soporte grupal.",
    ];
  }

  return [
    "Plan Básico: base profesional con PDF, videos y certificado simple.",
    "Plan Pro: evaluación, revisión de ejercicios, soporte y certificado profesional.",
    "Plan Plantel: hasta 4 usuarios, certificados individuales y soporte grupal.",
  ];
}

function obtenerPacksMenu(productos) {
  const packsVisibles = productos
    .filter((producto) => producto.tipo_producto === "paquete")
    .filter((producto) => producto.plan === "basico" || producto.plan === "pro")
    .sort((a, b) => {
      const orden = {
        basico: 1,
        pro: 2,
      };

      return (orden[a.plan] || 99) - (orden[b.plan] || 99);
    });

  const packBasico =
    packsVisibles.find((producto) => producto.plan === "basico") ||
    PACKS_FALLBACK[0];

  const packPro =
    packsVisibles.find((producto) => producto.plan === "pro") ||
    PACKS_FALLBACK[1];

  return [packBasico, packPro];
}

function obtenerMembresia(productos) {
  return (
    productos.find(
      (producto) =>
        producto.tipo_producto === "membresia" ||
        producto.es_recurrente ||
        producto.plan === "mensual"
    ) || null
  );
}

function TarjetaCurso({ curso }) {
  const k9 = esCursoK9(curso);
  const resumenPlanes = obtenerResumenPlanesCurso(curso);

  return (
    <article className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 shadow-2xl">
      <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="relative min-h-[360px] bg-zinc-900">
          {curso.imagen_url ? (
            <img
              src={curso.imagen_url}
              alt={curso.titulo}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[360px] w-full items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-zinc-950">
              <div className="text-center">
                <Image
                  src="/logo-servican.jpeg"
                  alt="Logo SERVICAN"
                  width={110}
                  height={110}
                  className="mx-auto h-28 w-28 rounded-full object-contain opacity-80"
                />

                <p className="mt-4 text-sm font-bold uppercase tracking-[0.3em] text-yellow-500">
                  SERVICAN
                </p>
              </div>
            </div>
          )}

          {curso.destacado && (
            <div className="absolute left-4 top-4 rounded-full bg-yellow-500 px-4 py-2 text-xs font-black uppercase tracking-wide text-black">
              Destacado
            </div>
          )}

          {k9 && (
            <div className="absolute right-4 top-4 rounded-full border border-red-500/30 bg-red-500/20 px-4 py-2 text-xs font-black uppercase tracking-wide text-red-100">
              K9 especializado
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/90 to-transparent" />
        </div>

        <div className="min-w-0 p-7 md:p-9">
          <div className="mb-4 flex flex-wrap gap-2">
            {curso.categoria && <Badge>{curso.categoria}</Badge>}
            {curso.modalidad && <Badge>{curso.modalidad}</Badge>}
            <Badge color="green">Acceso privado</Badge>
            {k9 && <Badge color="red">Detección</Badge>}
          </div>

          <h3 className="min-w-0 break-words text-4xl font-black leading-tight text-white">
            {curso.titulo}
          </h3>

          <p className="mt-4 max-w-4xl leading-8 text-zinc-300">
            {descripcionCurso(curso)}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                Planes disponibles
              </p>
              <p className="mt-1 font-black text-yellow-500">
                Básico, Pro y Plantel
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                Duración
              </p>
              <p className="mt-1 font-black text-yellow-500">
                {curso.duracion || "Ver detalle"}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-black p-5">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
              Qué vas a ver en la página del curso
            </p>

            <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
              {resumenPlanes.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-black text-black">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/cursos/${curso.slug}`}
              className="rounded-full bg-yellow-500 px-6 py-4 text-center font-black text-black transition hover:bg-yellow-400"
            >
              Ver planes y precios
            </Link>

            <a
              href={construirLinkWhatsApp(curso)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/15 bg-white/5 px-6 py-4 text-center font-black text-white transition hover:bg-white hover:text-black"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function TarjetaPack({ pack }) {
  const esPro = pack.plan === "pro" || pack.destacado;

  return (
    <article
      className={`flex h-full min-w-0 flex-col rounded-[2rem] border p-7 shadow-2xl ${
        esPro
          ? "border-yellow-500/50 bg-yellow-500/10"
          : "border-white/10 bg-zinc-950"
      }`}
    >
      <div className="flex flex-wrap gap-2">
        <Badge color={esPro ? "yellow" : "blue"}>Pack</Badge>
        <Badge color="neutral">{pack.plan === "pro" ? "Pro" : "Básico"}</Badge>
        {esPro && <Badge color="yellow">Recomendado</Badge>}
      </div>

      <h3 className="mt-5 min-w-0 break-words text-3xl font-black leading-tight text-white">
        {pack.nombre}
      </h3>

      <p className="mt-4 flex-1 leading-8 text-zinc-300">
        {pack.descripcion}
      </p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black p-5">
        <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
          Precio
        </p>

        <p className="mt-2 break-words text-[clamp(2rem,6vw,3rem)] font-black leading-tight text-yellow-500">
          {formatearPrecio(pack)}
        </p>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          La compra y el detalle completo se realizan en la página del pack.
        </p>
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-black p-5">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
          Incluye
        </p>

        <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
          {pack.plan === "pro" ? (
            <>
              <li>✓ Formación inicial Pro.</li>
              <li>✓ Formación K9 Pro.</li>
              <li>✓ Evaluaciones, certificados profesionales y soporte.</li>
            </>
          ) : (
            <>
              <li>✓ Formación inicial Básico.</li>
              <li>✓ Formación K9 Básico.</li>
              <li>✓ PDFs, videos principales y certificados simples.</li>
            </>
          )}
        </ul>
      </div>

      <div className="mt-7">
        <Link
          href={`/packs/${pack.slug}`}
          className="block rounded-full bg-yellow-500 px-6 py-4 text-center font-black text-black transition hover:bg-yellow-400"
        >
          Ver detalle del pack
        </Link>
      </div>
    </article>
  );
}

function MembresiaResumen({ membresia }) {
  return (
    <section
      id="membresia"
      className="border-b border-yellow-500/20 bg-zinc-950 px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[1450px]">
        <div className="overflow-hidden rounded-[2rem] border border-yellow-500/40 bg-gradient-to-br from-yellow-500/15 via-zinc-950 to-black p-7 shadow-2xl md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <Badge color="yellow">Membresía mensual</Badge>

              <h2 className="mt-5 text-4xl font-black md:text-6xl">
                Acceso mensual a contenido privado SERVICAN
              </h2>

              <p className="mt-5 max-w-3xl leading-8 text-zinc-300">
                La membresía no reemplaza a los cursos principales. Funciona
                como acceso mensual a comunidad, galería privada, contenido
                corto, beneficios y descuentos.
              </p>

              <ul className="mt-6 grid gap-3 text-sm leading-6 text-zinc-200 md:grid-cols-2">
                <li>✓ Galería privada de fotos y videos.</li>
                <li>✓ Actualización semanal de contenido.</li>
                <li>✓ 10% de descuento en cursos principales.</li>
                <li>✓ 1 curso pequeño a elección cuando estén disponibles.</li>
                <li>✓ Contenido educativo corto.</li>
                <li>✓ Beneficios de comunidad.</li>
              </ul>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black p-5">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-zinc-500">
                Precio mensual
              </p>

              <p className="mt-2 break-words text-[clamp(2rem,6vw,3.4rem)] font-black leading-tight text-yellow-500">
                {membresia ? formatearPrecio(membresia) : "US$24,90"}
              </p>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                La contratación se realiza desde la sección de membresía del
                panel.
              </p>

              <Link
                href="/panel/membresia"
                className="mt-5 block rounded-full bg-yellow-500 px-6 py-4 text-center font-black text-black transition hover:bg-yellow-400"
              >
                Ver membresía
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function CursosPage() {
  const { cursos, error } = await obtenerCursosActivos();
  const { productos, error: errorProductos } = await obtenerProductosPublicos();

  const productosSinExtenso = productos.filter(
    (producto) => producto.plan !== "extenso"
  );

  const membresia = obtenerMembresia(productosSinExtenso);
  const packsMenu = obtenerPacksMenu(productosSinExtenso);

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

            <Link href="#membresia" className="hover:text-yellow-500">
              Membresía
            </Link>

            <Link href="#cursos-principales" className="hover:text-yellow-500">
              Cursos
            </Link>

            <Link href="#packs" className="hover:text-yellow-500">
              Packs
            </Link>

            <Link href="/inscripcion" className="hover:text-yellow-500">
              Consulta
            </Link>
          </nav>

          <HeaderAcceso />
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-zinc-900 px-4 py-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#3f3210_0%,#111_34%,#000_78%)]" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black to-transparent" />

        <div className="relative mx-auto grid max-w-[1450px] gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Academia SERVICAN
            </p>

            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              Elegí tu curso o pack
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
              Esta sección funciona como menú principal. Acá ves los dos cursos
              principales, los packs Básico y Pro, y después entrás a cada
              página para ver precios, beneficios y comprar sin que quede todo
              apretado.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Badge>2 cursos principales</Badge>
              <Badge>Pack Básico</Badge>
              <Badge>Pack Pro</Badge>
              <Badge>Membresía mensual</Badge>
              <Badge>K9 especializado</Badge>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#cursos-principales"
                className="rounded-full bg-yellow-500 px-8 py-4 text-center font-black text-black transition hover:bg-yellow-400"
              >
                Ver cursos
              </a>

              <a
                href="#packs"
                className="rounded-full border border-yellow-500 bg-black/40 px-8 py-4 text-center font-black text-yellow-500 transition hover:bg-yellow-500 hover:text-black"
              >
                Ver packs
              </a>

              <a
                href={construirLinkWhatsApp()}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 bg-white/10 px-8 py-4 text-center font-black text-white transition hover:bg-white hover:text-black"
              >
                WhatsApp
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-yellow-500/25 bg-black/60 p-6 shadow-2xl backdrop-blur-md md:p-8">
            <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-zinc-800 bg-zinc-950">
              <Image
                src="/fotos/galeria-entrenamiento-control-malinois.webp"
                alt="Entrenamiento canino SERVICAN"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-400">
                  Menú de formación
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  Entrá al detalle antes de comprar
                </h2>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black text-yellow-500">
                  {cursos?.length || 0}
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  Cursos activos
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black text-yellow-500">2</p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  Packs destacados
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black text-yellow-500">
                  {membresia ? "Sí" : "Info"}
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  Membresía
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {(error || errorProductos) && (
        <section className="px-4 pt-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1450px] rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
            <p className="font-bold">Hay datos que no se pudieron cargar.</p>

            {error && <p className="mt-2 text-sm">Cursos: {error}</p>}

            {errorProductos && (
              <p className="mt-2 text-sm">Productos: {errorProductos}</p>
            )}
          </div>
        </section>
      )}

      <MembresiaResumen membresia={membresia} />

      <section
        id="cursos-principales"
        className="px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-[1450px]">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-500">
                Cursos principales
              </p>

              <h2 className="mt-2 text-4xl font-black md:text-5xl">
                Entrá al curso para ver planes y comprar
              </h2>

              <p className="mt-4 max-w-3xl leading-8 text-zinc-400">
                En esta página solo se muestra el menú. El detalle completo,
                precios y botones de compra quedan dentro de cada curso para que
                se vea ordenado y profesional.
              </p>
            </div>
          </div>

          {!error && cursos.length === 0 && (
            <div className="rounded-[2rem] border border-white/10 bg-zinc-950 p-10 text-center shadow-2xl">
              <h2 className="text-4xl font-black">
                Todavía no hay cursos activos
              </h2>

              <p className="mx-auto mt-4 max-w-2xl leading-8 text-zinc-400">
                Cuando el administrador cree un curso y lo marque como activo,
                aparecerá automáticamente en esta sección.
              </p>
            </div>
          )}

          {cursos.length > 0 && (
            <div className="space-y-10">
              {cursos.map((curso) => (
                <TarjetaCurso key={curso.id} curso={curso} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section
        id="packs"
        className="border-y border-zinc-900 bg-zinc-950 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-[1450px]">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
                Packs de los 2 cursos
              </p>

              <h2 className="mt-3 text-4xl font-black md:text-5xl">
                Básico o Pro, según tu objetivo
              </h2>

              <p className="mt-4 max-w-3xl leading-8 text-zinc-400">
                Los packs combinan los dos cursos principales. Para evitar que
                la página quede cargada, cada pack tiene su propia página con
                detalle completo y compra.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {packsMenu.map((pack) => (
              <TarjetaPack key={pack.id} pack={pack} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1450px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Cómo funciona
            </p>

            <h2 className="text-4xl font-black md:text-5xl">
              Primero elegís, después comprás en la página correspondiente
            </h2>

            <p className="mt-5 leading-8 text-zinc-300">
              Esta organización evita que los precios, formularios de
              participantes y botones de pago queden apretados dentro del menú
              principal de cursos.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-xl font-black text-yellow-500">
                1. Elegís curso o pack
              </h3>
              <p className="mt-3 leading-7 text-zinc-300">
                Desde este menú entrás al curso o pack que te interesa.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-xl font-black text-yellow-500">
                2. Revisás planes y beneficios
              </h3>
              <p className="mt-3 leading-7 text-zinc-300">
                En la página específica se muestran precios, beneficios,
                certificados y condiciones.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-xl font-black text-yellow-500">
                3. Comprás desde esa página
              </h3>
              <p className="mt-3 leading-7 text-zinc-300">
                El botón de compra queda en una página más cómoda, con espacio
                suficiente para participantes si corresponde.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-yellow-500 px-4 py-20 text-black sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-4xl font-black md:text-6xl">
            ¿No sabés qué opción elegir?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8">
            Contactá con SERVICAN y te orientamos según tu objetivo,
            experiencia y el tipo de trabajo que quieras desarrollar con tu
            perro.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/inscripcion"
              className="rounded-full bg-black px-9 py-4 font-black text-white transition hover:bg-zinc-800"
            >
              Hacer una consulta
            </Link>

            <a
              href={construirLinkWhatsApp()}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-black px-9 py-4 font-black text-black transition hover:bg-black hover:text-white"
            >
              WhatsApp directo
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

          <Link href="#membresia" className="hover:text-yellow-500">
            Membresía
          </Link>

          <Link href="#packs" className="hover:text-yellow-500">
            Packs
          </Link>

          <Link href="/inscripcion" className="hover:text-yellow-500">
            Consulta
          </Link>
        </div>

        <p className="mt-4 text-sm text-zinc-600">
          © 2026 SERVICAN. Todos los derechos reservados.
        </p>
      </footer>
    </main>
  );
}