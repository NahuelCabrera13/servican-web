import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

const BUCKET_MATERIALES = "materiales-cursos";

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

function limpiarNombreArchivo(nombre) {
  return String(nombre || "archivo")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
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

    const formData = await request.formData();

    const archivo = formData.get("archivo");
    const claseId = formData.get("clase_id");
    const slug = formData.get("slug") || "curso";

    if (!archivo || typeof archivo === "string") {
      return NextResponse.json(
        { error: "No se recibió ningún archivo." },
        { status: 400 }
      );
    }

    if (!claseId) {
      return NextResponse.json(
        { error: "Falta el ID de la clase." },
        { status: 400 }
      );
    }

    const tiposPermitidos = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!tiposPermitidos.includes(archivo.type)) {
      return NextResponse.json(
        {
          error:
            "Tipo de archivo no permitido. Subí PDF, imagen, Word o Excel.",
        },
        { status: 400 }
      );
    }

    const maximoMB = 25;
    const maximoBytes = maximoMB * 1024 * 1024;

    if (archivo.size > maximoBytes) {
      return NextResponse.json(
        { error: `El archivo no puede superar ${maximoMB} MB.` },
        { status: 400 }
      );
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { data: clase, error: errorClase } = await supabaseAdmin
      .from("curso_clases")
      .select(`
        id,
        modulo:curso_modulos (
          id,
          curso_id
        )
      `)
      .eq("id", Number(claseId))
      .single();

    if (errorClase || !clase) {
      return NextResponse.json(
        { error: "No se encontró la clase." },
        { status: 404 }
      );
    }

    const bytes = await archivo.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const nombreLimpio = limpiarNombreArchivo(archivo.name);
    const timestamp = Date.now();

    const rutaArchivo = `${slug}/clase-${claseId}/${timestamp}-${nombreLimpio}`;

    const { error: errorUpload } = await supabaseAdmin.storage
      .from(BUCKET_MATERIALES)
      .upload(rutaArchivo, buffer, {
        contentType: archivo.type,
        upsert: false,
      });

    if (errorUpload) {
      return NextResponse.json(
        { error: errorUpload.message },
        { status: 500 }
      );
    }

    const { data: claseActualizada, error: errorActualizar } =
      await supabaseAdmin
        .from("curso_clases")
        .update({
          pdf_url: rutaArchivo,
        })
        .eq("id", Number(claseId))
        .select("*")
        .single();

    if (errorActualizar) {
      return NextResponse.json(
        { error: errorActualizar.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      ruta: rutaArchivo,
      clase: claseActualizada,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}