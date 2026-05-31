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

export async function GET(request) {
  try {
    const admin = await verificarAdmin();

    if (!admin.ok) {
      return NextResponse.json(
        { error: admin.error },
        { status: admin.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Falta el slug del curso." },
        { status: 400 }
      );
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { data: curso, error: errorCurso } = await supabaseAdmin
      .from("cursos")
      .select("*")
      .eq("slug", slug)
      .single();

    if (errorCurso || !curso) {
      return NextResponse.json(
        { error: "Curso no encontrado." },
        { status: 404 }
      );
    }

    const { data: modulos, error: errorModulos } = await supabaseAdmin
      .from("curso_modulos")
      .select(`
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
      `)
      .eq("curso_id", curso.id)
      .order("orden", { ascending: true })
      .order("orden", {
        referencedTable: "curso_clases",
        ascending: true,
      });

    if (errorModulos) {
      return NextResponse.json(
        { error: errorModulos.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      curso,
      modulos: modulos || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const admin = await verificarAdmin();

    if (!admin.ok) {
      return NextResponse.json(
        { error: admin.error },
        { status: admin.status }
      );
    }

    const body = await request.json();
    const tipo = body?.tipo;

    const supabaseAdmin = crearSupabaseAdmin();

    if (tipo === "modulo") {
      const modulo = body?.modulo;

      if (!modulo?.curso_id || !modulo?.titulo) {
        return NextResponse.json(
          { error: "Faltan datos del módulo." },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("curso_modulos")
        .insert({
          curso_id: modulo.curso_id,
          titulo: modulo.titulo,
          descripcion: modulo.descripcion || "",
          orden: Number(modulo.orden || 1),
          activo: Boolean(modulo.activo),
        })
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
        modulo: data,
      });
    }

    if (tipo === "clase") {
      const clase = body?.clase;

      if (!clase?.modulo_id || !clase?.titulo) {
        return NextResponse.json(
          { error: "Faltan datos de la clase." },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("curso_clases")
        .insert({
          modulo_id: clase.modulo_id,
          titulo: clase.titulo,
          descripcion: clase.descripcion || "",
          video_url: clase.video_url || "",
          pdf_url: clase.pdf_url || "",
          contenido: clase.contenido || "",
          orden: Number(clase.orden || 1),
          activo: Boolean(clase.activo),
        })
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
        clase: data,
      });
    }

    return NextResponse.json(
      { error: "Tipo de contenido inválido." },
      { status: 400 }
    );
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
    const tipo = body?.tipo;
    const id = body?.id;

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID." },
        { status: 400 }
      );
    }

    const supabaseAdmin = crearSupabaseAdmin();

    if (tipo === "modulo") {
      const modulo = body?.modulo;

      const { data, error } = await supabaseAdmin
        .from("curso_modulos")
        .update({
          titulo: modulo.titulo,
          descripcion: modulo.descripcion || "",
          orden: Number(modulo.orden || 1),
          activo: Boolean(modulo.activo),
        })
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
        modulo: data,
      });
    }

    if (tipo === "clase") {
      const clase = body?.clase;

      const { data, error } = await supabaseAdmin
        .from("curso_clases")
        .update({
          titulo: clase.titulo,
          descripcion: clase.descripcion || "",
          video_url: clase.video_url || "",
          pdf_url: clase.pdf_url || "",
          contenido: clase.contenido || "",
          orden: Number(clase.orden || 1),
          activo: Boolean(clase.activo),
        })
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
        clase: data,
      });
    }

    return NextResponse.json(
      { error: "Tipo inválido." },
      { status: 400 }
    );
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
    const tipo = body?.tipo;
    const id = body?.id;

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID." },
        { status: 400 }
      );
    }

    const supabaseAdmin = crearSupabaseAdmin();

    if (tipo === "modulo") {
      const { error } = await supabaseAdmin
        .from("curso_modulos")
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
    }

    if (tipo === "clase") {
      const { error } = await supabaseAdmin
        .from("curso_clases")
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
    }

    return NextResponse.json(
      { error: "Tipo inválido." },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}