import Image from "next/image";
import Link from "next/link";
import HeaderAcceso from "../components/HeaderAcceso";
import BotonComprarProducto from "../components/BotonComprarProducto";
import BotonComprarMembresia from "../components/BotonComprarMembresia";
import MembresiaDestacadaCursos from "../components/MembresiaDestacadaCursos";
import { obtenerCursosActivos } from "@/lib/cursosPublicos";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const whatsapp = "59898188257";

const ORDEN_PLANES = {
  basico: 1,
  pro: 2,
  plantel: 3,
};

function construirLinkConsulta(curso) {
  const mensaje = curso
    ? `Hola SERVICAN, quiero consultar por el curso: ${curso.titulo}`
    : "Hola SERVICAN, quiero consultar por los cursos disponibles.";

  return `/inscripcion?curso=${encodeURIComponent(
    curso?.titulo || "Cursos SERVICAN"
  )}&mensaje=${encodeURIComponent(mensaje)}`;
}

function construirLinkWhatsApp(curso) {
  const mensaje = curso
    ? `Hola SERVICAN, quiero consultar por el curso: ${curso.titulo}`
    : "Hola SERVICAN, quiero consultar por los cursos disponibles.";

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
        texto_boton,
        producto_cursos (
          id,
          curso_id,
          nivel_acceso,
          beneficios_pro
        )
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

function Badge({ children, color = "yellow" }) {
  const colores = {
    yellow: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    green: "border-green-500/30 bg-green-500/10 text-green-200",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-200",
    neutral: "border-white/10 bg-white/10 text-zinc-200",
    red: "border-red-500/30 bg-red-500/10 text-red-200",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${colores[color]}`}
    >
      {children}
    </span>
  );
}

function InfoCard({ titulo, texto, icono }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-black p-7 transition hover:border-yellow-500/60">
      <p className="mb-4 text-4xl">{icono}</p>

      <h3 className="text-xl font-black text-yellow-500">{titulo}</h3>

      <p className="mt-3 leading-7 text-zinc-300">{texto}</p>
    </div>
  );
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
      maximumFractionDigits: producto?.precio < 100 ? 2 : 0,
    }).format(precio);
  } catch {
    return `${producto?.moneda || "USD"} ${precio}`;
  }
}

function nombrePlan(plan) {
  const planes = {
    basico: "Básico",
    pro: "Pro",
    plantel: "Plantel",
    mensual: "Mensual",
  };

  return planes[plan] || plan || "Plan";
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

function beneficiosPlanCurso(producto, curso) {
  const plan = String(producto?.plan || "").toLowerCase();
  const k9 = esCursoK9(curso);

  if (plan === "plantel") {
    return k9
      ? [
          "Acceso para hasta 4 cuentas individuales.",
          "Todo lo incluido en el Plan Pro K9.",
          "Certificado individual para cada participante.",
          "Evaluación y seguimiento por participante según condiciones.",
          "El comprador carga los correos autorizados.",
          "Todos los participantes deben estar registrados previamente.",
          "Soporte grupal para el plantel.",
        ]
      : [
          "Acceso para hasta 4 cuentas individuales.",
          "Todo lo incluido en el Plan Pro.",
          "Certificado individual para cada participante.",
          "El comprador carga los correos autorizados.",
          "Todos los participantes deben estar registrados previamente.",
          "Soporte grupal.",
        ];
  }

  if (plan === "pro") {
    return k9
      ? [
          "Todo lo incluido en el Plan Básico K9.",
          "Curso K9 completo con desarrollo profundo por módulos.",
          "Videos demostrativos completos de ejercicios y progresiones.",
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
          "Videos demostrativos ampliados y explicaciones más profundas.",
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
        "Videos demostrativos básicos y ejercicios explicados paso a paso.",
        "Historia y rol del guía canino.",
        "Instintos, impulsos, conducta y bases del aprendizaje.",
        "Refuerzos, comunicación y obediencia inicial.",
        "Ejercicios por módulo para practicar con el perro.",
        "Material complementario básico.",
        "Acceso extendido recomendado: 12 meses.",
        "Certificado simple de participación.",
      ];
}

function beneficiosPaquete(producto) {
  const plan = String(producto?.plan || "").toLowerCase();

  if (plan === "plantel") {
    return [
      "Hasta 4 cuentas individuales.",
      "Ambos cursos completos.",
      "Beneficios del Plan Pro.",
      "Certificados individuales.",
      "Correos autorizados.",
      "Soporte grupal.",
    ];
  }

  if (plan === "pro") {
    return [
      "Formación inicial Pro.",
      "Formación K9 Pro.",
      "Videos completos.",
      "Ejercicios y evaluaciones.",
      "Certificados profesionales.",
      "Soporte prioritario.",
    ];
  }

  return [
    "Formación inicial Básico.",
    "Formación K9 Básico.",
    "PDFs de ambos cursos.",
    "Videos principales.",
    "Certificados simples.",
    "Entrada completa al sistema SERVICAN.",
  ];
}

function obtenerProductosDelCurso(curso, productos) {
  return productos
    .filter((producto) => {
      if (producto.tipo_producto !== "curso_plan") {
        return false;
      }

      if (producto.plan === "extenso") {
        return false;
      }

      if (producto.curso_id && producto.curso_id === curso.id) {
        return true;
      }

      if (Array.isArray(producto.producto_cursos)) {
        return producto.producto_cursos.some(
          (item) => item.curso_id === curso.id
        );
      }

      return false;
    })
    .sort((a, b) => {
      const ordenA = ORDEN_PLANES[a.plan] || 99;
      const ordenB = ORDEN_PLANES[b.plan] || 99;

      if (ordenA !== ordenB) {
        return ordenA - ordenB;
      }

      return Number(a.precio || 0) - Number(b.precio || 0);
    });
}

function obtenerDescripcionPlan(producto, curso) {
  const plan = String(producto?.plan || "").toLowerCase();
  const k9 = esCursoK9(curso);

  if (plan === "plantel") {
    return k9
      ? "Para empresas, equipos de seguridad, grupos de trabajo o instituciones que quieran formar hasta 4 personas."
      : "Para equipos, familias, grupos o instituciones chicas que necesitan acceso individual para hasta 4 participantes.";
  }

  if (plan === "pro") {
    return k9
      ? "Plan principal del K9: contenido completo, evaluación, devolución, soporte y certificado profesional."
      : "Para alumnos que quieren respaldo, devolución, evaluación y certificado con mayor valor profesional.";
  }

  return k9
    ? "Entrada seria al trabajo K9: detección, búsqueda, asociación de olor, marcación y progresión inicial."
    : "Opción de entrada profesional para formar una base seria como guía canino.";
}

function ProductoCursoCard({ producto, curso }) {
  const plan = String(producto?.plan || "basico").toLowerCase();
  const destacado = plan === "pro" || Boolean(producto.destacado);
  const plantel = plan === "plantel";
  const beneficios = beneficiosPlanCurso(producto, curso);

  return (
    <article
      className={`flex h-full flex-col rounded-[1.7rem] border p-5 ${
        destacado
          ? "border-yellow-500/50 bg-yellow-500/10"
          : plantel
            ? "border-green-500/40 bg-green-500/10"
            : "border-white/10 bg-black"
      }`}
    >
      <div className="flex flex-wrap gap-2">
        <Badge color={destacado ? "yellow" : plantel ? "green" : "neutral"}>
          {nombrePlan(producto.plan)}
        </Badge>

        {destacado && <Badge color="yellow">Recomendado</Badge>}

        {plantel && (
          <Badge color="blue">
            Hasta {producto.cantidad_maxima_usuarios || 4} usuarios
          </Badge>
        )}
      </div>

      <h4 className="mt-4 text-2xl font-black text-white">
        {producto.nombre}
      </h4>

      <p className="mt-3 min-h-24 text-sm leading-6 text-zinc-300">
        {producto.descripcion || obtenerDescripcionPlan(producto, curso)}
      </p>

      <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-950 p-4">
        <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
          Precio
        </p>

        <p className="mt-1 text-3xl font-black text-yellow-500">
          {formatearPrecio(producto)}
        </p>

        <p className="mt-2 text-xs leading-5 text-zinc-500">
          Pago único. Acceso según el plan seleccionado.
        </p>
      </div>

      <div className="mt-5 flex-1">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-400">
          Qué incluye
        </p>

        <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
          {beneficios.map((beneficio) => (
            <li key={beneficio} className="flex gap-3">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-black text-black">
                ✓
              </span>
              <span>{beneficio}</span>
            </li>
          ))}
        </ul>
      </div>

      {plantel && (
        <div className="mt-5 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm leading-6 text-blue-100">
          El comprador debe ingresar los correos de los otros participantes.
          Todos deben tener cuenta registrada antes de comprar.
        </div>
      )}

      <div className="mt-6">
        <BotonComprarProducto producto={producto} />
      </div>
    </article>
  );
}

function ProductoPaqueteCard({ producto }) {
  const destacado = producto.plan === "pro" || Boolean(producto.destacado);
  const beneficios = beneficiosPaquete(producto);

  return (
    <article
      className={`flex h-full flex-col rounded-[1.7rem] border p-6 ${
        destacado
          ? "border-yellow-500/50 bg-yellow-500/10"
          : "border-white/10 bg-black"
      }`}
    >
      <div className="flex flex-wrap gap-2">
        <Badge color={destacado ? "yellow" : "blue"}>Pack</Badge>
        <Badge color="neutral">{nombrePlan(producto.plan)}</Badge>
        {destacado && <Badge color="yellow">Mejor valor</Badge>}
        {producto.requiere_participantes && (
          <Badge color="blue">
            Hasta {producto.cantidad_maxima_usuarios || 4} usuarios
          </Badge>
        )}
      </div>

      <h4 className="mt-4 text-2xl font-black text-white">
        {producto.nombre}
      </h4>

      <p className="mt-3 min-h-20 text-sm leading-6 text-zinc-300">
        {producto.descripcion ||
          "Paquete de cursos SERVICAN para avanzar con una ruta completa de formación."}
      </p>

      <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-950 p-4">
        <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
          Precio
        </p>

        <p className="mt-1 text-3xl font-black text-yellow-500">
          {formatearPrecio(producto)}
        </p>
      </div>

      <ul className="mt-5 flex-1 space-y-3 text-sm leading-6 text-zinc-300">
        {beneficios.map((beneficio) => (
          <li key={beneficio} className="flex gap-3">
            <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-black text-black">
              ✓
            </span>
            <span>{beneficio}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <BotonComprarProducto producto={producto} />
      </div>
    </article>
  );
}

function MembresiaFallbackCard({ membresia }) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-yellow-500/40 bg-gradient-to-br from-yellow-500/15 via-zinc-950 to-black p-7 shadow-2xl">
      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-center">
        <div>
          <Badge color="yellow">Membresía mensual</Badge>

          <h2 className="mt-5 text-4xl font-black md:text-5xl">
            Comunidad privada SERVICAN
          </h2>

          <p className="mt-5 max-w-3xl leading-8 text-zinc-300">
            Acceso mensual a contenido exclusivo, galería privada, beneficios de
            comunidad y descuentos para cursos principales.
          </p>

          <ul className="mt-6 grid gap-3 text-sm leading-6 text-zinc-200 md:grid-cols-2">
            <li>✓ Galería privada de fotos y videos.</li>
            <li>✓ Actualización semanal de contenido.</li>
            <li>✓ 10% de descuento en cursos.</li>
            <li>✓ 1 curso pequeño a elección cuando estén disponibles.</li>
            <li>✓ Contenido educativo corto.</li>
            <li>✓ Beneficios de comunidad.</li>
          </ul>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-black p-5">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-zinc-500">
            Precio mensual
          </p>

          <p className="mt-2 text-4xl font-black text-yellow-500">
            {formatearPrecio(membresia)}
          </p>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            La membresía se activa cuando Mercado Pago confirma la suscripción.
          </p>

          <div className="mt-5">
            <BotonComprarMembresia
              texto={membresia?.texto_boton || "Contratar membresía mensual"}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

export default async function CursosPage() {
  const { cursos, error } = await obtenerCursosActivos();
  const { productos, error: errorProductos } = await obtenerProductosPublicos();

  const productosSinExtenso = productos.filter(
    (producto) => producto.plan !== "extenso"
  );

  const paquetes = productosSinExtenso
    .filter((producto) => producto.tipo_producto === "paquete")
    .sort((a, b) => {
      const ordenA = ORDEN_PLANES[a.plan] || 99;
      const ordenB = ORDEN_PLANES[b.plan] || 99;

      if (ordenA !== ordenB) {
        return ordenA - ordenB;
      }

      return Number(a.precio || 0) - Number(b.precio || 0);
    });

  const membresias = productosSinExtenso.filter(
    (producto) => producto.tipo_producto === "membresia"
  );

  const membresiaPrincipal = membresias[0] || null;

  const beneficios = [
    {
      titulo: "Membresía arriba",
      texto: "La membresía queda destacada antes de los cursos para mostrar comunidad, beneficios y descuento.",
      icono: "⭐",
    },
    {
      titulo: "Planes claros",
      texto: "Cada curso muestra Básico, Pro y Plantel con una lista concreta de beneficios.",
      icono: "📚",
    },
    {
      titulo: "Compra protegida",
      texto: "Los planes grupales solicitan correos de participantes registrados antes de pagar.",
      icono: "🔐",
    },
    {
      titulo: "Certificación",
      texto: "Los planes muestran si incluyen certificado simple, profesional o individual por participante.",
      icono: "🎓",
    },
  ];

  const pasos = [
    {
      numero: "01",
      titulo: "Elegís membresía, curso o pack",
      texto: "Primero podés revisar la membresía mensual y luego comparar los cursos y paquetes disponibles.",
    },
    {
      numero: "02",
      titulo: "Comparás planes",
      texto: "Cada curso muestra Básico, Pro y Plantel con precio, beneficios y tipo de certificado.",
    },
    {
      numero: "03",
      titulo: "Iniciás sesión",
      texto: "Para comprar necesitás tener cuenta. En planes grupales, los otros correos también deben estar registrados.",
    },
    {
      numero: "04",
      titulo: "Pagás con Mercado Pago",
      texto: "Cuando Mercado Pago confirma el pago, la plataforma habilita el acceso correspondiente.",
    },
  ];

  const preguntas = [
    {
      pregunta: "¿La membresía reemplaza a los cursos principales?",
      respuesta:
        "No. La membresía es un producto mensual separado para contenido privado, galería, descuentos y comunidad.",
    },
    {
      pregunta: "¿Qué planes tienen los cursos principales?",
      respuesta:
        "Cada curso queda organizado en Básico, Pro y Plantel. El plan Extenso se elimina para simplificar la oferta.",
    },
    {
      pregunta: "¿Qué pasa si compro un plan Plantel?",
      respuesta:
        "El comprador debe ingresar los correos de los otros participantes. Todos tienen que tener cuenta registrada antes de comprar.",
    },
    {
      pregunta: "¿El K9 se muestra igual que un curso común?",
      respuesta:
        "No. El K9 se presenta como formación especializada en detección, búsqueda, asociación de olor, marcación y trabajo operativo.",
    },
    {
      pregunta: "¿Puedo consultar antes de comprar?",
      respuesta:
        "Sí. Podés enviar una consulta desde el formulario o comunicarte directamente por WhatsApp antes de elegir un plan.",
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

            <Link href="/#quienes-somos" className="hover:text-yellow-500">
              Quiénes somos
            </Link>

            <Link href="#membresia" className="hover:text-yellow-500">
              Membresía
            </Link>

            <Link href="#cursos-disponibles" className="hover:text-yellow-500">
              Cursos
            </Link>

            <Link href="#paquetes" className="hover:text-yellow-500">
              Packs
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
              Cursos, packs y membresía profesional
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
              Formación online para guías caninos, base profesional, trabajo
              guía-perro, especialización K9, packs de formación completa y
              membresía mensual con contenido privado.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Badge>Básico</Badge>
              <Badge>Pro</Badge>
              <Badge>Plantel</Badge>
              <Badge>Membresía mensual</Badge>
              <Badge>K9 especializado</Badge>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#membresia"
                className="rounded-full bg-yellow-500 px-8 py-4 text-center font-black text-black transition hover:bg-yellow-400"
              >
                Ver membresía
              </a>

              <a
                href="#cursos-disponibles"
                className="rounded-full border border-yellow-500 bg-black/40 px-8 py-4 text-center font-black text-yellow-500 transition hover:bg-yellow-500 hover:text-black"
              >
                Ver cursos
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
                  Plataforma privada
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  Cursos, comunidad y acceso por plan
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
                <p className="text-2xl font-black text-yellow-500">
                  {paquetes?.length || 0}
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  Packs visibles
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black text-yellow-500">
                  {membresiaPrincipal ? "Sí" : "No"}
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  Membresía activa
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

      <section
        id="membresia"
        className="border-b border-yellow-500/20 bg-zinc-950 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-[1450px]">
          <div className="mb-10 max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Primero: membresía SERVICAN
            </p>

            <h2 className="mt-4 text-4xl font-black md:text-6xl">
              Acceso mensual a contenido privado y beneficios
            </h2>

            <p className="mt-5 leading-8 text-zinc-300">
              La membresía no reemplaza a los cursos principales. Funciona como
              producto mensual para comunidad, galería privada, contenido corto,
              beneficios y descuentos.
            </p>
          </div>

          {membresiaPrincipal ? (
            <MembresiaDestacadaCursos membresia={membresiaPrincipal} />
          ) : (
            <div className="rounded-[2rem] border border-yellow-500/30 bg-yellow-500/10 p-8">
              <h3 className="text-3xl font-black">
                La membresía mensual todavía no está visible
              </h3>

              <p className="mt-4 max-w-3xl leading-7 text-yellow-100">
                Cuando actives el producto de membresía desde el admin,
                aparecerá en esta parte superior de cursos.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="border-b border-zinc-900 bg-black px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1450px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Organización clara
            </p>

            <h2 className="text-4xl font-black md:text-5xl">
              Qué vas a encontrar en esta sección
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {beneficios.map((item) => (
              <InfoCard
                key={item.titulo}
                titulo={item.titulo}
                texto={item.texto}
                icono={item.icono}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        id="cursos-disponibles"
        className="px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-[1450px]">
          {!error && cursos.length === 0 && (
            <div className="rounded-[2rem] border border-white/10 bg-zinc-950 p-10 text-center shadow-2xl">
              <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
                Cursos disponibles
              </p>

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
            <>
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-500">
                    Cursos principales
                  </p>

                  <h2 className="mt-2 text-4xl font-black md:text-5xl">
                    Elegí tu formación
                  </h2>

                  <p className="mt-4 max-w-3xl leading-8 text-zinc-400">
                    Cada curso queda organizado en tres opciones: Básico, Pro y
                    Plantel. El Plan Extenso se elimina para que la oferta sea
                    más clara.
                  </p>
                </div>

                <p className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-zinc-300">
                  Mostrando {cursos.length} curso
                  {cursos.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="space-y-10">
                {cursos.map((curso) => {
                  const productosCurso = obtenerProductosDelCurso(
                    curso,
                    productosSinExtenso
                  );

                  return (
                    <article
                      key={curso.id}
                      className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 shadow-2xl"
                    >
                      <div className="grid gap-0 lg:grid-cols-[0.78fr_1.22fr]">
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

                          {esCursoK9(curso) && (
                            <div className="absolute right-4 top-4 rounded-full border border-red-500/30 bg-red-500/20 px-4 py-2 text-xs font-black uppercase tracking-wide text-red-100">
                              K9 especializado
                            </div>
                          )}

                          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/90 to-transparent" />
                        </div>

                        <div className="p-7 md:p-9">
                          <div className="mb-4 flex flex-wrap gap-2">
                            {curso.categoria && <Badge>{curso.categoria}</Badge>}
                            {curso.modalidad && <Badge>{curso.modalidad}</Badge>}
                            <Badge color="green">Acceso privado</Badge>
                            {esCursoK9(curso) && (
                              <Badge color="red">Detección</Badge>
                            )}
                          </div>

                          <h3 className="text-4xl font-black text-white">
                            {curso.titulo}
                          </h3>

                          <p className="mt-4 max-w-4xl leading-8 text-zinc-300">
                            {curso.descripcion ||
                              "Curso de formación SERVICAN. Revisá sus planes, beneficios y acceso correspondiente."}
                          </p>

                          <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-black p-4">
                              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                                Planes
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
                                {curso.duracion || "A definir"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                            <Link
                              href={`/cursos/${curso.slug}`}
                              className="rounded-full border border-yellow-500 px-6 py-4 text-center font-black text-yellow-500 transition hover:bg-yellow-500 hover:text-black"
                            >
                              Ver información completa
                            </Link>

                            <Link
                              href={construirLinkConsulta(curso)}
                              className="rounded-full border border-white/15 bg-white/5 px-6 py-4 text-center font-black text-white transition hover:bg-white hover:text-black"
                            >
                              Consultar antes de comprar
                            </Link>
                          </div>

                          <div className="mt-8">
                            <div className="mb-4 flex items-center justify-between gap-4">
                              <h4 className="text-2xl font-black">
                                Planes disponibles
                              </h4>

                              <span className="rounded-full border border-white/10 bg-black px-4 py-2 text-xs font-bold text-zinc-400">
                                {productosCurso.length} plan
                                {productosCurso.length === 1 ? "" : "es"}
                              </span>
                            </div>

                            {productosCurso.length === 0 && (
                              <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-5 text-sm leading-7 text-yellow-100">
                                Este curso todavía no tiene productos visibles
                                para compra. Desde el panel admin podés generar
                                planes y marcarlos como activos y visibles.
                              </div>
                            )}

                            {productosCurso.length > 0 && (
                              <div className="grid gap-4 xl:grid-cols-3">
                                {productosCurso.map((producto) => (
                                  <ProductoCursoCard
                                    key={producto.id}
                                    producto={producto}
                                    curso={curso}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      <section
        id="paquetes"
        className="border-y border-zinc-900 bg-zinc-950 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-[1450px]">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
                Packs de cursos
              </p>

              <h2 className="mt-3 text-4xl font-black md:text-5xl">
                Ruta completa de formación
              </h2>

              <p className="mt-4 max-w-3xl leading-8 text-zinc-400">
                Los packs combinan los dos cursos principales y sirven para
                aumentar el valor de la formación completa. La membresía no se
                repite acá porque queda destacada arriba.
              </p>
            </div>
          </div>

          {paquetes.length === 0 && (
            <div className="rounded-[2rem] border border-white/10 bg-black p-8 text-center">
              <h3 className="text-3xl font-black">
                Todavía no hay packs visibles
              </h3>

              <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-400">
                Cuando actives Pack Básico, Pack Pro o Pack Plantel desde el
                panel admin, aparecerán en esta sección.
              </p>
            </div>
          )}

          {paquetes.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {paquetes.map((producto) => (
                <ProductoPaqueteCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-b border-zinc-900 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1450px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Proceso de compra
            </p>

            <h2 className="text-4xl font-black md:text-5xl">
              Cómo se habilita un curso, pack o membresía
            </h2>

            <p className="mt-4 leading-8 text-zinc-300">
              El flujo está pensado para que la compra sea clara y el acceso se
              habilite cuando Mercado Pago confirma el pago.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {pasos.map((paso) => (
              <div
                key={paso.numero}
                className="rounded-3xl border border-zinc-800 bg-black p-7 transition hover:border-yellow-500/60"
              >
                <p className="text-4xl font-black text-yellow-500">
                  {paso.numero}
                </p>

                <h3 className="mt-5 text-xl font-black text-white">
                  {paso.titulo}
                </h3>

                <p className="mt-3 leading-7 text-zinc-300">{paso.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1450px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Preguntas frecuentes
            </p>

            <h2 className="text-4xl font-black md:text-5xl">
              Dudas comunes sobre cursos, membresías y pagos
            </h2>

            <p className="mt-5 leading-8 text-zinc-300">
              Esta sección ayuda a que el alumno entienda cómo funciona el
              registro, la compra, el acceso privado, la membresía, los packs y
              los certificados.
            </p>

            <div className="mt-8 rounded-[2rem] border border-yellow-500/25 bg-yellow-500/10 p-6">
              <h3 className="text-2xl font-black text-yellow-400">
                Importante
              </h3>

              <p className="mt-3 leading-7 text-yellow-100">
                Para comprar necesitás iniciar sesión. En planes Plantel o packs
                grupales, todos los participantes deben tener una cuenta
                registrada antes de la compra.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {preguntas.map((item) => (
              <div
                key={item.pregunta}
                className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6"
              >
                <h3 className="text-xl font-black text-yellow-500">
                  {item.pregunta}
                </h3>

                <p className="mt-3 leading-7 text-zinc-300">{item.respuesta}</p>
              </div>
            ))}
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

          <Link href="#paquetes" className="hover:text-yellow-500">
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