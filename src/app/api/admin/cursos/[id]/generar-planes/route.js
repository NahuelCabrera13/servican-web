import { NextResponse } from "next/server";
import { verificarAdmin } from "@/lib/admin/verificarAdmin";

export const dynamic = "force-dynamic";

function crearSlug(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validarCursoId(valor) {
  const numero = Number(valor);

  if (!Number.isInteger(numero) || numero <= 0) {
    return null;
  }

  return numero;
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

function obtenerConfiguracionPlanes(curso) {
  const k9 = esCursoK9(curso);

  if (k9) {
    return [
      {
        plan: "basico",
        nombre: `${curso.titulo} - Plan Básico`,
        precio: 349,
        descripcion:
          "Plan básico del curso K9 con PDF completo, videos explicativos, demostraciones básicas de búsqueda y detección, asociación de olor inicial, búsqueda sistemática introductoria, marcación pasiva y activa, ejercicios iniciales y certificado simple de participación.",
        cantidad_maxima_usuarios: 1,
        requiere_participantes: false,
        destacado: false,
        orden: 1,
        texto_boton: "Comprar Plan Básico",
        nivel_acceso: "basico",
        beneficios_pro: false,
        beneficios: [
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
        ],
      },
      {
        plan: "pro",
        nombre: `${curso.titulo} - Plan Pro`,
        precio: 899,
        descripcion:
          "Plan pro del curso K9 con desarrollo profundo, videos demostrativos completos, progresión de entrenamiento, asociación y fijación de olor, búsqueda sistemática, lectura del perro, manejo del guía, evaluación, corrección personalizada, soporte prioritario y certificado profesional SERVICAN.",
        cantidad_maxima_usuarios: 1,
        requiere_participantes: false,
        destacado: true,
        orden: 2,
        texto_boton: "Comprar Plan Pro",
        nivel_acceso: "pro",
        beneficios_pro: true,
        beneficios: [
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
        ],
      },
      {
        plan: "plantel",
        nombre: `${curso.titulo} - Plan Plantel`,
        precio: 1999,
        descripcion:
          "Plan plantel K9 para hasta 4 cuentas individuales. Incluye todo el Plan Pro K9, certificados individuales, evaluación y seguimiento por participante según condiciones, correos autorizados y soporte grupal.",
        cantidad_maxima_usuarios: 4,
        requiere_participantes: true,
        destacado: false,
        orden: 3,
        texto_boton: "Comprar Plan Plantel",
        nivel_acceso: "plantel",
        beneficios_pro: true,
        beneficios: [
          "Acceso para hasta 4 cuentas individuales.",
          "Todo lo incluido en el Plan Pro K9.",
          "Certificado individual para cada participante.",
          "Evaluación y seguimiento por participante según condiciones del plan.",
          "El comprador carga los correos autorizados.",
          "Todos los participantes deben estar registrados previamente.",
          "Soporte grupal para el plantel.",
        ],
      },
    ];
  }

  return [
    {
      plan: "basico",
      nombre: `${curso.titulo} - Plan Básico`,
      precio: 149,
      descripcion:
        "Plan básico de la formación inicial con acceso al curso online, PDF completo, videos explicativos, demostraciones básicas, historia y rol del guía canino, conducta, aprendizaje, refuerzos, comunicación, obediencia inicial, ejercicios por módulo y certificado simple de participación.",
      cantidad_maxima_usuarios: 1,
      requiere_participantes: false,
      destacado: false,
      orden: 1,
      texto_boton: "Comprar Plan Básico",
      nivel_acceso: "basico",
      beneficios_pro: false,
      beneficios: [
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
      ],
    },
    {
      plan: "pro",
      nombre: `${curso.titulo} - Plan Pro`,
      precio: 399,
      descripcion:
        "Plan pro de la formación inicial con todo lo incluido en Básico, videos demostrativos ampliados, evaluaciones, revisión de ejercicios, soporte prioritario, casos prácticos, corrección de errores frecuentes, actualizaciones y certificado de aprobación profesional SERVICAN.",
      cantidad_maxima_usuarios: 1,
      requiere_participantes: false,
      destacado: true,
      orden: 2,
      texto_boton: "Comprar Plan Pro",
      nivel_acceso: "pro",
      beneficios_pro: true,
      beneficios: [
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
      ],
    },
    {
      plan: "plantel",
      nombre: `${curso.titulo} - Plan Plantel`,
      precio: 899,
      descripcion:
        "Plan plantel de la formación inicial para hasta 4 cuentas individuales. Incluye todo el Plan Pro, certificados individuales, carga de correos autorizados, participantes registrados previamente y soporte grupal.",
      cantidad_maxima_usuarios: 4,
      requiere_participantes: true,
      destacado: false,
      orden: 3,
      texto_boton: "Comprar Plan Plantel",
      nivel_acceso: "plantel",
      beneficios_pro: true,
      beneficios: [
        "Acceso para hasta 4 cuentas individuales.",
        "Todo lo incluido en el Plan Pro.",
        "Certificado individual para cada participante.",
        "El comprador carga los correos autorizados.",
        "Todos los participantes deben estar registrados previamente.",
        "Soporte grupal.",
      ],
    },
  ];
}

function prepararProductoCurso(curso, config) {
  const slug = crearSlug(`${curso.slug || curso.titulo}-${config.plan}`);

  return {
    nombre: config.nombre,
    slug,
    descripcion: config.descripcion,
    tipo_producto: "curso_plan",
    plan: config.plan,
    curso_id: curso.id,
    precio: config.precio,
    moneda: "USD",
    cantidad_maxima_usuarios: config.cantidad_maxima_usuarios,
    requiere_participantes: config.requiere_participantes,
    requiere_correos_registrados: true,
    es_recurrente: false,
    activo: true,
    visible_en_web: true,
    destacado: config.destacado,
    editable_desde_admin: true,
    origen: "generador_admin",
    orden: config.orden,
    texto_boton: config.texto_boton,
    beneficios: config.beneficios,
    contenido_incluido: {
      curso_id: curso.id,
      curso_titulo: curso.titulo,
      nivel_acceso: config.nivel_acceso,
      beneficios_pro: config.beneficios_pro,
      generado_desde: "api_admin_generar_planes",
    },
    updated_at: new Date().toISOString(),
  };
}

async function buscarProductoExistente(supabase, slug) {
  const { data, error } = await supabase
    .from("productos")
    .select("id, precio, activo, visible_en_web")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo verificar el producto ${slug}.`);
  }

  return data || null;
}

async function crearOActualizarProducto({ supabase, curso, config }) {
  const productoPreparado = prepararProductoCurso(curso, config);
  const existente = await buscarProductoExistente(supabase, productoPreparado.slug);

  if (existente?.id) {
    const { data, error } = await supabase
      .from("productos")
      .update(productoPreparado)
      .eq("id", existente.id)
      .select("*")
      .single();

    if (error || !data) {
      console.error("Error actualizando producto:", error);
      throw new Error(`No se pudo actualizar el producto ${config.nombre}.`);
    }

    await sincronizarProductoCurso({
      supabase,
      productoId: data.id,
      cursoId: curso.id,
      nivelAcceso: config.nivel_acceso,
      beneficiosPro: config.beneficios_pro,
      orden: config.orden,
    });

    return data;
  }

  const { data, error } = await supabase
    .from("productos")
    .insert(productoPreparado)
    .select("*")
    .single();

  if (error || !data) {
    console.error("Error creando producto:", error);
    throw new Error(`No se pudo crear el producto ${config.nombre}.`);
  }

  await sincronizarProductoCurso({
    supabase,
    productoId: data.id,
    cursoId: curso.id,
    nivelAcceso: config.nivel_acceso,
    beneficiosPro: config.beneficios_pro,
    orden: config.orden,
  });

  return data;
}

async function sincronizarProductoCurso({
  supabase,
  productoId,
  cursoId,
  nivelAcceso,
  beneficiosPro,
  orden,
}) {
  await supabase
    .from("producto_cursos")
    .delete()
    .eq("producto_id", productoId)
    .eq("curso_id", cursoId);

  const { error } = await supabase.from("producto_cursos").insert({
    producto_id: productoId,
    curso_id: cursoId,
    nivel_acceso: nivelAcceso,
    beneficios_pro: Boolean(beneficiosPro),
    orden,
  });

  if (error) {
    console.error("Error sincronizando producto_cursos:", error);
    throw new Error("No se pudo asociar el producto al curso.");
  }
}

async function desactivarPlanExtenso(supabase, cursoId) {
  const { error } = await supabase
    .from("productos")
    .update({
      activo: false,
      visible_en_web: false,
      destacado: false,
      updated_at: new Date().toISOString(),
    })
    .eq("curso_id", cursoId)
    .eq("plan", "extenso");

  if (error) {
    console.error("Error desactivando Plan Extenso:", error);
    throw new Error("No se pudo desactivar el Plan Extenso.");
  }
}

async function cargarProductosDelCurso(supabase, cursoId) {
  const { data, error } = await supabase
    .from("productos")
    .select(
      `
      *,
      producto_cursos (
        id,
        curso_id,
        nivel_acceso,
        beneficios_pro,
        orden
      )
    `
    )
    .eq("curso_id", cursoId)
    .neq("plan", "extenso")
    .order("orden", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error cargando productos generados:", error);
    throw new Error("Los planes se generaron, pero no se pudieron volver a cargar.");
  }

  return data || [];
}

export async function POST(request, { params }) {
  const verificacion = await verificarAdmin(request);

  if (!verificacion.ok) {
    return NextResponse.json(
      { ok: false, error: verificacion.error },
      { status: verificacion.status }
    );
  }

  const { supabase } = verificacion;

  try {
    const parametros = await params;
    const cursoId = validarCursoId(parametros?.id);

    if (!cursoId) {
      return NextResponse.json(
        { ok: false, error: "ID de curso inválido." },
        { status: 400 }
      );
    }

    const { data: curso, error: errorCurso } = await supabase
      .from("cursos")
      .select("*")
      .eq("id", cursoId)
      .maybeSingle();

    if (errorCurso || !curso) {
      return NextResponse.json(
        { ok: false, error: "Curso no encontrado." },
        { status: 404 }
      );
    }

    await desactivarPlanExtenso(supabase, cursoId);

    const configuraciones = obtenerConfiguracionPlanes(curso);
    const productosGenerados = [];

    for (const config of configuraciones) {
      const producto = await crearOActualizarProducto({
        supabase,
        curso,
        config,
      });

      productosGenerados.push(producto);
    }

    const productos = await cargarProductosDelCurso(supabase, cursoId);

    return NextResponse.json({
      ok: true,
      curso,
      productos,
      productos_generados: productosGenerados,
      mensaje:
        "Planes actualizados correctamente. Se generaron Básico, Pro y Plantel, y se desactivó el Plan Extenso.",
    });
  } catch (error) {
    console.error("Error interno generando planes:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Error interno generando planes del curso.",
      },
      { status: 500 }
    );
  }
}