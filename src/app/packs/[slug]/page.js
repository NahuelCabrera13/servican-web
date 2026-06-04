import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import HeaderAcceso from "@/app/components/HeaderAcceso";
import BotonComprarProducto from "@/app/components/BotonComprarProducto";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const whatsapp = "59898188257";

const PACKS_CONFIG = {
  "pack-basico-2-cursos": {
    nombre: "Pack Básico 2 cursos",
    slug: "pack-basico-2-cursos",
    plan: "basico",
    precio: 449,
    moneda: "USD",
    destacado: false,
    descripcion:
      "Entrada completa al sistema SERVICAN con los dos cursos principales en nivel Básico.",
    resumen:
      "Incluye Formación inicial Básico + Formación K9 Básico, PDFs, videos principales y certificados simples.",
    incluye: [
      "Formación inicial para guías caninos - Plan Básico.",
      "Formación de guías para canes detectores K9 - Plan Básico.",
      "PDF completo de ambos cursos.",
      "Videos explicativos principales.",
      "Videos demostrativos básicos.",
      "Ejercicios iniciales de cada curso.",
      "Certificado simple de participación por cada curso.",
      "Acceso privado desde el panel de alumno.",
    ],
    idealPara: [
      "Alumnos que quieren empezar con una base completa.",
      "Personas que quieren conocer ambos caminos de formación.",
      "Quienes buscan una opción más accesible que comprar ambos cursos por separado.",
    ],
    condiciones: [
      "Acceso individual para 1 usuario.",
      "Pago único.",
      "No incluye evaluación personalizada ni soporte prioritario.",
      "No incluye beneficios Pro.",
    ],
  },
  "pack-pro-2-cursos": {
    nombre: "Pack Pro 2 cursos",
    slug: "pack-pro-2-cursos",
    plan: "pro",
    precio: 1149,
    moneda: "USD",
    destacado: true,
    descripcion:
      "La opción más completa y recomendada para realizar los dos cursos principales con beneficios Pro.",
    resumen:
      "Incluye Formación inicial Pro + Formación K9 Pro, videos completos, ejercicios, evaluaciones, certificados profesionales y soporte prioritario.",
    incluye: [
      "Formación inicial para guías caninos - Plan Pro.",
      "Formación de guías para canes detectores K9 - Plan Pro.",
      "PDF completo de ambos cursos.",
      "Videos explicativos y demostrativos ampliados.",
      "Ejercicios y progresiones completas.",
      "Evaluaciones simples o tareas por módulo.",
      "Evaluación final teórica y/o práctica.",
      "Revisión de ejercicios o evidencia enviada por el alumno.",
      "Corrección personalizada según condiciones del plan.",
      "Soporte prioritario durante el curso.",
      "Certificado profesional SERVICAN con evaluación.",
      "Ahorro frente a comprar ambos planes Pro por separado.",
    ],
    idealPara: [
      "Alumnos que quieren una ruta completa de formación.",
      "Guías que buscan respaldo, evaluación y certificado profesional.",
      "Personas que quieren avanzar desde base canina hasta trabajo K9.",
    ],
    condiciones: [
      "Acceso individual para 1 usuario.",
      "Pago único.",
      "Incluye beneficios Pro de ambos cursos.",
      "El soporte y la corrección se aplican según las condiciones operativas de SERVICAN.",
    ],
  },
  "pack-plantel-2-cursos": {
    nombre: "Pack Plantel 2 cursos",
    slug: "pack-plantel-2-cursos",
    plan: "plantel",
    precio: 2799,
    moneda: "USD",
    destacado: false,
    descripcion:
      "Pack grupal para hasta 4 usuarios con ambos cursos completos y beneficios Pro.",
    resumen:
      "Incluye hasta 4 cuentas, ambos cursos completos, beneficios Pro, certificados individuales, correos autorizados y soporte grupal.",
    incluye: [
      "Acceso para hasta 4 cuentas individuales.",
      "Formación inicial para guías caninos completa.",
      "Formación de guías para canes detectores K9 completa.",
      "Beneficios del Plan Pro.",
      "Videos completos y materiales de ambos cursos.",
      "Evaluaciones según condiciones del plan.",
      "Certificado individual para cada participante.",
      "Correos autorizados por el comprador.",
      "Soporte grupal.",
    ],
    idealPara: [
      "Equipos de trabajo.",
      "Instituciones.",
      "Empresas o grupos que necesitan formar hasta 4 personas.",
    ],
    condiciones: [
      "El comprador debe ingresar los correos de los otros participantes.",
      "Todos los participantes deben tener cuenta registrada antes de comprar.",
      "Acceso individual para cada participante autorizado.",
      "Pago único.",
    ],
  },
};

