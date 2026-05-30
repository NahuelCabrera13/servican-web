import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function validarPassword(password) {
  return password && password === process.env.ADMIN_PASSWORD;
}

function crearSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Faltan variables de entorno de Supabase.");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const password = body?.password;

    if (!validarPassword(password)) {
      return NextResponse.json(
        { error: "Contraseña incorrecta." },
        { status: 401 }
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
    const body = await request.json();
    const password = body?.password;
    const id = body?.id;
    const estado = body?.estado;

    if (!validarPassword(password)) {
      return NextResponse.json(
        { error: "Contraseña incorrecta." },
        { status: 401 }
      );
    }

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

    const estadosPermitidos = [
      "pendiente",
      "contactado",
      "interesado",
      "pagó",
      "rechazado",
    ];

    if (!estadosPermitidos.includes(estado)) {
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
    const body = await request.json();
    const password = body?.password;
    const id = body?.id;

    if (!validarPassword(password)) {
      return NextResponse.json(
        { error: "Contraseña incorrecta." },
        { status: 401 }
      );
    }

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