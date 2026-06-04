import Link from "next/link";
import { notFound } from "next/navigation";
import HeaderAcceso from "../../components/HeaderAcceso";
import BotonComprarProducto from "../../components/BotonComprarProducto";
import { obtenerCursoPorSlug } from "@/lib/cursosPublicos";
import { obtenerProductosActivosPorCurso } from "@/lib/productosPublicos";

export const dynamic = "force-dynamic";

const PLANES_INFO = {
  basico: {
    nombre: "Básico",
    etiqueta: "Entrada profesional",
    color: "neutral",
  },
  pro: {
    nombre: "Pro",
    etiqueta: "Recomendado",
    color: "yellow",
  },
  plantel: {
    nombre: "Plantel",
    etiqueta: "Hasta 4 usuarios",
    color: "green",
  },
};

const ORDEN_PLANES = {
  basico: 1,
  pro: 2,
  plantel: 3,
};

function normalizarPlan(plan) {
  const valor = String(plan || "").toLowerCase().trim();

  if (PLANES_INFO[valor]) {
    return valor;
  }

  return "basico";
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

function formatearPrecio(precio, moneda) {
  const numero = Number(precio || 0);

  if (!numero) {
    return "Consultar";
  }

  try {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: moneda || "USD",
      maximumFractionDigits: numero < 100 ? 2 : 0,
    }).format(numero);
  } catch {
    return `${moneda || "USD"} ${numero}`;
  }
}

function ordenarProductos(productos) {
  return [...(productos || [])]
    .filter((producto) => producto.plan !== "extenso")
    .sort((a, b) => {
      const ordenA = Number(a.orden || 0);
      const ordenB = Number(b.orden || 0);

      if (ordenA !== ordenB) {
        return ordenA - ordenB;
      }

      const planA = ORDEN_PLANES[normalizarPlan(a.plan)] || 99;
      const planB = ORDEN_PLANES[normalizarPlan(b.plan)] || 99;

      return planA - planB;
    });
}

function construirLinkConsulta(curso) {
  const mensaje = `Hola SERVICAN, quiero consultar por el curso: ${curso.titulo}`;

  return `/inscripcion?curso=${encodeURIComponent(
    curso.titulo
  )}&mensaje=${encodeURIComponent(mensaje)}`;
}

function obtenerResumenPlan(producto, curso) {
  const plan = normalizarPlan(producto.plan);
  const k9 = esCursoK9(curso);

  if (plan === "plantel") {
    return k9
      ? "Para empresas, equipos de seguridad, instituciones o grupos de trabajo que quieran formar hasta 4 personas en detección K9."
      : "Para equipos, familias, grupos o instituciones pequeñas que necesitan formar hasta 4 personas con acceso individual.";
  }

  if (plan === "pro") {
    return k9
      ? "El plan principal del K9: contenido completo, evaluación, corrección, soporte y certificado profesional."
      : "Para alumnos que quieren evaluación, revisión de ejercicios, soporte prioritario y certificado profesional.";
  }

  return k9
    ? "Entrada seria al mundo K9: detección, búsqueda, asociación de olor, marcación y ejercicios iniciales."
    : "Para alumnos que quieren una base profesional sobre el rol del guía canino, conducta, obediencia inicial y fundamentos de trabajo.";
}

