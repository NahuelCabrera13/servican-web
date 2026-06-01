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

const CAMPOS_MODULO = `
  id,
  curso_id,
  titulo,
  descripcion,
  orden,
  activo,
  nivel_minimo_acceso,
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
  nivel_minimo_acceso,
  created_at
`;

const CAMPOS_MODULOS_CON_CLASES = `
  id,
  curso_id,
  titulo,
  descripcion,
  orden,
  activo,
  nivel_minimo_acceso,
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
    nivel_minimo_acceso,
    created_at
  )
`;

const NIVELES_ACCESO = ["basico", "extenso", "pro", "plantel"];

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

function limpiarNivelAcceso(valor) {
  const nivel = String(valor || "basico").trim().toLowerCase();

  if (NIVELES_ACCESO.includes(nivel)) {
    return nivel;
  }

  return "basico";
}

function limpiarUrlMaterial(valor) {
  const texto = limpiarTexto(valor, 1200);

  if (!texto) return "";

  if (texto.includes("..")) return "";

  if (
    texto.startsWith("/") ||
    texto.startsWith("http://") ||
    texto.startsWith("https://") ||
    !texto.includes("://")
  ) {
    return texto;
  }

  return "";
}

function obtenerEmbedYoutube(url) {
  if (!url) return "";

  try {
    const urlObj = new URL(url);

    if (urlObj.hostname.includes("youtube.com")) {
      const videoId = urlObj.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube-nocookie.com/embed/${videoId}`;
      }

      if (urlObj.pathname.startsWith("/embed/")) {
        return url.replace("youtube.com", "youtube-nocookie.com");
      }
    }

    if (urlObj.hostname.includes("youtu.be")) {
      const videoId = urlObj.pathname.replace("/", "");

      if (videoId) {
        return `https://www.youtube-nocookie.com/embed/${videoId}`;
      }
    }

    return "";
  } catch {
    return "";
  }
}

function limpiarUrlYoutube(valor) {
  const texto = limpiarTexto(valor, 1200);

  if (!texto) return "";

  const embed = obtenerEmbedYoutube(texto);

  if (!embed) {
    return null;
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
      nivel_minimo_acceso: limpiarNivelAcceso(modulo?.nivel_minimo_acceso),
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
      nivel_minimo_acceso: limpiarNivelAcceso(modulo?.nivel_minimo_acceso),
    },
  };
}

function prepararClase(clase) {
  const moduloId = validarId(clase?.modulo_id);
  const titulo = limpiarTexto(clase?.titulo, 180);
  const videoUrl = limpiarUrlYoutube(clase?.video_url);

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

  if (videoUrl === null) {
    return {
      ok: false,
      error:
        "El video debe ser un link válido de YouTube. Usá https://www.youtube.com/watch?v=... o https://youtu.be/...",
    };
  }

  return {
    ok: true,
    clase: {
      modulo_id: moduloId,
      titulo,
      descripcion: limpiarTexto(clase?.descripcion, 1500),
      video_url: videoUrl,
      pdf_url: limpiarUrlMaterial(clase?.pdf_url),
      contenido: limpiarTexto(clase?.contenido, 12000),
      orden: validarId(clase?.orden) || 1,
      activo: Boolean(clase?.activo),
      nivel_minimo_acceso: limpiarNivelAcceso(clase?.nivel_minimo_acceso),
    },
  };
}

function prepararClaseParaActualizar(clase) {
  const titulo = limpiarTexto(clase?.titulo, 180);
  const videoUrl = limpiarUrlYoutube(clase?.video_url);

  if (!titulo) {
    return {
      ok: false,
      error: "El título de la clase es obligatorio.",
    };
  }

  if (videoUrl === null) {
    return {
      ok: false,
      error:
        "El video debe ser un link válido de YouTube. Usá https://www.youtube.com/watch?v=... o https://youtu.be/...",
    };
  }

  return {
    ok: true,
    clase: {
      titulo,
      descripcion: limpiarTexto(clase?.descripcion, 1500),
      video_url: videoUrl,
      pdf_url: limpiarUrlMaterial(clase?.pdf_url),
      contenido: limpiarTexto(clase?.contenido, 12000),
      orden: validarId(clase?.orden) || 1,
      activo: Boolean(clase?.activo),
      nivel_minimo_acceso: limpiarNivelAcceso(clase?.nivel_minimo_acceso),
    },
  };
}

