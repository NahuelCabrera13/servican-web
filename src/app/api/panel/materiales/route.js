import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

const BUCKET_MATERIALES = "materiales-cursos";

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
  } catch (error) {
    return false;
  }
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
      .single();

    if (errorPerfil || !perfil) {
      return crearRespuestaError("No se encontró tu perfil.", 403);
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { data: clase, error: errorClase } = await supabaseAdmin
      .from("curso_clases")
      .select(`
        id,
        pdf_url,
        activo,
        modulo:curso_modulos (
          id,
          curso_id,
          activo,
          curso:cursos (
            id,
            activo
          )
        )
      `)
      .eq("id", claseId)
      .single();

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

    if (!esAdminOInstructor) {
      const { data: acceso } = await supabaseAdmin
        .from("alumno_cursos")
        .select("id, estado")
        .eq("user_id", user.id)
        .eq("curso_id", cursoId)
        .eq("estado", "activo")
        .maybeSingle();

      if (!acceso) {
        return crearRespuestaError(
          "No tenés acceso activo a este material.",
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
      return crearRespuestaError("No se pudo abrir el material.", 500);
    }

    return NextResponse.redirect(signedUrl.signedUrl);
  } catch (error) {
    return crearRespuestaError("Error interno del servidor.", 500);
  }
}