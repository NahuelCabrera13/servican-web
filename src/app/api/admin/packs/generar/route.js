import { NextResponse } from "next/server";
import { verificarAdmin } from "@/lib/admin/verificarAdmin";

export const dynamic = "force-dynamic";

function crearRespuestaError(mensaje, status = 500) {
  return NextResponse.json(
    {
      ok: false,
      error: mensaje,
    },
    { status }
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

async function obtenerCursosPrincipales(supabase) {
  const { data: cursos, error } = await supabase
    .from("cursos")
    .select("id, titulo, slug, activo")
    .eq("activo", true)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error cargando cursos para packs:", error);
    throw new Error("No se pudieron cargar los cursos activos.");
  }

  const cursoK9 = (cursos || []).find((curso) => esCursoK9(curso));
  const cursoInicial = (cursos || []).find((curso) => !esCursoK9(curso));

  if (!cursoInicial || !cursoK9) {
    throw new Error(
      "No se encontraron los dos cursos activos necesarios: curso inicial y curso K9."
    );
  }

  return {
    cursoInicial,
    cursoK9,
  };
}

function obtenerConfiguracionPacks({ cursoInicial, cursoK9 }) {
  return [
    {
      nombre: "Pack Básico 2 cursos",
      slug: "pack-basico-2-cursos",
      descripcion:
        "Incluye Formación inicial Básico + K9 Básico, PDFs, videos principales y certificados simples. Entrada completa al sistema SERVICAN con precio menor a comprar ambos por separado.",
      tipo_producto: "paquete",
      plan: "basico",
      precio: 449,
      moneda: "USD",
      cantidad_maxima_usuarios: 1,
      requiere_participantes: false,
      requiere_correos_registrados: true,
      es_recurrente: false,
      activo: true,
      visible_en_web: true,
      destacado: false,
      orden: 10,
      texto_boton: "Comprar Pack Básico",
      nivel_acceso: "basico",
      beneficios_pro: false,
      cursos: [
        {
          curso_id: cursoInicial.id,
          nivel_acceso: "basico",
          beneficios_pro: false,
          orden: 1,
        },
        {
          curso_id: cursoK9.id,
          nivel_acceso: "basico",
          beneficios_pro: false,
          orden: 2,
        },
      ],
      beneficios: [
        "Formación inicial para guías caninos - Plan Básico.",
        "Formación de guías para canes detectores K9 - Plan Básico.",
        "PDFs completos de ambos cursos.",
        "Videos explicativos principales.",
        "Videos demostrativos básicos.",
        "Ejercicios iniciales de ambos cursos.",
        "Certificados simples de participación.",
        "Acceso privado desde el panel del alumno.",
      ],
      contenido_incluido: {
        tipo: "pack",
        cursos_incluidos: [
          {
            curso_id: cursoInicial.id,
            curso_titulo: cursoInicial.titulo,
            nivel_acceso: "basico",
          },
          {
            curso_id: cursoK9.id,
            curso_titulo: cursoK9.titulo,
            nivel_acceso: "basico",
          },
        ],
      },
    },
    {
      nombre: "Pack Pro 2 cursos",
      slug: "pack-pro-2-cursos",
      descripcion:
        "Incluye Formación inicial Pro + K9 Pro, videos completos, ejercicios, evaluaciones, certificados profesionales y soporte prioritario. Es la opción recomendada de mayor valor.",
      tipo_producto: "paquete",
      plan: "pro",
      precio: 1149,
      moneda: "USD",
      cantidad_maxima_usuarios: 1,
      requiere_participantes: false,
      requiere_correos_registrados: true,
      es_recurrente: false,
      activo: true,
      visible_en_web: true,
      destacado: true,
      orden: 11,
      texto_boton: "Comprar Pack Pro",
      nivel_acceso: "pro",
      beneficios_pro: true,
      cursos: [
        {
          curso_id: cursoInicial.id,
          nivel_acceso: "pro",
          beneficios_pro: true,
          orden: 1,
        },
        {
          curso_id: cursoK9.id,
          nivel_acceso: "pro",
          beneficios_pro: true,
          orden: 2,
        },
      ],
      beneficios: [
        "Formación inicial para guías caninos - Plan Pro.",
        "Formación de guías para canes detectores K9 - Plan Pro.",
        "PDFs completos de ambos cursos.",
        "Videos explicativos y demostrativos completos.",
        "Ejercicios y progresiones ampliadas.",
        "Evaluaciones simples o tareas por módulo.",
        "Evaluación final teórica y/o práctica.",
        "Revisión de ejercicios o evidencia enviada por el alumno.",
        "Corrección personalizada según condiciones del plan.",
        "Soporte prioritario durante el curso.",
        "Certificados profesionales SERVICAN.",
        "Ahorro frente a comprar ambos planes Pro por separado.",
      ],
      contenido_incluido: {
        tipo: "pack",
        cursos_incluidos: [
          {
            curso_id: cursoInicial.id,
            curso_titulo: cursoInicial.titulo,
            nivel_acceso: "pro",
          },
          {
            curso_id: cursoK9.id,
            curso_titulo: cursoK9.titulo,
            nivel_acceso: "pro",
          },
        ],
      },
    },
  ];
}

async function buscarProductoPorSlug(supabase, slug) {
  const { data, error } = await supabase
    .from("productos")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error buscando pack por slug:", error);
    throw new Error(`No se pudo verificar si ya existe el pack ${slug}.`);
  }

  return data || null;
}