export async function GET(request) {
  try {
    const admin = await verificarAdmin(request);

    if (!admin.ok) {
      return crearRespuestaError(admin.error, admin.status);
    }

    const { searchParams } = new URL(request.url);
    const slug = limpiarSlug(searchParams.get("slug"));

    if (!slug) {
      return crearRespuestaError("Falta el slug del curso.", 400);
    }

    const supabase = admin.supabase;

    const { data: curso, error: errorCurso } = await supabase
      .from("cursos")
      .select(CAMPOS_CURSO)
      .eq("slug", slug)
      .maybeSingle();

    if (errorCurso || !curso) {
      return crearRespuestaError("Curso no encontrado.", 404);
    }

    const { data: modulos, error: errorModulos } = await supabase
      .from("curso_modulos")
      .select(CAMPOS_MODULOS_CON_CLASES)
      .eq("curso_id", curso.id)
      .order("orden", { ascending: true })
      .order("orden", {
        referencedTable: "curso_clases",
        ascending: true,
      });

    if (errorModulos) {
      console.error("Error cargando contenido del curso:", errorModulos);

      return crearRespuestaError("No se pudo cargar el contenido.", 500);
    }

    return NextResponse.json({
      ok: true,
      curso,
      modulos: modulos || [],
    });
  } catch (error) {
    console.error("Error GET /api/admin/curso-contenido:", error);

    return crearRespuestaError("Error interno del servidor.", 500);
  }
}