function obtenerBeneficiosPlan(producto, curso) {
  const plan = normalizarPlan(producto.plan);
  const k9 = esCursoK9(curso);

  if (plan === "plantel") {
    return k9
      ? [
          "Acceso para hasta 4 cuentas individuales.",
          "Todo lo incluido en el Plan Pro K9.",
          "Certificado individual para cada participante.",
          "Evaluación y seguimiento por participante según condiciones del plan.",
          "El comprador carga los correos autorizados.",
          "Todos los participantes deben estar registrados previamente.",
          "Soporte grupal para el plantel.",
          "Precio pensado para empresas, equipos de seguridad, instituciones o grupos de trabajo.",
        ]
      : [
          "Acceso para hasta 4 cuentas individuales.",
          "Todo lo incluido en el Plan Pro.",
          "Certificado individual para cada participante.",
          "El comprador carga los correos autorizados.",
          "Todos los participantes deben estar registrados previamente.",
          "Soporte grupal.",
          "Precio por persona más conveniente frente al Plan Pro individual.",
        ];
  }

  if (plan === "pro") {
    return k9
      ? [
          "Todo lo incluido en el Plan Básico K9.",
          "Curso K9 completo con desarrollo profundo por módulos.",
          "Videos demostrativos completos de ejercicios y progresiones.",
          "Progresión de entrenamiento paso a paso.",
          "Asociación y fijación de olor.",
          "Búsqueda sistemática y metodología de trabajo.",
          "Lectura del perro: señales, cambios de conducta y comunicación.",
          "Manejo del guía: posición, conducción, tiempos y errores frecuentes.",
          "Marcación pasiva y activa con criterios de corrección.",
          "Protocolos técnicos de entrenamiento.",
          "Casos reales y aplicación en escenarios operativos.",
          "Evaluación teórica final.",
          "Evaluación práctica mediante videos enviados por el alumno.",
          "Corrección personalizada de ejercicios.",
          "Soporte prioritario durante el curso.",
          "Certificado profesional SERVICAN con evaluación.",
        ]
      : [
          "Todo lo incluido en el Plan Básico.",
          "Videos demostrativos ampliados y explicaciones más profundas de los ejercicios.",
          "Evaluaciones simples o tareas por módulo.",
          "Evaluación final teórica y/o práctica.",
          "Revisión de ejercicios o evidencia enviada por el alumno.",
          "Soporte prioritario por plataforma, mail o WhatsApp.",
          "Certificado de aprobación profesional SERVICAN.",
          "Casos prácticos y situaciones reales de entrenamiento.",
          "Errores frecuentes y formas de corregirlos.",
          "Actualizaciones del curso durante el período de acceso.",
          "Descuento en el curso K9 u otros productos SERVICAN.",
        ];
  }

  return k9
    ? [
        "Acceso al curso K9 online en plataforma SERVICAN.",
        "PDF completo del curso K9.",
        "Videos explicativos de los módulos principales.",
        "Videos demostrativos básicos de búsqueda y detección.",
        "Introducción al perro detector: función, perfil y objetivos.",
        "Selección del perro y características deseadas.",
        "Motivación y juego como base de trabajo.",
        "Asociación de olor inicial.",
        "Búsqueda sistemática introductoria.",
        "Marcación pasiva y activa.",
        "Ejercicios iniciales para comprender la progresión.",
        "Certificado simple de participación.",
      ]
    : [
        "Acceso al curso online en plataforma SERVICAN.",
        "PDF completo del curso, ordenado por módulos.",
        "Videos explicativos de los temas principales.",
        "Videos demostrativos básicos y parte de los ejercicios explicados paso a paso.",
        "Historia y rol del guía canino.",
        "Instintos, impulsos, conducta y bases del aprendizaje.",
        "Refuerzos, comunicación y obediencia inicial.",
        "Ejercicios por módulo para practicar con el perro.",
        "Material complementario básico: recomendaciones, guías y errores comunes.",
        "Acceso extendido recomendado: 12 meses.",
        "Certificado simple de participación.",
      ];
}

function obtenerDetallesCurso(curso) {
  if (esCursoK9(curso)) {
    return [
      {
        titulo: "Especialización K9",
        texto: "Formación orientada a detección, búsqueda, asociación de olor, marcación y trabajo operativo.",
      },
      {
        titulo: "Trabajo técnico",
        texto: "Incluye lectura del perro, progresiones, manejo del guía y criterios de corrección.",
      },
      {
        titulo: "Marcación",
        texto: "Se trabaja sobre marcación pasiva y activa dentro de la progresión del perro detector.",
      },
      {
        titulo: "Certificación",
        texto: "Según el plan elegido, el alumno accede a certificado simple o certificado profesional con evaluación.",
      },
    ];
  }

  return [
    {
      titulo: "Base profesional",
      texto: "Formación inicial para comprender el rol del guía canino y los fundamentos de trabajo.",
    },
    {
      titulo: "Conducta y aprendizaje",
      texto: "Instintos, impulsos, conducta, refuerzos, comunicación y obediencia inicial.",
    },
    {
      titulo: "Material guiado",
      texto: "PDF completo, videos explicativos, demostraciones básicas y ejercicios por módulo.",
    },
    {
      titulo: "Certificación",
      texto: "Según el plan elegido, el alumno accede a certificado simple o certificado profesional con evaluación.",
    },
  ];
}

