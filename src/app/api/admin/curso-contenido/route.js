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

const CAMPOS_MODULO = `
  id,
  curso_id,
  titulo,
  descripcion,
  orden,
  activo,
  created_at
`;

const CAMPOS_CLASE = `
  id,
  modulo_id,
  titulo,
  descripcion,
  video_url,
  pdf_url,
  contenido,
  orden,
  activo,
  created_at
`;

const CAMPOS_MODULOS_CON_CLASES = `
  id,
  curso_id,
  titulo,
  descripcion,
  orden,
  activo,
  created_at,
  clases:curso_clases (
    id,
    modulo_id,
    titulo,
    descripcion,
    video_url,
    pdf_url,
    contenido,
    orden,
    activo,
    created_at
  )
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

function limpiarTexto(valor, maximo = 1000) {
  return String(valor || "").trim().slice(0, maximo);
}

function limpiarSlug(slug) {
  return String(slug || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function limpiarUrl(valor) {
  const texto = limpiarTexto(valor, 1200);

  if (!texto) return "";

  if (texto.startsWith("/") || texto.startsWith("http://") || texto.startsWith("https://")) {
    return texto;
  }

  return texto;
}

function prepararModulo(modulo) {
  const cursoId = validarId(modulo?.curso_id);
  const titulo = limpiarTexto(modulo?.titulo, 160);

  if (!cursoId) {
    return {
      ok: false,
      error: "ID de curso inválido.",
    };
  }

  if (!titulo) {
    return {
      ok: false,
      error: "El título del módulo es obligatorio.",
    };
  }

  return {
    ok: true,
    modulo: {
      curso_id: cursoId,
      titulo,
      descripcion: limpiarTexto(modulo?.descripcion, 1500),
      orden: validarId(modulo?.orden) || 1,
      activo: Boolean(modulo?.activo),
    },
  };
}

function prepararModuloParaActualizar(modulo) {
  const titulo = limpiarTexto(modulo?.titulo, 160);

  if (!titulo) {
    return {
      ok: false,
      error: "El título del módulo es obligatorio.",
    };
  }

  return {
    ok: true,
    modulo: {
      titulo,
      descripcion: limpiarTexto(modulo?.descripcion, 1500),
      orden: validarId(modulo?.orden) || 1,
      activo: Boolean(modulo?.activo),
    },
  };
}

function prepararClase(clase) {
  const moduloId = validarId(clase?.modulo_id);
  const titulo = limpiarTexto(clase?.titulo, 180);

  if (!moduloId) {
    return {
      ok: false,
      error: "ID de módulo inválido.",
    };
  }

  if (!titulo) {
    return {
      ok: false,
      error: "El título de la clase es obligatorio.",
    };
  }

  return {
    ok: true,
    clase: {
      modulo_id: moduloId,
      titulo,
      descripcion: limpiarTexto(clase?.descripcion, 1500),
      video_url: limpiarUrl(clase?.video_url),
      pdf_url: limpiarUrl(clase?.pdf_url),
      contenido: limpiarTexto(clase?.contenido, 12000),
      orden: validarId(clase?.orden) || 1,
      activo: Boolean(clase?.activo),
    },
  };
}

function prepararClaseParaActualizar(clase) {
  const titulo = limpiarTexto(clase?.titulo, 180);

  if (!titulo) {
    return {
      ok: false,
      error: "El título de la clase es obligatorio.",
    };
  }

  return {
    ok: true,
    clase: {
      titulo,
      descripcion: limpiarTexto(clase?.descripcion, 1500),
      video_url: limpiarUrl(clase?.video_url),
      pdf_url: limpiarUrl(clase?.pdf_url),
      contenido: limpiarTexto(clase?.contenido, 12000),
      orden: validarId(clase?.orden) || 1,
      activo: Boolean(clase?.activo),
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

export async function GET(request) {
  try {
    const admin = await verificarAdmin();

    if (!admin.ok) {
      return crearRespuestaError(admin.error, admin.status);
    }

    const { searchParams } = new URL(request.url);
    const slug = limpiarSlug(searchParams.get("slug"));

    if (!slug) {
      return crearRespuestaError("Falta el slug del curso.", 400);
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { data: curso, error: errorCurso } = await supabaseAdmin
      .from("cursos")
      .select(CAMPOS_CURSO)
      .eq("slug", slug)
      .single();

    if (errorCurso || !curso) {
      return crearRespuestaError("Curso no encontrado.", 404);
    }

    const { data: modulos, error: errorModulos } = await supabaseAdmin
      .from("curso_modulos")
      .select(CAMPOS_MODULOS_CON_CLASES)
      .eq("curso_id", curso.id)
      .order("orden", { ascending: true })
      .order("orden", {
        referencedTable: "curso_clases",
        ascending: true,
      });

    if (errorModulos) {
      return crearRespuestaError("No se pudo cargar el contenido.", 500);
    }

    return NextResponse.json({
      ok: true,
      curso,
      modulos: modulos || [],
    });
  } catch (error) {
    return crearRespuestaError("Error interno del servidor.", 500);
  }
}

export async function POST(request) {
  try {
    const admin = await verificarAdmin();

    if (!admin.ok) {
      return crearRespuestaError(admin.error, admin.status);
    }

    const body = await request.json();
    const tipo = String(body?.tipo || "").trim();

    const supabaseAdmin = crearSupabaseAdmin();

    if (tipo === "modulo") {
      const resultado = prepararModulo(body?.modulo);

      if (!resultado.ok) {
        return crearRespuestaError(resultado.error, 400);
      }

      const { data: cursoExiste } = await supabaseAdmin
        .from("cursos")
        .select("id")
        .eq("id", resultado.modulo.curso_id)
        .maybeSingle();

      if (!cursoExiste) {
        return crearRespuestaError("No se encontró el curso.", 404);
      }

      const { data, error } = await supabaseAdmin
        .from("curso_modulos")
        .insert(resultado.modulo)
        .select(CAMPOS_MODULO)
        .single();

      if (error || !data) {
        return crearRespuestaError("No se pudo crear el módulo.", 500);
      }

      return NextResponse.json({
        ok: true,
        modulo: data,
      });
    }

    if (tipo === "clase") {
      const resultado = prepararClase(body?.clase);

      if (!resultado.ok) {
        return crearRespuestaError(resultado.error, 400);
      }

      const { data: moduloExiste } = await supabaseAdmin
        .from("curso_modulos")
        .select("id")
        .eq("id", resultado.clase.modulo_id)
        .maybeSingle();

      if (!moduloExiste) {
        return crearRespuestaError("No se encontró el módulo.", 404);
      }

      const { data, error } = await supabaseAdmin
        .from("curso_clases")
        .insert(resultado.clase)
        .select(CAMPOS_CLASE)
        .single();

      if (error || !data) {
        return crearRespuestaError("No se pudo crear la clase.", 500);
      }

      return NextResponse.json({
        ok: true,
        clase: data,
      });
    }

    return crearRespuestaError("Tipo de contenido inválido.", 400);
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
    const tipo = String(body?.tipo || "").trim();
    const id = validarId(body?.id);

    if (!id) {
      return crearRespuestaError("ID inválido.", 400);
    }

    const supabaseAdmin = crearSupabaseAdmin();

    if (tipo === "modulo") {
      const resultado = prepararModuloParaActualizar(body?.modulo);

      if (!resultado.ok) {
        return crearRespuestaError(resultado.error, 400);
      }

      const { data, error } = await supabaseAdmin
        .from("curso_modulos")
        .update(resultado.modulo)
        .eq("id", id)
        .select(CAMPOS_MODULO)
        .single();

      if (error || !data) {
        return crearRespuestaError("No se pudo actualizar el módulo.", 500);
      }

      return NextResponse.json({
        ok: true,
        modulo: data,
      });
    }

    if (tipo === "clase") {
      const resultado = prepararClaseParaActualizar(body?.clase);

      if (!resultado.ok) {
        return crearRespuestaError(resultado.error, 400);
      }

      const { data, error } = await supabaseAdmin
        .from("curso_clases")
        .update(resultado.clase)
        .eq("id", id)
        .select(CAMPOS_CLASE)
        .single();

      if (error || !data) {
        return crearRespuestaError("No se pudo actualizar la clase.", 500);
      }

      return NextResponse.json({
        ok: true,
        clase: data,
      });
    }

    return crearRespuestaError("Tipo inválido.", 400);
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
    const tipo = String(body?.tipo || "").trim();
    const id = validarId(body?.id);

    if (!id) {
      return crearRespuestaError("ID inválido.", 400);
    }

    const supabaseAdmin = crearSupabaseAdmin();

    if (tipo === "modulo") {
      const { data, error } = await supabaseAdmin
        .from("curso_modulos")
        .delete()
        .eq("id", id)
        .select("id")
        .single();

      if (error || !data) {
        return crearRespuestaError("No se pudo eliminar el módulo.", 500);
      }

      return NextResponse.json({
        ok: true,
        id: data.id,
      });
    }

    if (tipo === "clase") {
      const { data, error } = await supabaseAdmin
        .from("curso_clases")
        .delete()
        .eq("id", id)
        .select("id")
        .single();

      if (error || !data) {
        return crearRespuestaError("No se pudo eliminar la clase.", 500);
      }

      return NextResponse.json({
        ok: true,
        id: data.id,
      });
    }

    return crearRespuestaError("Tipo inválido.", 400);
  } catch (error) {
    return crearRespuestaError("Error interno del servidor.", 500);
  }
}