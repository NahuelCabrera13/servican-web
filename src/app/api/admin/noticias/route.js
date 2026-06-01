import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function limpiarTexto(valor) {
  return String(valor || "").trim();
}

function crearSlug(texto) {
  return limpiarTexto(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function obtenerUsuarioAdmin(request, supabase) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.replace("Bearer ", "").trim();

  if (!token) {
    return {
      ok: false,
      status: 401,
      error: "No hay token de sesión.",
    };
  }

  const {
    data: { user },
    error: errorUsuario,
  } = await supabase.auth.getUser(token);

  if (errorUsuario || !user) {
    return {
      ok: false,
      status: 401,
      error: "Sesión inválida o expirada.",
    };
  }

  const { data: perfil, error: errorPerfil } = await supabase
    .from("perfiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (errorPerfil || perfil?.role !== "admin") {
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

function normalizarNoticia(body) {
  const titulo = limpiarTexto(body?.titulo);
  const slug = crearSlug(body?.slug || titulo);

  return {
    titulo,
    slug,
    encabezado: limpiarTexto(body?.encabezado),
    contenido: limpiarTexto(body?.contenido),
    imagen_url: limpiarTexto(body?.imagen_url),
    categoria: limpiarTexto(body?.categoria) || "General",
    autor: limpiarTexto(body?.autor) || "SERVICAN",
    publicada: Boolean(body?.publicada),
    destacada: Boolean(body?.destacada),
    orden: Number(body?.orden || 0),
    fecha_publicacion: body?.fecha_publicacion || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function GET(request) {
  try {
    const supabase = createAdminClient();

    const admin = await obtenerUsuarioAdmin(request, supabase);

    if (!admin.ok) {
      return NextResponse.json(
        {
          error: admin.error,
        },
        { status: admin.status }
      );
    }

    const { data, error } = await supabase
      .from("noticias")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error listando noticias:", error);

      return NextResponse.json(
        {
          error: "No se pudieron cargar las noticias.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      noticias: data || [],
    });
  } catch (error) {
    console.error("Error GET /api/admin/noticias:", error);

    return NextResponse.json(
      {
        error: error?.message || "Error cargando noticias.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const supabase = createAdminClient();

    const admin = await obtenerUsuarioAdmin(request, supabase);

    if (!admin.ok) {
      return NextResponse.json(
        {
          error: admin.error,
        },
        { status: admin.status }
      );
    }

    const body = await request.json();
    const noticia = normalizarNoticia(body);

    if (!noticia.titulo) {
      return NextResponse.json(
        {
          error: "El título es obligatorio.",
        },
        { status: 400 }
      );
    }

    if (!noticia.slug) {
      return NextResponse.json(
        {
          error: "No se pudo generar el slug de la noticia.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("noticias")
      .insert([noticia])
      .select("*")
      .single();

    if (error) {
      console.error("Error creando noticia:", error);

      return NextResponse.json(
        {
          error:
            error.code === "23505"
              ? "Ya existe una noticia con ese slug."
              : "No se pudo crear la noticia.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      noticia: data,
    });
  } catch (error) {
    console.error("Error POST /api/admin/noticias:", error);

    return NextResponse.json(
      {
        error: error?.message || "Error creando noticia.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const supabase = createAdminClient();

    const admin = await obtenerUsuarioAdmin(request, supabase);

    if (!admin.ok) {
      return NextResponse.json(
        {
          error: admin.error,
        },
        { status: admin.status }
      );
    }

    const body = await request.json();
    const id = body?.id;

    if (!id) {
      return NextResponse.json(
        {
          error: "Falta el ID de la noticia.",
        },
        { status: 400 }
      );
    }

    const noticia = normalizarNoticia(body);

    if (!noticia.titulo) {
      return NextResponse.json(
        {
          error: "El título es obligatorio.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("noticias")
      .update(noticia)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Error actualizando noticia:", error);

      return NextResponse.json(
        {
          error:
            error.code === "23505"
              ? "Ya existe una noticia con ese slug."
              : "No se pudo actualizar la noticia.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      noticia: data,
    });
  } catch (error) {
    console.error("Error PATCH /api/admin/noticias:", error);

    return NextResponse.json(
      {
        error: error?.message || "Error actualizando noticia.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const supabase = createAdminClient();

    const admin = await obtenerUsuarioAdmin(request, supabase);

    if (!admin.ok) {
      return NextResponse.json(
        {
          error: admin.error,
        },
        { status: admin.status }
      );
    }

    const body = await request.json();
    const id = body?.id;

    if (!id) {
      return NextResponse.json(
        {
          error: "Falta el ID de la noticia.",
        },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("noticias").delete().eq("id", id);

    if (error) {
      console.error("Error eliminando noticia:", error);

      return NextResponse.json(
        {
          error: "No se pudo eliminar la noticia.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Error DELETE /api/admin/noticias:", error);

    return NextResponse.json(
      {
        error: error?.message || "Error eliminando noticia.",
      },
      { status: 500 }
    );
  }
}