function PlanCard({ producto, curso }) {
  const planKey = normalizarPlan(producto.plan);
  const info = PLANES_INFO[planKey];
  const precio = formatearPrecio(producto.precio, producto.moneda);
  const esPro = planKey === "pro";
  const esPlantel = planKey === "plantel";
  const cantidadUsuarios = Number(producto.cantidad_maxima_usuarios || 1);
  const beneficios = obtenerBeneficiosPlan(producto, curso);
  const resumen = producto.descripcion || obtenerResumenPlan(producto, curso);

  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden rounded-[2rem] border bg-zinc-950 shadow-2xl ${
        esPro
          ? "border-yellow-500/60"
          : esPlantel
            ? "border-green-500/50"
            : "border-white/10"
      }`}
    >
      {esPro && (
        <div className="absolute right-5 top-5 rounded-full bg-yellow-500 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black">
          Recomendado
        </div>
      )}

      {esPlantel && (
        <div className="absolute right-5 top-5 rounded-full bg-green-500 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black">
          Grupal
        </div>
      )}

      <div className="border-b border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
          {info.etiqueta}
        </p>

        <h3 className="mt-4 text-3xl font-black">Plan {info.nombre}</h3>

        <p className="mt-4 min-h-24 leading-7 text-zinc-300">{resumen}</p>

        <div className="mt-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Precio
          </p>

          <p className="mt-2 text-5xl font-black text-white">{precio}</p>

          <p className="mt-2 text-sm text-zinc-500">
            Pago único. Acceso al contenido habilitado para este plan.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
              Usuarios incluidos
            </p>
            <p className="mt-2 text-2xl font-black">
              {cantidadUsuarios === 1
                ? "1 usuario"
                : `${cantidadUsuarios} usuarios`}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
              Nivel de acceso
            </p>
            <p className="mt-2 text-2xl font-black">{info.nombre}</p>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-lg font-black text-yellow-400">
            Qué incluye este plan
          </h4>

          <ul className="mt-4 space-y-3">
            {beneficios.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-sm leading-6 text-zinc-300"
              >
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-black text-black">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {esPlantel && (
          <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-4">
            <h4 className="font-black text-green-200">
              Compra para varios participantes
            </h4>

            <p className="mt-2 text-sm leading-6 text-green-100">
              Este plan requiere ingresar los correos de los otros participantes
              antes de pagar. Todos deben tener una cuenta registrada en
              SERVICAN.
            </p>
          </div>
        )}

        <div className="mt-8">
          <BotonComprarProducto producto={producto} />
        </div>
      </div>
    </article>
  );
}

export default async function CursoDetallePage({ params }) {
  const parametros = await params;
  const slug = parametros?.slug;

  const resultadoCurso = await obtenerCursoPorSlug(slug);
  const curso = resultadoCurso?.curso || resultadoCurso;

  if (!curso) {
    notFound();
  }

  const productos = ordenarProductos(await obtenerProductosActivosPorCurso(curso));
  const detallesCurso = obtenerDetallesCurso(curso);
  const k9 = esCursoK9(curso);

  return (
    <main className="min-h-screen bg-black text-white">
      <HeaderAcceso />

      <section className="relative overflow-hidden border-b border-yellow-500/20 bg-gradient-to-br from-black via-zinc-950 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(234,179,8,0.10),transparent_30%)]" />

        <div className="relative mx-auto grid max-w-[1500px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div>
            <Link
              href="/cursos"
              className="inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-5 py-3 text-sm font-black text-yellow-300 transition hover:bg-yellow-500 hover:text-black"
            >
              ← Volver a cursos
            </Link>

            <p className="mt-10 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              {k9 ? "Curso especializado K9" : "Curso SERVICAN"}
            </p>

            <h1 className="mt-5 text-5xl font-black leading-tight md:text-7xl">
              {curso.titulo}
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
              {curso.descripcion ||
                "Formación profesional con contenido organizado por módulos, materiales de estudio y acceso privado para alumnos."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {curso.categoria && (
                <span className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold text-zinc-200">
                  {curso.categoria}
                </span>
              )}

              {curso.duracion && (
                <span className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold text-zinc-200">
                  Duración: {curso.duracion}
                </span>
              )}

              {curso.modalidad && (
                <span className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold text-zinc-200">
                  Modalidad: {curso.modalidad}
                </span>
              )}

              <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-5 py-3 text-sm font-bold text-yellow-200">
                Básico · Pro · Plantel
              </span>

              {k9 && (
                <span className="rounded-full border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-200">
                  Detección y trabajo operativo
                </span>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-yellow-500/30 bg-zinc-950 p-5 shadow-2xl">
            {curso.imagen_url ? (
              <img
                src={curso.imagen_url}
                alt={curso.titulo}
                className="h-[420px] w-full rounded-[1.5rem] object-cover"
              />
            ) : (
              <div className="flex h-[420px] items-center justify-center rounded-[1.5rem] border border-white/10 bg-black text-center">
                <div>
                  <img
                    src="/logo-servican.jpeg"
                    alt="Logo SERVICAN"
                    className="mx-auto h-28 w-28 rounded-full object-contain"
                  />
                  <p className="mt-6 text-lg font-black text-yellow-500">
                    SERVICAN
                  </p>
                  <p className="mt-2 text-zinc-400">
                    Formación canina profesional
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-6 md:grid-cols-4">
            {detallesCurso.map((item) => (
              <div
                key={item.titulo}
                className="rounded-[2rem] border border-white/10 bg-black p-6"
              >
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                  SERVICAN
                </p>
                <p className="mt-3 text-2xl font-black text-yellow-500">
                  {item.titulo}
                </p>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {item.texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          <div className="max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Planes disponibles
            </p>

            <h2 className="mt-4 text-4xl font-black md:text-6xl">
              Elegí el nivel de formación
            </h2>

            <p className="mt-5 leading-8 text-zinc-300">
              Este curso está organizado en tres opciones claras: Básico, Pro y
              Plantel. El Plan Extenso fue eliminado para simplificar la oferta
              y repartir sus beneficios entre Básico y Pro.
            </p>
          </div>

          {productos.length === 0 ? (
            <div className="mt-10 rounded-[2rem] border border-yellow-500/30 bg-yellow-500/10 p-8">
              <h3 className="text-3xl font-black">
                Todavía no hay planes activos para este curso
              </h3>

              <p className="mt-4 max-w-3xl leading-7 text-yellow-100">
                El curso existe, pero todavía no tiene planes asociados,
                activos y visibles. Revisá en el panel admin que el producto
                esté asociado a este curso.
              </p>

              <Link
                href={construirLinkConsulta(curso)}
                className="mt-6 inline-block rounded-full bg-yellow-500 px-8 py-4 font-black text-black transition hover:bg-yellow-400"
              >
                Consultar disponibilidad
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-8 xl:grid-cols-3">
              {productos.map((producto) => (
                <PlanCard key={producto.id} producto={producto} curso={curso} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-white/10 bg-zinc-950 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px] rounded-[2rem] border border-yellow-500/30 bg-black p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
                Dudas antes de comprar
              </p>

              <h2 className="mt-4 text-4xl font-black">
                ¿No sabés qué plan elegir?
              </h2>

              <p className="mt-5 leading-8 text-zinc-300">
                Si no estás seguro de qué plan se adapta mejor a tu objetivo,
                podés consultar antes de comprar. SERVICAN puede orientarte
                según tu experiencia, el tipo de perro, el objetivo de formación
                y el nivel de acompañamiento que necesitás.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
              <Link
                href={construirLinkConsulta(curso)}
                className="rounded-full bg-yellow-500 px-8 py-4 text-center font-black text-black transition hover:bg-yellow-400"
              >
                Consultar por este curso
              </Link>

              <Link
                href="/cursos"
                className="rounded-full border border-white/15 bg-white/10 px-8 py-4 text-center font-black text-white transition hover:bg-white/20"
              >
                Ver otros cursos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}