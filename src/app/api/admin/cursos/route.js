import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

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

function limpiarSlug(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
      .from("cursos")
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
      cursos: data || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const admin = await verificarAdmin();

    if (!admin.ok) {
      return NextResponse.json(
        { error: admin.error },
        { status: admin.status }
      );
    }

    const body = await request.json();
    const curso = body?.curso;

    if (!curso?.titulo) {
      return NextResponse.json(
        { error: "El título del curso es obligatorio." },
        { status: 400 }
      );
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const slug = limpiarSlug(curso.slug || curso.titulo);

    if (!slug) {
      return NextResponse.json(
        { error: "No se pudo generar el slug del curso." },
        { status: 400 }
      );
    }

    const nuevoCurso = {
      titulo: curso.titulo,
      slug,
      descripcion: curso.descripcion || "",
      categoria: curso.categoria || "",
      precio: curso.precio || "",
      duracion: curso.duracion || "",
      modalidad: curso.modalidad || "",
      imagen_url: curso.imagen_url || "",
      activo: Boolean(curso.activo),
      destacado: Boolean(curso.destacado),
    };

    const { data, error } = await supabaseAdmin
      .from("cursos")
      .insert(nuevoCurso)
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
      curso: data,
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
    const curso = body?.curso;

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID del curso." },
        { status: 400 }
      );
    }

    if (!curso?.titulo) {
      return NextResponse.json(
        { error: "El título del curso es obligatorio." },
        { status: 400 }
      );
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const slug = limpiarSlug(curso.slug || curso.titulo);

    if (!slug) {
      return NextResponse.json(
        { error: "No se pudo generar el slug del curso." },
        { status: 400 }
      );
    }

    const cursoActualizado = {
      titulo: curso.titulo,
      slug,
      descripcion: curso.descripcion || "",
      categoria: curso.categoria || "",
      precio: curso.precio || "",
      duracion: curso.duracion || "",
      modalidad: curso.modalidad || "",
      imagen_url: curso.imagen_url || "",
      activo: Boolean(curso.activo),
      destacado: Boolean(curso.destacado),
    };

    const { data, error } = await supabaseAdmin
      .from("cursos")
      .update(cursoActualizado)
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
      curso: data,
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
        { error: "Falta el ID del curso." },
        { status: 400 }
      );
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { error } = await supabaseAdmin
      .from("cursos")
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