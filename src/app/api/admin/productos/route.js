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

function crearRespuestaError(mensaje, status = 500) {
  return NextResponse.json(
    {
      ok: false,
      error: mensaje,
    },
    { status }
  );
}

function validarIdProducto(id) {
  const texto = String(id || "").trim();

  if (!texto) {
    return null;
  }

  if (texto.length > 120) {
    return null;
  }

  return texto;
}

function validarIdCurso(id) {
  const numero = Number(id);

  if (!Number.isInteger(numero) || numero <= 0) {
    return null;
  }

  return numero;
}

function obtenerIdProductoDesdeBody(body) {
  return validarIdProducto(
    body?.id ||
      body?.producto_id ||
      body?.productoId ||
      body?.plan_id ||
      body?.planId ||
      body?.producto?.id ||
      body?.plan?.id
  );
}

async function sincronizarCursosDelProducto({
  supabase,
  productoId,
  cursoIds,
  nivelAcceso,
  beneficiosPro,
}) {
  const idProducto = validarIdProducto(productoId);
  const cursosLimpios = limpiarArray(cursoIds)
    .map((cursoId) => validarIdCurso(cursoId))
    .filter(Boolean);

  if (!idProducto) {
    throw new Error("ID de producto inválido.");
  }

  await supabase.from("producto_cursos").delete().eq("producto_id", idProducto);

  if (!cursosLimpios.length) {
    return;
  }

  const filas = cursosLimpios.map((cursoId, index) => ({
    producto_id: idProducto,
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

async function verificarSlugDisponible({
  supabase,
  slug,
  productoIdIgnorar = null,
}) {
  let query = supabase.from("productos").select("id").eq("slug", slug);

  if (productoIdIgnorar) {
    query = query.neq("id", productoIdIgnorar);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("Error verificando slug de producto:", error);
    throw new Error("No se pudo verificar el slug del producto.");
  }

  return !data;
}

export async function GET(request) {
  const verificacion = await verificarAdmin(request);

  if (!verificacion.ok) {
    return crearRespuestaError(verificacion.error, verificacion.status);
  }

  const { supabase } = verificacion;

  try {
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
      const cursoIdValido = validarIdCurso(cursoId);

      if (!cursoIdValido) {
        return crearRespuestaError("ID de curso inválido.", 400);
      }

      query = query.eq("curso_id", cursoIdValido);
    }

    if (soloActivos) {
      query = query.eq("activo", true).eq("visible_en_web", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error obteniendo productos:", error);

      return crearRespuestaError("No se pudieron cargar los productos.", 500);
    }

    return NextResponse.json({
      ok: true,
      productos: data || [],
    });
  } catch (error) {
    console.error("Error interno GET /api/admin/productos:", error);

    return crearRespuestaError(
      error?.message || "Error interno cargando productos.",
      500
    );
  }
}

export async function POST(request) {
  const verificacion = await verificarAdmin(request);

  if (!verificacion.ok) {
    return crearRespuestaError(verificacion.error, verificacion.status);
  }

  const { supabase } = verificacion;

  try {
    const body = await request.json();

    const nombre = String(body.nombre || "").trim();

    if (!nombre) {
      return crearRespuestaError("El producto necesita un nombre.", 400);
    }

    const slug = crearSlug(body.slug || nombre);

    if (!slug) {
      return crearRespuestaError(
        "No se pudo generar el slug del producto.",
        400
      );
    }

    const slugDisponible = await verificarSlugDisponible({
      supabase,
      slug,
    });

    if (!slugDisponible) {
      return crearRespuestaError(
        "Ya existe un producto con ese slug. Cambiá el nombre o el slug.",
        409
      );
    }

    const tipoProducto = String(body.tipo_producto || "curso_plan").trim();
    const plan = body.plan ? String(body.plan).trim() : null;
    const cursoId = body.curso_id ? validarIdCurso(body.curso_id) : null;

    if (body.curso_id && !cursoId) {
      return crearRespuestaError("ID de curso inválido.", 400);
    }

    const precio = limpiarNumero(body.precio, 0);

    if (precio < 0) {
      return crearRespuestaError("El precio no puede ser negativo.", 400);
    }

    const moneda = String(body.moneda || "UYU").trim().toUpperCase();

    const cantidadMaximaUsuarios = limpiarNumero(
      body.cantidad_maxima_usuarios,
      1
    );

    if (cantidadMaximaUsuarios < 1) {
      return crearRespuestaError(
        "La cantidad máxima de usuarios debe ser al menos 1.",
        400
      );
    }

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

    const beneficios =
      body.beneficios && typeof body.beneficios === "object"
        ? body.beneficios
        : {};

    const contenidoIncluido =
      body.contenido_incluido && typeof body.contenido_incluido === "object"
        ? body.contenido_incluido
        : {};

    const { data: producto, error } = await supabase
      .from("productos")
      .insert([
        {
          nombre,
          slug,
          descripcion: String(body.descripcion || "").trim(),
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
          texto_boton: String(body.texto_boton || "Comprar").trim(),
          beneficios,
          contenido_incluido: contenidoIncluido,
        },
      ])
      .select("*")
      .single();

    if (error || !producto) {
      console.error("Error creando producto:", error);

      return crearRespuestaError("No se pudo crear el producto.", 500);
    }

    const cursoIds = limpiarArray(body.curso_ids);

    if (cursoIds.length) {
      await sincronizarCursosDelProducto({
        supabase,
        productoId: producto.id,
        cursoIds,
        nivelAcceso: body.nivel_acceso || plan || "basico",
        beneficiosPro:
          body.beneficios_pro || plan === "pro" || plan === "plantel",
      });
    } else if (cursoId) {
      await sincronizarCursosDelProducto({
        supabase,
        productoId: producto.id,
        cursoIds: [cursoId],
        nivelAcceso: body.nivel_acceso || plan || "basico",
        beneficiosPro:
          body.beneficios_pro || plan === "pro" || plan === "plantel",
      });
    }

    return NextResponse.json({
      ok: true,
      producto,
    });
  } catch (error) {
    console.error("Error interno creando producto:", error);

    return crearRespuestaError(
      error?.message || "Error interno creando producto.",
      500
    );
  }
}

export async function PATCH(request) {
  const verificacion = await verificarAdmin(request);

  if (!verificacion.ok) {
    return crearRespuestaError(verificacion.error, verificacion.status);
  }

  const { supabase } = verificacion;

  try {
    const body = await request.json();

    const id = obtenerIdProductoDesdeBody(body);

    if (!id) {
      console.error("PATCH /api/admin/productos sin ID válido:", body);

      return crearRespuestaError(
        "Falta el ID del producto. No se pudo identificar qué plan actualizar.",
        400
      );
    }

    const { data: productoExiste, error: errorExiste } = await supabase
      .from("productos")
      .select("id, plan")
      .eq("id", id)
      .maybeSingle();

    if (errorExiste) {
      console.error("Error verificando producto:", errorExiste);

      return crearRespuestaError("No se pudo verificar el producto.", 500);
    }

    if (!productoExiste) {
      return crearRespuestaError("No se encontró el producto.", 404);
    }

    const actualizacion = {
      updated_at: new Date().toISOString(),
    };

    if (body.nombre !== undefined) {
      const nombreLimpio = String(body.nombre || "").trim();

      if (!nombreLimpio) {
        return crearRespuestaError("El producto necesita un nombre.", 400);
      }

      actualizacion.nombre = nombreLimpio;
    }

    if (body.slug !== undefined) {
      const slugLimpio = crearSlug(body.slug);

      if (!slugLimpio) {
        return crearRespuestaError(
          "No se pudo generar el slug del producto.",
          400
        );
      }

      const slugDisponible = await verificarSlugDisponible({
        supabase,
        slug: slugLimpio,
        productoIdIgnorar: id,
      });

      if (!slugDisponible) {
        return crearRespuestaError(
          "Ya existe otro producto con ese slug. Cambiá el nombre o el slug.",
          409
        );
      }

      actualizacion.slug = slugLimpio;
    }

    if (body.descripcion !== undefined) {
      actualizacion.descripcion = String(body.descripcion || "").trim();
    }

    if (body.tipo_producto !== undefined) {
      actualizacion.tipo_producto = String(body.tipo_producto || "").trim();
    }

    if (body.plan !== undefined) {
      actualizacion.plan = body.plan ? String(body.plan).trim() : null;
    }

    if (body.curso_id !== undefined) {
      const cursoId = body.curso_id ? validarIdCurso(body.curso_id) : null;

      if (body.curso_id && !cursoId) {
        return crearRespuestaError("ID de curso inválido.", 400);
      }

      actualizacion.curso_id = cursoId;
    }

    if (body.precio !== undefined) {
      const precio = limpiarNumero(body.precio, 0);

      if (precio < 0) {
        return crearRespuestaError("El precio no puede ser negativo.", 400);
      }

      actualizacion.precio = precio;
    }

    if (body.moneda !== undefined) {
      actualizacion.moneda = String(body.moneda || "UYU").trim().toUpperCase();
    }

    if (body.cantidad_maxima_usuarios !== undefined) {
      const cantidad = limpiarNumero(body.cantidad_maxima_usuarios, 1);

      if (cantidad < 1) {
        return crearRespuestaError(
          "La cantidad máxima de usuarios debe ser al menos 1.",
          400
        );
      }

      actualizacion.cantidad_maxima_usuarios = cantidad;
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
      actualizacion.texto_boton = String(
        body.texto_boton || "Comprar"
      ).trim();
    }

    if (body.beneficios !== undefined) {
      actualizacion.beneficios =
        body.beneficios && typeof body.beneficios === "object"
          ? body.beneficios
          : {};
    }

    if (body.contenido_incluido !== undefined) {
      actualizacion.contenido_incluido =
        body.contenido_incluido &&
        typeof body.contenido_incluido === "object"
          ? body.contenido_incluido
          : {};
    }

    const { data: producto, error } = await supabase
      .from("productos")
      .update(actualizacion)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !producto) {
      console.error("Error actualizando producto:", error);

      return crearRespuestaError("No se pudo actualizar el producto.", 500);
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
      ok: true,
      producto,
    });
  } catch (error) {
    console.error("Error interno actualizando producto:", error);

    return crearRespuestaError(
      error?.message || "Error interno actualizando producto.",
      500
    );
  }
}

export async function DELETE(request) {
  const verificacion = await verificarAdmin(request);

  if (!verificacion.ok) {
    return crearRespuestaError(verificacion.error, verificacion.status);
  }

  const { supabase } = verificacion;

  try {
    const body = await request.json();

    const id = obtenerIdProductoDesdeBody(body);

    if (!id) {
      return crearRespuestaError("Falta el ID del producto.", 400);
    }

    const { data: productoExiste, error: errorExiste } = await supabase
      .from("productos")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (errorExiste) {
      console.error(
        "Error verificando producto antes de eliminar:",
        errorExiste
      );

      return crearRespuestaError("No se pudo verificar el producto.", 500);
    }

    if (!productoExiste) {
      return crearRespuestaError("No se encontró el producto.", 404);
    }

    const { error: errorProductoCursos } = await supabase
      .from("producto_cursos")
      .delete()
      .eq("producto_id", id);

    if (errorProductoCursos) {
      console.error(
        "Error eliminando asociaciones producto_cursos:",
        errorProductoCursos
      );

      return crearRespuestaError(
        "No se pudieron eliminar las asociaciones del producto.",
        500
      );
    }

    const { error } = await supabase.from("productos").delete().eq("id", id);

    if (error) {
      console.error("Error eliminando producto:", error);

      return crearRespuestaError("No se pudo eliminar el producto.", 500);
    }

    return NextResponse.json({
      ok: true,
      id,
    });
  } catch (error) {
    console.error("Error interno eliminando producto:", error);

    return crearRespuestaError("Error interno eliminando producto.", 500);
  }
}