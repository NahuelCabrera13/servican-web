import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const BUCKET_MATERIALES = "materiales-cursos";

const JERARQUIA_PLANES = {
  basico: 1,
  extenso: 2,
  pro: 3,
  plantel: 4,
};

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

function normalizarNivel(nivel) {
  const valor = String(nivel || "basico").toLowerCase().trim();

  if (JERARQUIA_PLANES[valor]) {
    return valor;
  }

  return "basico";
}

function nivelesPermitidos(nivelAlumno) {
  const nivel = normalizarNivel(nivelAlumno);
  const valorNivel = JERARQUIA_PLANES[nivel];

  return Object.entries(JERARQUIA_PLANES)
    .filter(([, valor]) => valor <= valorNivel)
    .map(([nombre]) => nombre);
}

function rutaStorageValida(ruta) {
  if (!ruta) return false;

  const texto = String(ruta).trim();

  if (!texto) return false;
  if (texto.includes("..")) return false;
  if (texto.startsWith("/")) return false;
  if (texto.startsWith("\\")) return false;

  return true;
}

function esUrlExternaValida(url) {
  try {
    const urlObj = new URL(url);

    return urlObj.protocol === "https:" || urlObj.protocol === "http:";
  } catch {
    return false;
  }
}

function clasesActivasOrdenadas(modulos, niveles) {
  return (modulos || [])
    .flatMap((modulo) =>
      (modulo.clases || [])
        .filter(
          (clase) =>
            clase.activo &&
            niveles.includes(normalizarNivel(clase.nivel_minimo_acceso))
        )
        .map((clase) => ({
          ...clase,
          modulo_id: modulo.id,
          modulo_orden: modulo.orden,
        }))
    )
    .sort((a, b) => {
      if (a.modulo_orden !== b.modulo_orden) {
        return a.modulo_orden - b.modulo_orden;
      }

      return a.orden - b.orden;
    });
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
    const requestUrl = new URL(request.url);
    const claseId = validarId(requestUrl.searchParams.get("clase_id"));

    if (!claseId) {
      return crearRespuestaError("ID de clase inválido.", 400);
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: errorUsuario,
    } = await supabase.auth.getUser();

    if (errorUsuario || !user) {
      return NextResponse.redirect(
        new URL(`/login?redirect=/panel`, request.url)
      );
    }

    const { data: perfil, error: errorPerfil } = await supabase
      .from("perfiles")
      .select("id, user_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (errorPerfil || !perfil) {
      return crearRespuestaError("No se encontró tu perfil.", 403);
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { data: clase, error: errorClase } = await supabaseAdmin
      .from("curso_clases")
      .select(
        `
        id,
        pdf_url,
        activo,
        nivel_minimo_acceso,
        orden,
        modulo:curso_modulos (
          id,
          curso_id,
          activo,
          orden,
          nivel_minimo_acceso,
          curso:cursos (
            id,
            activo
          )
        )
      `
      )
      .eq("id", claseId)
      .maybeSingle();

    if (errorClase || !clase) {
      return crearRespuestaError("No se encontró la clase.", 404);
    }

    if (!clase.activo || !clase.modulo?.activo) {
      return crearRespuestaError("Este material no está disponible.", 403);
    }

    const cursoId = clase.modulo?.curso_id;
    const cursoActivo = clase.modulo?.curso?.activo;

    if (!cursoId) {
      return crearRespuestaError(
        "No se pudo encontrar el curso de la clase.",
        400
      );
    }

    if (!cursoActivo) {
      return crearRespuestaError("Este curso no está activo.", 403);
    }

    if (!clase.pdf_url) {
      return crearRespuestaError(
        "Esta clase no tiene material cargado.",
        404
      );
    }

    const esAdminOInstructor =
      perfil.role === "admin" || perfil.role === "instructor";

    let nivelAlumno = "plantel";

    if (!esAdminOInstructor) {
      const { data: acceso, error: errorAcceso } = await supabaseAdmin
        .from("alumno_cursos")
        .select("id, estado, nivel_acceso")
        .eq("user_id", user.id)
        .eq("curso_id", cursoId)
        .eq("estado", "activo")
        .maybeSingle();

      if (errorAcceso || !acceso) {
        return crearRespuestaError(
          "No tenés acceso activo a este material.",
          403
        );
      }

      nivelAlumno = normalizarNivel(acceso.nivel_acceso);
    }

    const niveles = nivelesPermitidos(nivelAlumno);

    const nivelModulo = normalizarNivel(clase.modulo?.nivel_minimo_acceso);
    const nivelClase = normalizarNivel(clase.nivel_minimo_acceso);

    if (!niveles.includes(nivelModulo) || !niveles.includes(nivelClase)) {
      return crearRespuestaError(
        "Este material no está incluido en tu plan.",
        403
      );
    }

    const { data: modulos, error: errorModulos } = await supabaseAdmin
      .from("curso_modulos")
      .select(
        `
        id,
        orden,
        activo,
        nivel_minimo_acceso,
        clases:curso_clases (
          id,
          orden,
          activo,
          nivel_minimo_acceso
        )
      `
      )
      .eq("curso_id", cursoId)
      .eq("activo", true)
      .in("nivel_minimo_acceso", niveles)
      .order("orden", { ascending: true })
      .order("orden", {
        referencedTable: "curso_clases",
        ascending: true,
      });

    if (errorModulos) {
      console.error("Error verificando módulos para material:", errorModulos);

      return crearRespuestaError("No se pudo verificar el material.", 500);
    }

    const clasesOrdenadas = clasesActivasOrdenadas(modulos, niveles);
    const indiceClaseActual = clasesOrdenadas.findIndex(
      (item) => item.id === claseId
    );

    if (indiceClaseActual === -1) {
      return crearRespuestaError(
        "Este material no pertenece al contenido habilitado para tu plan.",
        403
      );
    }

    if (!esAdminOInstructor && indiceClaseActual > 0) {
      const claseAnterior = clasesOrdenadas[indiceClaseActual - 1];

      const { data: progresoAnterior } = await supabaseAdmin
        .from("clase_progreso")
        .select("id, completada")
        .eq("user_id", user.id)
        .eq("clase_id", claseAnterior.id)
        .eq("completada", true)
        .maybeSingle();

      if (!progresoAnterior) {
        return crearRespuestaError(
          "Este material está bloqueado hasta completar la clase anterior.",
          403
        );
      }
    }

    const material = String(clase.pdf_url).trim();

    if (material.startsWith("http://") || material.startsWith("https://")) {
      if (!esUrlExternaValida(material)) {
        return crearRespuestaError("El link del material no es válido.", 400);
      }

      return NextResponse.redirect(material);
    }

    if (!rutaStorageValida(material)) {
      return crearRespuestaError("La ruta del material no es válida.", 400);
    }

    const { data: signedUrl, error: errorSignedUrl } =
      await supabaseAdmin.storage
        .from(BUCKET_MATERIALES)
        .createSignedUrl(material, 60 * 10);

    if (errorSignedUrl || !signedUrl?.signedUrl) {
      console.error("Error creando signed URL:", errorSignedUrl);

      return crearRespuestaError("No se pudo abrir el material.", 500);
    }

    return NextResponse.redirect(signedUrl.signedUrl);
  } catch (error) {
    console.error("Error GET /api/panel/materiales:", error);

    return crearRespuestaError("Error interno del servidor.", 500);
  }
}