import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

const ESTADOS_CERTIFICADO = ["emitido", "anulado"];

const CAMPOS_CERTIFICADO = `
  id,
  user_id,
  curso_id,
  codigo,
  nombre_alumno,
  email_alumno,
  titulo_curso,
  estado,
  emitido_at,
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

    const { data: certificados, error } = await supabaseAdmin
      .from("certificados")
      .select(CAMPOS_CERTIFICADO)
      .order("emitido_at", { ascending: false })
      .limit(1000);

    if (error) {
      return crearRespuestaError(
        "No se pudieron cargar los certificados.",
        500
      );
    }

    return NextResponse.json({
      ok: true,
      certificados: certificados || [],
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
    const estado = String(body?.estado || "").trim();

    if (!id) {
      return crearRespuestaError("ID de certificado inválido.", 400);
    }

    if (!ESTADOS_CERTIFICADO.includes(estado)) {
      return crearRespuestaError("Estado no permitido.", 400);
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { data: certificadoExiste } = await supabaseAdmin
      .from("certificados")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (!certificadoExiste) {
      return crearRespuestaError("No se encontró el certificado.", 404);
    }

    const { data: certificado, error } = await supabaseAdmin
      .from("certificados")
      .update({ estado })
      .eq("id", id)
      .select(CAMPOS_CERTIFICADO)
      .single();

    if (error || !certificado) {
      return crearRespuestaError(
        "No se pudo actualizar el certificado.",
        500
      );
    }

    return NextResponse.json({
      ok: true,
      certificado,
    });
  } catch (error) {
    return crearRespuestaError("Error interno del servidor.", 500);
  }
}