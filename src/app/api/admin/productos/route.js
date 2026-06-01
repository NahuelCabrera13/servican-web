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

function limpiarNumero(valor, fallback = 0) {
  const numero = Number(valor);

  if (Number.isNaN(numero)) {
    return fallback;
  }

  return numero;
}

function limpiarBooleano(valor) {
  return Boolean(valor);
}

function limpiarArray(valor) {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor.filter((item) => item !== null && item !== undefined);
}

async function sincronizarCursosDelProducto({
  supabase,
  productoId,
  cursoIds,
  nivelAcceso,
  beneficiosPro,
}) {
  const cursosLimpios = limpiarArray(cursoIds);

  if (!cursosLimpios.length) {
    return;
  }

  await supabase.from("producto_cursos").delete().eq("producto_id", productoId);

  const filas = cursosLimpios.map((cursoId, index) => ({
    producto_id: productoId,
    curso_id: cursoId,
    nivel_acceso: nivelAcceso || "basico",
    beneficios_pro: Boolean(beneficiosPro),
    orden: index,
  }));

  const { error } = await supabase.from("producto_cursos").insert(filas);

  if (error) {
    console.error("Error sincronizando producto_cursos:", error);
    throw new Error("No se pudieron asociar los cursos al producto.");
  }
}

export async function GET(request) {
  const verificacion = await verificarAdmin(request);

  if (!verificacion.ok) {
    return NextResponse.json(
      { error: verificacion.error },
      { status: verificacion.status }
    );
  }

  const { supabase } = verificacion;

  const { searchParams } = new URL(request.url);

  const tipo = searchParams.get("tipo");
  const cursoId = searchParams.get("cursoId");
  const soloActivos = searchParams.get("activos") === "true";

  let query = supabase
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
    .order("orden", { ascending: true })
    .order("created_at", { ascending: false });

  if (tipo) {
    query = query.eq("tipo_producto", tipo);
  }

  if (cursoId) {
    query = query.eq("curso_id", cursoId);
  }

  if (soloActivos) {
    query = query.eq("activo", true).eq("visible_en_web", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error obteniendo productos:", error);

    return NextResponse.json(
      { error: "No se pudieron cargar los productos." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    productos: data || [],
  });
}

export async function POST(request) {
  const verificacion = await verificarAdmin(request);

  if (!verificacion.ok) {
    return NextResponse.json(
      { error: verificacion.error },
      { status: verificacion.status }
    );
  }

  const { supabase } = verificacion;

  try {
    const body = await request.json();

    const nombre = String(body.nombre || "").trim();

    if (!nombre) {
      return NextResponse.json(
        { error: "El producto necesita un nombre." },
        { status: 400 }
      );
    }

    const slug = crearSlug(body.slug || nombre);

    if (!slug) {
      return NextResponse.json(
        { error: "No se pudo generar el slug del producto." },
        { status: 400 }
      );
    }

    const tipoProducto = body.tipo_producto || "curso_plan";
    const plan = body.plan || null;
    const cursoId = body.curso_id || null;

    const precio = limpiarNumero(body.precio, 0);
    const moneda = body.moneda || "UYU";

    const cantidadMaximaUsuarios = limpiarNumero(
      body.cantidad_maxima_usuarios,
      1
    );

    const requiereParticipantes = limpiarBooleano(
      body.requiere_participantes
    );

    const requiereCorreosRegistrados =
      body.requiere_correos_registrados === undefined
        ? true
        : limpiarBooleano(body.requiere_correos_registrados);

    const esRecurrente = limpiarBooleano(body.es_recurrente);
    const activo = limpiarBooleano(body.activo);
    const visibleEnWeb = limpiarBooleano(body.visible_en_web);
    const destacado = limpiarBooleano(body.destacado);

    const beneficios = body.beneficios || {};
    const contenidoIncluido = body.contenido_incluido || {};

    const { data: producto, error } = await supabase
      .from("productos")
      .insert([
        {
          nombre,
          slug,
          descripcion: body.descripcion || "",
          tipo_producto: tipoProducto,
          plan,
          curso_id: cursoId,
          precio,
          moneda,
          cantidad_maxima_usuarios: cantidadMaximaUsuarios,
          requiere_participantes: requiereParticipantes,
          requiere_correos_registrados: requiereCorreosRegistrados,
          es_recurrente: esRecurrente,
          activo,
          visible_en_web: visibleEnWeb,
          destacado,
          editable_desde_admin: true,
          origen: "admin",
          orden: limpiarNumero(body.orden, 0),
          texto_boton: body.texto_boton || "Comprar",
          beneficios,
          contenido_incluido: contenidoIncluido,
        },
      ])
      .select("*")
      .single();

    if (error) {
      console.error("Error creando producto:", error);

      return NextResponse.json(
        { error: "No se pudo crear el producto." },
        { status: 500 }
      );
    }

    const cursoIds = limpiarArray(body.curso_ids);

    if (cursoIds.length) {
      await sincronizarCursosDelProducto({
        supabase,
        productoId: producto.id,
        cursoIds,
        nivelAcceso: body.nivel_acceso || plan || "basico",
        beneficiosPro: body.beneficios_pro || plan === "pro" || plan === "plantel",
      });
    } else if (cursoId) {
      await sincronizarCursosDelProducto({
        supabase,
        productoId: producto.id,
        cursoIds: [cursoId],
        nivelAcceso: body.nivel_acceso || plan || "basico",
        beneficiosPro: body.beneficios_pro || plan === "pro" || plan === "plantel",
      });
    }

    return NextResponse.json({
      producto,
    });
  } catch (error) {
    console.error("Error interno creando producto:", error);

    return NextResponse.json(
      { error: error?.message || "Error interno creando producto." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  const verificacion = await verificarAdmin(request);

  if (!verificacion.ok) {
    return NextResponse.json(
      { error: verificacion.error },
      { status: verificacion.status }
    );
  }

  const { supabase } = verificacion;

  try {
    const body = await request.json();

    const id = body.id;

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID del producto." },
        { status: 400 }
      );
    }

    const actualizacion = {
      updated_at: new Date().toISOString(),
    };

    if (body.nombre !== undefined) {
      actualizacion.nombre = String(body.nombre || "").trim();
    }

    if (body.slug !== undefined) {
      actualizacion.slug = crearSlug(body.slug);
    }

    if (body.descripcion !== undefined) {
      actualizacion.descripcion = body.descripcion || "";
    }

    if (body.tipo_producto !== undefined) {
      actualizacion.tipo_producto = body.tipo_producto;
    }

    if (body.plan !== undefined) {
      actualizacion.plan = body.plan || null;
    }

    if (body.curso_id !== undefined) {
      actualizacion.curso_id = body.curso_id || null;
    }

    if (body.precio !== undefined) {
      actualizacion.precio = limpiarNumero(body.precio, 0);
    }

    if (body.moneda !== undefined) {
      actualizacion.moneda = body.moneda || "UYU";
    }

    if (body.cantidad_maxima_usuarios !== undefined) {
      actualizacion.cantidad_maxima_usuarios = limpiarNumero(
        body.cantidad_maxima_usuarios,
        1
      );
    }

    if (body.requiere_participantes !== undefined) {
      actualizacion.requiere_participantes = limpiarBooleano(
        body.requiere_participantes
      );
    }

    if (body.requiere_correos_registrados !== undefined) {
      actualizacion.requiere_correos_registrados = limpiarBooleano(
        body.requiere_correos_registrados
      );
    }

    if (body.es_recurrente !== undefined) {
      actualizacion.es_recurrente = limpiarBooleano(body.es_recurrente);
    }

    if (body.activo !== undefined) {
      actualizacion.activo = limpiarBooleano(body.activo);
    }

    if (body.visible_en_web !== undefined) {
      actualizacion.visible_en_web = limpiarBooleano(body.visible_en_web);
    }

    if (body.destacado !== undefined) {
      actualizacion.destacado = limpiarBooleano(body.destacado);
    }

    if (body.orden !== undefined) {
      actualizacion.orden = limpiarNumero(body.orden, 0);
    }

    if (body.texto_boton !== undefined) {
      actualizacion.texto_boton = body.texto_boton || "Comprar";
    }

    if (body.beneficios !== undefined) {
      actualizacion.beneficios = body.beneficios || {};
    }

    if (body.contenido_incluido !== undefined) {
      actualizacion.contenido_incluido = body.contenido_incluido || {};
    }

    const { data: producto, error } = await supabase
      .from("productos")
      .update(actualizacion)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Error actualizando producto:", error);

      return NextResponse.json(
        { error: "No se pudo actualizar el producto." },
        { status: 500 }
      );
    }

    if (body.curso_ids !== undefined) {
      await sincronizarCursosDelProducto({
        supabase,
        productoId: id,
        cursoIds: body.curso_ids,
        nivelAcceso: body.nivel_acceso || producto.plan || "basico",
        beneficiosPro:
          body.beneficios_pro ||
          producto.plan === "pro" ||
          producto.plan === "plantel",
      });
    }

    return NextResponse.json({
      producto,
    });
  } catch (error) {
    console.error("Error interno actualizando producto:", error);

    return NextResponse.json(
      { error: error?.message || "Error interno actualizando producto." },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const verificacion = await verificarAdmin(request);

  if (!verificacion.ok) {
    return NextResponse.json(
      { error: verificacion.error },
      { status: verificacion.status }
    );
  }

  const { supabase } = verificacion;

  try {
    const body = await request.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID del producto." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("productos").delete().eq("id", id);

    if (error) {
      console.error("Error eliminando producto:", error);

      return NextResponse.json(
        { error: "No se pudo eliminar el producto." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Error interno eliminando producto:", error);

    return NextResponse.json(
      { error: "Error interno eliminando producto." },
      { status: 500 }
    );
  }
}