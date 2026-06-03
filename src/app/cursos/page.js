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

function construirLinkConsulta(curso) {
  const mensaje = `Hola SERVICAN, quiero consultar por el curso: ${curso.titulo}`;

  return `/inscripcion?curso=${encodeURIComponent(
    curso.titulo
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

  if (!precio) return "Consultar";

  return `${producto?.moneda || "UYU"} ${Math.round(precio)}`;
}

function nombrePlan(plan) {
  const planes = {
    basico: "Básico",
    extenso: "Extenso",
    pro: "Pro",
    plantel: "Plantel",
    mensual: "Mensual",
  };

  return planes[plan] || plan || "Plan";
}

function beneficiosPlan(producto) {
  const plan = producto?.plan;

  if (producto?.tipo_producto === "paquete") {
    return [
      "Acceso a más de un curso incluido",
      "Hasta 4 usuarios autorizados",
      "Correos de participantes registrados",
      "Beneficios del plan Pro",
    ];
  }

  if (producto?.tipo_producto === "membresia") {
    return [
      "Acceso mensual a contenido exclusivo",
      "Galería privada de fotos y videos",
      "10% de descuento en cursos principales",
      "1 curso pequeño a elección cuando estén disponibles",
    ];
  }

  if (plan === "plantel") {
    return [
      "Acceso para hasta 4 usuarios",
      "Participantes con cuenta registrada",
      "Beneficios del plan Pro",
      "Ideal para equipos o familias",
    ];
  }

  if (plan === "pro") {
    return [
      "Acceso completo al curso",
      "Material complementario",
      "Beneficios avanzados",
      "Certificación según aprobación",
    ];
  }

  if (plan === "extenso") {
    return [
      "Acceso ampliado al contenido",
      "Más desarrollo que el plan básico",
      "Material de apoyo",
      "Progreso dentro del panel",
    ];
  }

  return [
    "Acceso al contenido inicial",
    "Panel privado de alumno",
    "Progreso por clases",
    "Base formativa ordenada",
  ];
}

function obtenerProductosDelCurso(curso, productos) {
  return productos.filter((producto) => {
    if (producto.tipo_producto !== "curso_plan") return false;

    if (producto.curso_id && producto.curso_id === curso.id) return true;

    if (Array.isArray(producto.producto_cursos)) {
      return producto.producto_cursos.some((item) => item.curso_id === curso.id);
    }

    return false;
  });
}

function ProductoCard({ producto }) {
  const esRecurrente = Boolean(producto.es_recurrente);
  const esMembresia = producto.tipo_producto === "membresia";

  return (
    <article
      className={`rounded-[1.7rem] border p-5 ${
        producto.destacado
          ? "border-yellow-500/40 bg-yellow-500/10"
          : "border-white/10 bg-black"
      }`}
    >
      <div className="flex flex-wrap gap-2">
        <Badge color={producto.destacado ? "yellow" : "neutral"}>
          {nombrePlan(producto.plan)}
        </Badge>

        {producto.tipo_producto === "paquete" && (
          <Badge color="blue">Paquete</Badge>
        )}

        {producto.tipo_producto === "membresia" && (
          <Badge color="yellow">Membresía</Badge>
        )}

        {producto.es_recurrente && <Badge color="green">Mensual</Badge>}

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
          "Plan de acceso SERVICAN con contenido privado dentro del panel del alumno."}
      </p>

      <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-950 p-4">
        <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
          Precio
        </p>

        <p className="mt-1 text-3xl font-black text-yellow-500">
          {formatearPrecio(producto)}
        </p>
      </div>

      <ul className="mt-5 space-y-3 text-sm leading-6 text-zinc-300">
        {beneficiosPlan(producto).map((beneficio) => (
          <li key={beneficio} className="flex gap-3">
            <span className="mt-1 text-yellow-500">✓</span>
            <span>{beneficio}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        {esMembresia ? (
          <BotonComprarMembresia
            texto={producto.texto_boton || "Contratar membresía mensual"}
          />
        ) : (
          <BotonComprarProducto producto={producto} />
        )}
      </div>

      {esRecurrente && esMembresia && (
        <p className="mt-4 rounded-2xl border border-green-500/20 bg-green-500/10 p-3 text-xs leading-5 text-green-100">
          La membresía se activa automáticamente cuando Mercado Pago confirma el
          pago por webhook.
        </p>
      )}
    </article>
  );
}

export default async function CursosPage() {
  const { cursos, error } = await obtenerCursosActivos();
  const { productos, error: errorProductos } = await obtenerProductosPublicos();

  const paquetes = productos.filter(
    (producto) => producto.tipo_producto === "paquete"
  );

  const membresias = productos.filter(
    (producto) => producto.tipo_producto === "membresia"
  );

  const membresiaPrincipal = membresias[0] || null;

  const beneficios = [
    {
      titulo: "Compra y acceso privado",
      texto: "El alumno puede comprar un plan y acceder desde su panel cuando el pago queda confirmado.",
      icono: "🔐",
    },
    {
      titulo: "Planes por nivel",
      texto: "Cada curso puede tener plan Básico, Extenso, Pro o Plantel según el nivel de acceso.",
      icono: "📚",
    },
    {
      titulo: "Paquetes grupales",
      texto: "Los planes para más de una persona solicitan correos de participantes registrados.",
      icono: "👥",
    },
    {
      titulo: "Certificación",
      texto: "La plataforma permite emitir certificados privados con verificación pública por código.",
      icono: "🎓",
    },
  ];

  const pasos = [
    {
      numero: "01",
      titulo: "Elegís curso o plan",
      texto: "Revisás los cursos, comparás planes disponibles y elegís el acceso que mejor se adapte a tu objetivo.",
    },
    {
      numero: "02",
      titulo: "Iniciás sesión",
      texto: "Para comprar necesitás tener una cuenta creada. Si el plan es grupal, los otros correos también deben estar registrados.",
    },
    {
      numero: "03",
      titulo: "Pagás con Mercado Pago",
      texto: "La plataforma genera la preferencia de pago y procesa el estado mediante webhook.",
    },
    {
      numero: "04",
      titulo: "Accedés al panel",
      texto: "Cuando el pago queda aprobado, el curso se habilita en tu panel privado de alumno.",
    },
  ];

  const preguntas = [
    {
      pregunta: "¿Crear una cuenta habilita automáticamente un curso?",
      respuesta:
        "No. La cuenta permite ingresar al panel, pero los cursos privados se habilitan cuando se confirma el pago o cuando SERVICAN autoriza el acceso.",
    },
    {
      pregunta: "¿Qué incluye la membresía mensual?",
      respuesta:
        "Incluye acceso a galería privada, contenido exclusivo, 10% de descuento en cursos principales y 1 curso pequeño a elección cuando esa sección esté disponible.",
    },
    {
      pregunta: "¿Qué pasa si compro un plan Plantel?",
      respuesta:
        "El comprador debe indicar los correos de los otros participantes. Todos tienen que tener cuenta registrada para poder continuar.",
    },
    {
      pregunta: "¿Puedo consultar antes de comprar?",
      respuesta:
        "Sí. Podés enviar una consulta desde el formulario o comunicarte directamente por WhatsApp antes de elegir un plan.",
    },
    {
      pregunta: "¿Los cursos tienen certificado?",
      respuesta:
        "La plataforma permite emitir certificados privados para alumnos y verificar públicamente su validez mediante un código único.",
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

      <section className="relative overflow-hidden border-b border-zinc-900 px-4 py-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#3f3210_0%,#111_34%,#000_78%)]" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black to-transparent" />

        <div className="relative mx-auto grid max-w-[1450px] gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Academia SERVICAN
            </p>

            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              Cursos, planes y membresía SERVICAN
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
              Formación para guías caninos, trabajo guía-perro, manejo,
              obediencia, control, especialización K9 y acceso privado a
              contenido profesional dentro de la plataforma SERVICAN.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Badge>Planes de curso</Badge>
              <Badge>Mercado Pago</Badge>
              <Badge>Acceso privado</Badge>
              <Badge>Membresía mensual</Badge>
              <Badge>K9</Badge>
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
                Ver cursos y planes
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
                  Compra, acceso y progreso en un solo lugar
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
                  {productos?.length || 0}
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  Productos visibles
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black text-yellow-500">MP</p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  Mercado Pago
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

      {membresiaPrincipal && (
        <section
          id="membresia"
          className="border-b border-zinc-900 bg-black px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-[1450px]">
            <MembresiaDestacadaCursos membresia={membresiaPrincipal} />
          </div>
        </section>
      )}

      <section className="border-b border-zinc-900 bg-zinc-950 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1450px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Qué ofrece la formación
            </p>

            <h2 className="text-4xl font-black md:text-5xl">
              Una plataforma pensada para vender y formar
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
                    Programas disponibles
                  </p>

                  <h2 className="mt-2 text-4xl font-black md:text-5xl">
                    Cursos activos
                  </h2>

                  <p className="mt-4 max-w-2xl leading-8 text-zinc-400">
                    Elegí un curso, revisá sus planes y comprá el acceso
                    correspondiente. Si tenés membresía activa, más adelante se
                    aplicará automáticamente el 10% de descuento desde el
                    servidor.
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
                    productos
                  );

                  return (
                    <article
                      key={curso.id}
                      className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 shadow-2xl"
                    >
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

                          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/90 to-transparent" />
                        </div>

                        <div className="p-7 md:p-9">
                          <div className="mb-4 flex flex-wrap gap-2">
                            {curso.categoria && <Badge>{curso.categoria}</Badge>}
                            {curso.modalidad && <Badge>{curso.modalidad}</Badge>}
                            <Badge color="green">Acceso privado</Badge>
                          </div>

                          <h3 className="text-4xl font-black text-white">
                            {curso.titulo}
                          </h3>

                          <p className="mt-4 max-w-4xl leading-8 text-zinc-300">
                            {curso.descripcion ||
                              "Curso de formación SERVICAN. Consultá por información, modalidad, contenidos y próximos cupos."}
                          </p>

                          <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-black p-4">
                              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                                Precio visible
                              </p>
                              <p className="mt-1 font-black text-yellow-500">
                                {curso.precio || "Ver planes"}
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
                              <div className="grid gap-4 xl:grid-cols-2">
                                {productosCurso.map((producto) => (
                                  <ProductoCard
                                    key={producto.id}
                                    producto={producto}
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
                Paquetes y membresías
              </p>

              <h2 className="mt-3 text-4xl font-black md:text-5xl">
                Opciones especiales SERVICAN
              </h2>

              <p className="mt-4 max-w-3xl leading-8 text-zinc-400">
                Además de planes por curso, SERVICAN ofrece paquetes de varios
                cursos y membresía mensual con contenido exclusivo y beneficios.
              </p>
            </div>
          </div>

          {paquetes.length === 0 && membresias.length === 0 && (
            <div className="rounded-[2rem] border border-white/10 bg-black p-8 text-center">
              <h3 className="text-3xl font-black">
                Todavía no hay paquetes visibles
              </h3>

              <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-400">
                Cuando actives paquetes o membresías visibles desde el panel
                admin, aparecerán en esta sección.
              </p>
            </div>
          )}

          {(paquetes.length > 0 || membresias.length > 0) && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[...paquetes, ...membresias].map((producto) => (
                <ProductoCard key={producto.id} producto={producto} />
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
              Cómo se habilita un curso o membresía
            </h2>

            <p className="mt-4 leading-8 text-zinc-300">
              El flujo está pensado para que la compra sea clara y el acceso se
              habilite automáticamente cuando Mercado Pago confirma el pago.
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
              registro, la compra, el acceso privado, la membresía y los
              certificados.
            </p>

            <div className="mt-8 rounded-[2rem] border border-yellow-500/25 bg-yellow-500/10 p-6">
              <h3 className="text-2xl font-black text-yellow-400">
                Importante
              </h3>

              <p className="mt-3 leading-7 text-yellow-100">
                Para comprar necesitás iniciar sesión. En planes grupales, todos
                los participantes deben tener una cuenta registrada antes de la
                compra. La membresía se activa solo cuando Mercado Pago confirma
                el pago.
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
            ¿No sabés qué curso elegir?
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

          <Link href="/verificar-certificado" className="hover:text-yellow-500">
            Verificar certificado
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