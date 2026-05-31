import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

const ESTADOS_PERMITIDOS = [
  "pendiente",
  "contactado",
  "interesado",
  "pagó",
  "rechazado",
];

const CAMPOS_INSCRIPCION = `
  id,
  nombre,
  telefono,
  email,
  curso,
  modalidad,
  mensaje,
  estado,
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

    const { data, error } = await supabaseAdmin
      .from("inscripciones")
      .select(CAMPOS_INSCRIPCION)
      .order("created_at", { ascending: false })
      .limit(300);

    if (error) {
      return crearRespuestaError(
        "No se pudieron cargar las inscripciones.",
        500
      );
    }

    return NextResponse.json({
      ok: true,
      inscripciones: data || [],
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
      return crearRespuestaError("ID de inscripción inválido.", 400);
    }

    if (!estado) {
      return crearRespuestaError("Falta el estado.", 400);
    }

    if (!ESTADOS_PERMITIDOS.includes(estado)) {
      return crearRespuestaError("Estado no permitido.", 400);
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("inscripciones")
      .update({ estado })
      .eq("id", id)
      .select(CAMPOS_INSCRIPCION)
      .single();

    if (error || !data) {
      return crearRespuestaError(
        "No se pudo actualizar la inscripción.",
        500
      );
    }

    return NextResponse.json({
      ok: true,
      inscripcion: data,
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
      return crearRespuestaError("ID de inscripción inválido.", 400);
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("inscripciones")
      .delete()
      .eq("id", id)
      .select("id")
      .single();

    if (error || !data) {
      return crearRespuestaError("No se pudo eliminar la inscripción.", 500);
    }

    return NextResponse.json({
      ok: true,
      id: data.id,
    });
  } catch (error) {
    return crearRespuestaError("Error interno del servidor.", 500);
  }
}