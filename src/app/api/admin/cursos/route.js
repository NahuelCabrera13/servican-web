import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

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

async function verificarAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: errorUsuario,
  } = await supabase.auth.getUser();

  if (errorUsuario || !user) {
    return {
      ok: false,
      status: 401,
      error: "No has iniciado sesión.",
    };
  }

  const { data: perfil, error: errorPerfil } = await supabase
    .from("perfiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (errorPerfil || !perfil || perfil.role !== "admin") {
    return {
      ok: false,
      status: 403,
      error: "No tenés permisos de administrador.",
    };
  }

  return {
    ok: true,
    user,
    perfil,
  };
}

function crearSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Faltan variables de entorno de Supabase.");
  }

  return createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function GET() {
  try {
    const admin = await verificarAdmin();

    if (!admin.ok) {
      return crearRespuestaError(admin.error, admin.status);
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("cursos")
      .select(CAMPOS_CURSO)
      .order("created_at", { ascending: false })
      .limit(300);

    if (error) {
      return crearRespuestaError("No se pudieron cargar los cursos.", 500);
    }

    return NextResponse.json({
      ok: true,
      cursos: data || [],
    });
  } catch (error) {
    return crearRespuestaError("Error interno del servidor.", 500);
  }
}

export async function PUT(request) {
  try {
    const admin = await verificarAdmin();

    if (!admin.ok) {
      return crearRespuestaError(admin.error, admin.status);
    }

    const body = await request.json();
    const resultado = prepararCurso(body?.curso);

    if (!resultado.ok) {
      return crearRespuestaError(resultado.error, 400);
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { data: cursoExistente } = await supabaseAdmin
      .from("cursos")
      .select("id")
      .eq("slug", resultado.curso.slug)
      .maybeSingle();

    if (cursoExistente) {
      return crearRespuestaError(
        "Ya existe un curso con ese slug. Cambiá el slug o el título.",
        409
      );
    }

    const { data, error } = await supabaseAdmin
      .from("cursos")
      .insert(resultado.curso)
      .select(CAMPOS_CURSO)
      .single();

    if (error || !data) {
      return crearRespuestaError("No se pudo crear el curso.", 500);
    }

    return NextResponse.json({
      ok: true,
      curso: data,
    });
  } catch (error) {
    return crearRespuestaError("Error interno del servidor.", 500);
  }
}

export async function PATCH(request) {
  try {
    const admin = await verificarAdmin();

    if (!admin.ok) {
      return crearRespuestaError(admin.error, admin.status);
    }

    const body = await request.json();

    const id = validarId(body?.id);
    const resultado = prepararCurso(body?.curso);

    if (!id) {
      return crearRespuestaError("ID de curso inválido.", 400);
    }

    if (!resultado.ok) {
      return crearRespuestaError(resultado.error, 400);
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { data: cursoConMismoSlug } = await supabaseAdmin
      .from("cursos")
      .select("id")
      .eq("slug", resultado.curso.slug)
      .neq("id", id)
      .maybeSingle();

    if (cursoConMismoSlug) {
      return crearRespuestaError(
        "Ya existe otro curso con ese slug. Cambiá el slug o el título.",
        409
      );
    }

    const { data, error } = await supabaseAdmin
      .from("cursos")
      .update(resultado.curso)
      .eq("id", id)
      .select(CAMPOS_CURSO)
      .single();

    if (error || !data) {
      return crearRespuestaError("No se pudo actualizar el curso.", 500);
    }

    return NextResponse.json({
      ok: true,
      curso: data,
    });
  } catch (error) {
    return crearRespuestaError("Error interno del servidor.", 500);
  }
}

export async function DELETE(request) {
  try {
    const admin = await verificarAdmin();

    if (!admin.ok) {
      return crearRespuestaError(admin.error, admin.status);
    }

    const body = await request.json();

    const id = validarId(body?.id);

    if (!id) {
      return crearRespuestaError("ID de curso inválido.", 400);
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("cursos")
      .delete()
      .eq("id", id)
      .select("id")
      .single();

    if (error || !data) {
      return crearRespuestaError("No se pudo eliminar el curso.", 500);
    }

    return NextResponse.json({
      ok: true,
      id: data.id,
    });
  } catch (error) {
    return crearRespuestaError("Error interno del servidor.", 500);
  }
}