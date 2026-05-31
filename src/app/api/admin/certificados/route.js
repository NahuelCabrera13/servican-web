import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

function crearSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Faltan variables de entorno de Supabase.");
  }

  return createSupabaseAdminClient(supabaseUrl, serviceRoleKey);
}

async function verificarAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      status: 401,
      error: "No has iniciado sesión.",
    };
  }

  const { data: perfil, error } = await supabase
    .from("perfiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (error || !perfil || perfil.role !== "admin") {
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

export async function GET() {
  try {
    const admin = await verificarAdmin();

    if (!admin.ok) {
      return NextResponse.json(
        { error: admin.error },
        { status: admin.status }
      );
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { data: certificados, error } = await supabaseAdmin
      .from("certificados")
      .select("*")
      .order("emitido_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      certificados: certificados || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const admin = await verificarAdmin();

    if (!admin.ok) {
      return NextResponse.json(
        { error: admin.error },
        { status: admin.status }
      );
    }

    const body = await request.json();

    const id = body?.id;
    const estado = body?.estado;

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID del certificado." },
        { status: 400 }
      );
    }

    if (!["emitido", "anulado"].includes(estado)) {
      return NextResponse.json(
        { error: "Estado no permitido." },
        { status: 400 }
      );
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { data: certificado, error } = await supabaseAdmin
      .from("certificados")
      .update({ estado })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      certificado,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}