function construirLinkWhatsApp(pack) {
  const mensaje = pack
    ? `Hola SERVICAN, quiero consultar por el ${pack.nombre}`
    : "Hola SERVICAN, quiero consultar por los packs de cursos.";

  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

function construirLinkConsulta(pack) {
  const mensaje = pack
    ? `Hola SERVICAN, quiero consultar por el ${pack.nombre}`
    : "Hola SERVICAN, quiero consultar por los packs de cursos.";

  return `/inscripcion?curso=${encodeURIComponent(
    pack?.nombre || "Packs SERVICAN"
  )}&mensaje=${encodeURIComponent(mensaje)}`;
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

async function obtenerPackPorSlug(slug) {
  const config = PACKS_CONFIG[slug];

  if (!config) {
    return {
      pack: null,
      config: null,
      error: "",
    };
  }

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
        texto_boton,
        producto_cursos (
          id,
          curso_id,
          nivel_acceso,
          beneficios_pro,
          orden
        )
      `
      )
      .eq("slug", slug)
      .eq("tipo_producto", "paquete")
      .maybeSingle();

    if (error) {
      return {
        pack: {
          ...config,
          id: null,
          tipo_producto: "paquete",
          activo: false,
          visible_en_web: false,
          cantidad_maxima_usuarios: config.plan === "plantel" ? 4 : 1,
          requiere_participantes: config.plan === "plantel",
          requiere_correos_registrados: true,
          texto_boton: "Comprar pack",
        },
        config,
        error: error.message,
      };
    }

    if (!data) {
      return {
        pack: {
          ...config,
          id: null,
          tipo_producto: "paquete",
          activo: false,
          visible_en_web: false,
          cantidad_maxima_usuarios: config.plan === "plantel" ? 4 : 1,
          requiere_participantes: config.plan === "plantel",
          requiere_correos_registrados: true,
          texto_boton: "Comprar pack",
        },
        config,
        error: "",
      };
    }

    return {
      pack: {
        ...config,
        ...data,
        nombre: data.nombre || config.nombre,
        descripcion: data.descripcion || config.descripcion,
        precio: data.precio || config.precio,
        moneda: data.moneda || config.moneda,
        plan: data.plan || config.plan,
      },
      config,
      error: "",
    };
  } catch (error) {
    return {
      pack: {
        ...config,
        id: null,
        tipo_producto: "paquete",
        activo: false,
        visible_en_web: false,
        cantidad_maxima_usuarios: config.plan === "plantel" ? 4 : 1,
        requiere_participantes: config.plan === "plantel",
        requiere_correos_registrados: true,
        texto_boton: "Comprar pack",
      },
      config,
      error: error?.message || "No se pudo cargar el pack.",
    };
  }
}

function SeccionLista({ titulo, items }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6">
      <h2 className="text-2xl font-black text-yellow-500">{titulo}</h2>

      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-zinc-300">
            <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-black text-black">
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function PackDetallePage({ params }) {
  const parametros = await params;
  const slug = parametros?.slug;

  const { pack, config, error } = await obtenerPackPorSlug(slug);

  if (!pack || !config) {
    notFound();
  }

  const esPro = pack.plan === "pro" || Boolean(pack.destacado);
  const esPlantel = pack.plan === "plantel";

  const compraHabilitada =
    Boolean(pack.id) && Boolean(pack.activo) && Boolean(pack.visible_en_web);

  return (
    <main className="min-h-screen bg-black text-white">
      <HeaderAcceso />

      <section className="relative overflow-hidden border-b border-yellow-500/20 bg-gradient-to-br from-black via-zinc-950 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(234,179,8,0.10),transparent_30%)]" />

        <div className="relative mx-auto grid max-w-[1500px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div>
            <Link
              href="/cursos#packs"
              className="inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-5 py-3 text-sm font-black text-yellow-300 transition hover:bg-yellow-500 hover:text-black"
            >
              ← Volver a packs
            </Link>

            <div className="mt-10 flex flex-wrap gap-2">
              <Badge color="blue">Pack de cursos</Badge>
              <Badge color={esPro ? "yellow" : "neutral"}>
                {pack.plan === "pro"
                  ? "Pro"
                  : pack.plan === "plantel"
                    ? "Plantel"
                    : "Básico"}
              </Badge>
              {esPro && <Badge color="yellow">Recomendado</Badge>}
              {esPlantel && <Badge color="green">Hasta 4 usuarios</Badge>}
            </div>

            <h1 className="mt-5 text-5xl font-black leading-tight md:text-7xl">
              {pack.nombre}
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
              {config.resumen}
            </p>

            <div className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                  Cursos incluidos
                </p>
                <p className="mt-1 text-2xl font-black text-yellow-500">2</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                  Nivel
                </p>
                <p className="mt-1 text-2xl font-black text-yellow-500">
                  {pack.plan === "pro"
                    ? "Pro"
                    : pack.plan === "plantel"
                      ? "Plantel"
                      : "Básico"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                  Usuarios
                </p>
                <p className="mt-1 text-2xl font-black text-yellow-500">
                  {pack.cantidad_maxima_usuarios || (esPlantel ? 4 : 1)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-yellow-500/30 bg-zinc-950 p-5 shadow-2xl">
            <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
              <Image
                src="/logo-servican.jpeg"
                alt="Logo SERVICAN"
                width={150}
                height={150}
                className="h-36 w-36 rounded-full object-contain opacity-90"
              />

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.18),transparent_45%)]" />

              <div className="absolute bottom-6 left-6 right-6 rounded-3xl border border-white/10 bg-black/80 p-5 backdrop-blur">
                <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
                  Precio del pack
                </p>

                <p className="mt-2 break-words text-[clamp(2.4rem,7vw,4rem)] font-black leading-tight text-white">
                  {formatearPrecio(pack)}
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Pago único. Compra desde esta página.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <section className="px-4 pt-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1500px] rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-yellow-100">
            <p className="font-bold">
              El pack se está mostrando con información base.
            </p>
            <p className="mt-2 text-sm">
              Error al consultar producto real: {error}
            </p>
          </div>
        </section>
      )}

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-[1fr_420px]">
          <div className="space-y-8">
            <SeccionLista titulo="Qué incluye este pack" items={config.incluye} />

            <SeccionLista titulo="Ideal para" items={config.idealPara} />

            <SeccionLista titulo="Condiciones importantes" items={config.condiciones} />
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[2rem] border border-yellow-500/30 bg-zinc-950 p-6 shadow-2xl">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-500">
                Comprar pack
              </p>

              <h2 className="mt-3 text-3xl font-black">{pack.nombre}</h2>

              <p className="mt-4 text-sm leading-6 text-zinc-300">
                {pack.descripcion || config.descripcion}
              </p>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black p-5">
                <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
                  Total
                </p>

                <p className="mt-2 break-words text-[clamp(2rem,6vw,3.2rem)] font-black leading-tight text-yellow-500">
                  {formatearPrecio(pack)}
                </p>
              </div>

              <div className="mt-6">
                {compraHabilitada ? (
                  <BotonComprarProducto producto={pack} />
                ) : (
                  <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-5">
                    <h3 className="text-xl font-black text-yellow-100">
                      Pack todavía no habilitado para compra
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-yellow-100">
                      La página ya está lista, pero falta crear o activar este
                      producto desde el panel admin para poder comprarlo.
                    </p>

                    <Link
                      href={construirLinkConsulta(pack)}
                      className="mt-5 block rounded-full bg-yellow-500 px-6 py-4 text-center font-black text-black transition hover:bg-yellow-400"
                    >
                      Consultar por este pack
                    </Link>
                  </div>
                )}
              </div>

              <a
                href={construirLinkWhatsApp(pack)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block rounded-full border border-white/15 bg-white/10 px-6 py-4 text-center font-black text-white transition hover:bg-white hover:text-black"
              >
                Consultar por WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-white/10 bg-zinc-950 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px] rounded-[2rem] border border-yellow-500/30 bg-black p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
                ¿Dudas antes de comprar?
              </p>

              <h2 className="mt-4 text-4xl font-black">
                Podemos orientarte antes de elegir
              </h2>

              <p className="mt-5 leading-8 text-zinc-300">
                Si no estás seguro de qué pack se adapta mejor a tu objetivo,
                podés consultar antes de comprar.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
              <Link
                href="/cursos"
                className="rounded-full bg-yellow-500 px-8 py-4 text-center font-black text-black transition hover:bg-yellow-400"
              >
                Volver a cursos
              </Link>

              <Link
                href="/inscripcion"
                className="rounded-full border border-white/15 bg-white/10 px-8 py-4 text-center font-black text-white transition hover:bg-white/20"
              >
                Hacer una consulta
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}