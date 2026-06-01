import { NextResponse } from "next/server";
import { verificarAdmin } from "@/lib/admin/verificarAdmin";

export const dynamic = "force-dynamic";

const CAMPOS_CURSO = `
  id,
  titulo,
  slug,
  descripcion,
  categoria,
  precio,
  duracion,
  modalidad,
  imagen_url,
  activo,
  destacado,
  created_at
`;

function crearRespuestaError(mensaje, status = 500) {
  return NextResponse.json(
    {
      ok: false,
      error: mensaje,
    },
    { status }
  );
}

function validarId(id) {
  const numero = Number(id);

  if (!Number.isInteger(numero) || numero <= 0) {
    return null;
  }

  return numero;
}

function limpiarTexto(valor, maximo = 500) {
  return String(valor || "").trim().slice(0, maximo);
}

function limpiarSlug(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function prepararCurso(curso) {
  const titulo = limpiarTexto(curso?.titulo, 120);
  const slug = limpiarSlug(curso?.slug || titulo);

  if (!titulo) {
    return {
      ok: false,
      error: "El título del curso es obligatorio.",
    };
  }

  if (!slug) {
    return {
      ok: false,
      error: "No se pudo generar el slug del curso.",
    };
  }

  return {
    ok: true,
    curso: {
      titulo,
      slug,
      descripcion: limpiarTexto(curso?.descripcion, 3000),
      categoria: limpiarTexto(curso?.categoria, 100),
      precio: limpiarTexto(curso?.precio, 100),
      duracion: limpiarTexto(curso?.duracion, 100),
      modalidad: limpiarTexto(curso?.modalidad, 100),
      imagen_url: limpiarTexto(curso?.imagen_url, 1000),
      activo: Boolean(curso?.activo),
      destacado: Boolean(curso?.destacado),
    },
  };
}

export async function GET(request) {
  try {
    const admin = await verificarAdmin(request);

    if (!admin.ok) {
      return crearRespuestaError(admin.error, admin.status);
    }

    const supabase = admin.supabase;

    const { data, error } = await supabase
      .from("cursos")
      .select(CAMPOS_CURSO)
      .order("created_at", { ascending: false })
      .limit(300);

    if (error) {
      console.error("Error cargando cursos admin:", error);
      return crearRespuestaError("No se pudieron cargar los cursos.", 500);
    }

    return NextResponse.json({
      ok: true,
      cursos: data || [],
    });
  } catch (error) {
    console.error("Error GET /api/admin/cursos:", error);
    return crearRespuestaError("Error interno del servidor.", 500);
  }
}

export async function PUT(request) {
  try {
    const admin = await verificarAdmin(request);

    if (!admin.ok) {
      return crearRespuestaError(admin.error, admin.status);
    }

    const supabase = admin.supabase;

    const body = await request.json();
    const resultado = prepararCurso(body?.curso);

    if (!resultado.ok) {
      return crearRespuestaError(resultado.error, 400);
    }

    const { data: cursoExistente, error: errorSlug } = await supabase
      .from("cursos")
      .select("id")
      .eq("slug", resultado.curso.slug)
      .maybeSingle();

    if (errorSlug) {
      console.error("Error verificando slug de curso:", errorSlug);
      return crearRespuestaError("No se pudo verificar el slug del curso.", 500);
    }

    if (cursoExistente) {
      return crearRespuestaError(
        "Ya existe un curso con ese slug. Cambiá el slug o el título.",
        409
      );
    }

    const { data, error } = await supabase
      .from("cursos")
      .insert(resultado.curso)
      .select(CAMPOS_CURSO)
      .single();

    if (error || !data) {
      console.error("Error creando curso:", error);
      return crearRespuestaError("No se pudo crear el curso.", 500);
    }

    return NextResponse.json({
      ok: true,
      curso: data,
    });
  } catch (error) {
    console.error("Error PUT /api/admin/cursos:", error);
    return crearRespuestaError("Error interno del servidor.", 500);
  }
}

export async function PATCH(request) {
  try {
    const admin = await verificarAdmin(request);

    if (!admin.ok) {
      return crearRespuestaError(admin.error, admin.status);
    }

    const supabase = admin.supabase;

    const body = await request.json();

    const id = validarId(body?.id);
    const resultado = prepararCurso(body?.curso);

    if (!id) {
      return crearRespuestaError("ID de curso inválido.", 400);
    }

    if (!resultado.ok) {
      return crearRespuestaError(resultado.error, 400);
    }

    const { data: cursoExiste, error: errorExiste } = await supabase
      .from("cursos")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (errorExiste) {
      console.error("Error verificando curso:", errorExiste);
      return crearRespuestaError("No se pudo verificar el curso.", 500);
    }

    if (!cursoExiste) {
      return crearRespuestaError("No se encontró el curso.", 404);
    }

    const { data: cursoConMismoSlug, error: errorSlug } = await supabase
      .from("cursos")
      .select("id")
      .eq("slug", resultado.curso.slug)
      .neq("id", id)
      .maybeSingle();

    if (errorSlug) {
      console.error("Error verificando slug repetido:", errorSlug);
      return crearRespuestaError("No se pudo verificar el slug del curso.", 500);
    }

    if (cursoConMismoSlug) {
      return crearRespuestaError(
        "Ya existe otro curso con ese slug. Cambiá el slug o el título.",
        409
      );
    }

    const { data, error } = await supabase
      .from("cursos")
      .update(resultado.curso)
      .eq("id", id)
      .select(CAMPOS_CURSO)
      .single();

    if (error || !data) {
      console.error("Error actualizando curso:", error);
      return crearRespuestaError("No se pudo actualizar el curso.", 500);
    }

    return NextResponse.json({
      ok: true,
      curso: data,
    });
  } catch (error) {
    console.error("Error PATCH /api/admin/cursos:", error);
    return crearRespuestaError("Error interno del servidor.", 500);
  }
}

export async function DELETE(request) {
  try {
    const admin = await verificarAdmin(request);

    if (!admin.ok) {
      return crearRespuestaError(admin.error, admin.status);
    }

    const supabase = admin.supabase;

    const body = await request.json();

    const id = validarId(body?.id);

    if (!id) {
      return crearRespuestaError("ID de curso inválido.", 400);
    }

    const { data: cursoExiste, error: errorExiste } = await supabase
      .from("cursos")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (errorExiste) {
      console.error("Error verificando curso antes de eliminar:", errorExiste);
      return crearRespuestaError("No se pudo verificar el curso.", 500);
    }

    if (!cursoExiste) {
      return crearRespuestaError("No se encontró el curso.", 404);
    }

    const { data, error } = await supabase
      .from("cursos")
      .delete()
      .eq("id", id)
      .select("id")
      .single();

    if (error || !data) {
      console.error("Error eliminando curso:", error);
      return crearRespuestaError("No se pudo eliminar el curso.", 500);
    }

    return NextResponse.json({
      ok: true,
      id: data.id,
    });
  } catch (error) {
    console.error("Error DELETE /api/admin/cursos:", error);
    return crearRespuestaError("Error interno del servidor.", 500);
  }
}