async function sincronizarCursosDelPack({ supabase, productoId, cursos }) {
  const { error: errorDelete } = await supabase
    .from("producto_cursos")
    .delete()
    .eq("producto_id", productoId);

  if (errorDelete) {
    console.error("Error limpiando producto_cursos del pack:", errorDelete);
    throw new Error("No se pudieron limpiar los cursos asociados al pack.");
  }

  const filas = cursos.map((curso) => ({
    producto_id: productoId,
    curso_id: curso.curso_id,
    nivel_acceso: curso.nivel_acceso,
    beneficios_pro: Boolean(curso.beneficios_pro),
    orden: curso.orden,
  }));

  const { error: errorInsert } = await supabase
    .from("producto_cursos")
    .insert(filas);

  if (errorInsert) {
    console.error("Error insertando producto_cursos del pack:", errorInsert);
    throw new Error("No se pudieron asociar los cursos al pack.");
  }
}

async function crearOActualizarPack({ supabase, config }) {
  const existente = await buscarProductoPorSlug(supabase, config.slug);

  const producto = {
    nombre: config.nombre,
    slug: config.slug,
    descripcion: config.descripcion,
    tipo_producto: config.tipo_producto,
    plan: config.plan,
    curso_id: null,
    precio: config.precio,
    moneda: config.moneda,
    cantidad_maxima_usuarios: config.cantidad_maxima_usuarios,
    requiere_participantes: config.requiere_participantes,
    requiere_correos_registrados: config.requiere_correos_registrados,
    es_recurrente: config.es_recurrente,
    activo: config.activo,
    visible_en_web: config.visible_en_web,
    destacado: config.destacado,
    editable_desde_admin: true,
    origen: "generador_admin_packs",
    orden: config.orden,
    texto_boton: config.texto_boton,
    beneficios: config.beneficios,
    contenido_incluido: config.contenido_incluido,
    updated_at: new Date().toISOString(),
  };

  let data = null;
  let error = null;

  if (existente?.id) {
    const respuesta = await supabase
      .from("productos")
      .update(producto)
      .eq("id", existente.id)
      .select("*")
      .single();

    data = respuesta.data;
    error = respuesta.error;
  } else {
    const respuesta = await supabase
      .from("productos")
      .insert(producto)
      .select("*")
      .single();

    data = respuesta.data;
    error = respuesta.error;
  }

  if (error || !data) {
    console.error("Error creando o actualizando pack:", error);
    throw new Error(`No se pudo guardar el ${config.nombre}.`);
  }

  await sincronizarCursosDelPack({
    supabase,
    productoId: data.id,
    cursos: config.cursos,
  });

  return data;
}

async function cargarPacksGenerados(supabase) {
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
    .eq("tipo_producto", "paquete")
    .in("slug", ["pack-basico-2-cursos", "pack-pro-2-cursos"])
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error cargando packs generados:", error);
    throw new Error("Los packs se generaron, pero no se pudieron volver a cargar.");
  }

  return data || [];
}

export async function POST(request) {
  const verificacion = await verificarAdmin(request);

  if (!verificacion.ok) {
    return crearRespuestaError(verificacion.error, verificacion.status);
  }

  const { supabase } = verificacion;

  try {
    const { cursoInicial, cursoK9 } = await obtenerCursosPrincipales(supabase);

    const configuraciones = obtenerConfiguracionPacks({
      cursoInicial,
      cursoK9,
    });

    const generados = [];

    for (const config of configuraciones) {
      const pack = await crearOActualizarPack({
        supabase,
        config,
      });

      generados.push(pack);
    }

    const packs = await cargarPacksGenerados(supabase);

    return NextResponse.json({
      ok: true,
      mensaje: "Packs Básico y Pro generados correctamente.",
      cursos: {
        inicial: cursoInicial,
        k9: cursoK9,
      },
      generados,
      packs,
    });
  } catch (error) {
    console.error("Error interno generando packs:", error);

    return crearRespuestaError(
      error?.message || "Error interno generando packs.",
      500
    );
  }
}

export async function GET(request) {
  const verificacion = await verificarAdmin(request);

  if (!verificacion.ok) {
    return crearRespuestaError(verificacion.error, verificacion.status);
  }

  const { supabase } = verificacion;

  try {
    const packs = await cargarPacksGenerados(supabase);

    return NextResponse.json({
      ok: true,
      packs,
    });
  } catch (error) {
    console.error("Error interno cargando packs:", error);

    return crearRespuestaError(
      error?.message || "Error interno cargando packs.",
      500
    );
  }
}