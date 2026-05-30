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

function crearSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Faltan variables de entorno de Supabase.");
  }

  return createSupabaseAdminClient(supabaseUrl, serviceRoleKey);
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

    const { data, error } = await supabaseAdmin
      .from("inscripciones")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      inscripciones: data || [],
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
        { error: "Falta el ID de la inscripción." },
        { status: 400 }
      );
    }

    if (!estado) {
      return NextResponse.json(
        { error: "Falta el estado." },
        { status: 400 }
      );
    }

    if (!ESTADOS_PERMITIDOS.includes(estado)) {
      return NextResponse.json(
        { error: "Estado no permitido." },
        { status: 400 }
      );
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("inscripciones")
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
      inscripcion: data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
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

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID de la inscripción." },
        { status: 400 }
      );
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { error } = await supabaseAdmin
      .from("inscripciones")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}