export async function POST(request) {
  try {
    const admin = await verificarAdmin(request);

    if (!admin.ok) {
      return crearRespuestaError(admin.error, admin.status);
    }

    const body = await request.json();
    const tipo = String(body?.tipo || "").trim();

    const supabase = admin.supabase;

    if (tipo === "modulo") {
      const resultado = prepararModulo(body?.modulo);

      if (!resultado.ok) {
        return crearRespuestaError(resultado.error, 400);
      }

      const { data: cursoExiste, error: errorCursoExiste } = await supabase
        .from("cursos")
        .select("id")
        .eq("id", resultado.modulo.curso_id)
        .maybeSingle();

      if (errorCursoExiste) {
        console.error("Error verificando curso:", errorCursoExiste);

        return crearRespuestaError("No se pudo verificar el curso.", 500);
      }

      if (!cursoExiste) {
        return crearRespuestaError("No se encontró el curso.", 404);
      }

      const { data, error } = await supabase
        .from("curso_modulos")
        .insert(resultado.modulo)
        .select(CAMPOS_MODULO)
        .single();

      if (error || !data) {
        console.error("Error creando módulo:", error);

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

      const { data: moduloExiste, error: errorModuloExiste } = await supabase
        .from("curso_modulos")
        .select("id")
        .eq("id", resultado.clase.modulo_id)
        .maybeSingle();

      if (errorModuloExiste) {
        console.error("Error verificando módulo:", errorModuloExiste);

        return crearRespuestaError("No se pudo verificar el módulo.", 500);
      }

      if (!moduloExiste) {
        return crearRespuestaError("No se encontró el módulo.", 404);
      }

      const { data, error } = await supabase
        .from("curso_clases")
        .insert(resultado.clase)
        .select(CAMPOS_CLASE)
        .single();

      if (error || !data) {
        console.error("Error creando clase:", error);

        return crearRespuestaError("No se pudo crear la clase.", 500);
      }

      return NextResponse.json({
        ok: true,
        clase: data,
      });
    }

    return crearRespuestaError("Tipo de contenido inválido.", 400);
  } catch (error) {
    console.error("Error POST /api/admin/curso-contenido:", error);

    return crearRespuestaError("Error interno del servidor.", 500);
  }
}

export async function PATCH(request) {
  try {
    const admin = await verificarAdmin(request);

    if (!admin.ok) {
      return crearRespuestaError(admin.error, admin.status);
    }

    const body = await request.json();
    const tipo = String(body?.tipo || "").trim();
    const id = validarId(body?.id);

    if (!id) {
      return crearRespuestaError("ID inválido.", 400);
    }

    const supabase = admin.supabase;

    if (tipo === "modulo") {
      const resultado = prepararModuloParaActualizar(body?.modulo);

      if (!resultado.ok) {
        return crearRespuestaError(resultado.error, 400);
      }

      const { data: moduloExiste, error: errorModuloExiste } = await supabase
        .from("curso_modulos")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (errorModuloExiste) {
        console.error("Error verificando módulo:", errorModuloExiste);

        return crearRespuestaError("No se pudo verificar el módulo.", 500);
      }

      if (!moduloExiste) {
        return crearRespuestaError("No se encontró el módulo.", 404);
      }

      const { data, error } = await supabase
        .from("curso_modulos")
        .update(resultado.modulo)
        .eq("id", id)
        .select(CAMPOS_MODULO)
        .single();

      if (error || !data) {
        console.error("Error actualizando módulo:", error);

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

      const { data: claseExiste, error: errorClaseExiste } = await supabase
        .from("curso_clases")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (errorClaseExiste) {
        console.error("Error verificando clase:", errorClaseExiste);

        return crearRespuestaError("No se pudo verificar la clase.", 500);
      }

      if (!claseExiste) {
        return crearRespuestaError("No se encontró la clase.", 404);
      }

      const { data, error } = await supabase
        .from("curso_clases")
        .update(resultado.clase)
        .eq("id", id)
        .select(CAMPOS_CLASE)
        .single();

      if (error || !data) {
        console.error("Error actualizando clase:", error);

        return crearRespuestaError("No se pudo actualizar la clase.", 500);
      }

      return NextResponse.json({
        ok: true,
        clase: data,
      });
    }

    return crearRespuestaError("Tipo inválido.", 400);
  } catch (error) {
    console.error("Error PATCH /api/admin/curso-contenido:", error);

    return crearRespuestaError("Error interno del servidor.", 500);
  }
}

export async function DELETE(request) {
  try {
    const admin = await verificarAdmin(request);

    if (!admin.ok) {
      return crearRespuestaError(admin.error, admin.status);
    }

    const body = await request.json();
    const tipo = String(body?.tipo || "").trim();
    const id = validarId(body?.id);

    if (!id) {
      return crearRespuestaError("ID inválido.", 400);
    }

    const supabase = admin.supabase;

    if (tipo === "modulo") {
      const { data: moduloExiste, error: errorModuloExiste } = await supabase
        .from("curso_modulos")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (errorModuloExiste) {
        console.error("Error verificando módulo antes de eliminar:", errorModuloExiste);

        return crearRespuestaError("No se pudo verificar el módulo.", 500);
      }

      if (!moduloExiste) {
        return crearRespuestaError("No se encontró el módulo.", 404);
      }

      const { error: errorClases } = await supabase
        .from("curso_clases")
        .delete()
        .eq("modulo_id", id);

      if (errorClases) {
        console.error("Error eliminando clases del módulo:", errorClases);

        return crearRespuestaError(
          "No se pudieron eliminar las clases del módulo.",
          500
        );
      }

      const { data, error } = await supabase
        .from("curso_modulos")
        .delete()
        .eq("id", id)
        .select("id")
        .single();

      if (error || !data) {
        console.error("Error eliminando módulo:", error);

        return crearRespuestaError("No se pudo eliminar el módulo.", 500);
      }

      return NextResponse.json({
        ok: true,
        id: data.id,
      });
    }

    if (tipo === "clase") {
      const { data: claseExiste, error: errorClaseExiste } = await supabase
        .from("curso_clases")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (errorClaseExiste) {
        console.error("Error verificando clase antes de eliminar:", errorClaseExiste);

        return crearRespuestaError("No se pudo verificar la clase.", 500);
      }

      if (!claseExiste) {
        return crearRespuestaError("No se encontró la clase.", 404);
      }

      const { error: errorProgreso } = await supabase
        .from("clase_progreso")
        .delete()
        .eq("clase_id", id);

      if (errorProgreso) {
        console.error("Error eliminando progreso de la clase:", errorProgreso);

        return crearRespuestaError(
          "No se pudo eliminar el progreso asociado a la clase.",
          500
        );
      }

      const { data, error } = await supabase
        .from("curso_clases")
        .delete()
        .eq("id", id)
        .select("id")
        .single();

      if (error || !data) {
        console.error("Error eliminando clase:", error);

        return crearRespuestaError("No se pudo eliminar la clase.", 500);
      }

      return NextResponse.json({
        ok: true,
        id: data.id,
      });
    }

    return crearRespuestaError("Tipo inválido.", 400);
  } catch (error) {
    console.error("Error DELETE /api/admin/curso-contenido:", error);

    return crearRespuestaError("Error interno del servidor.", 500);
  }
}