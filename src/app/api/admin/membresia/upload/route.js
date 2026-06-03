import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET_MEMBRESIA = "membresia-galeria";
const MAX_FILE_SIZE = 8 * 1024 * 1024;

function crearSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Faltan variables de entorno de Supabase Admin.");
  }

  return createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function obtenerUsuarioActual() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

async function verificarAdmin(supabaseAdmin, userId) {
  const { data: perfil, error } = await supabaseAdmin
    .from("perfiles")
    .select("user_id, email, nombre, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo verificar el perfil: ${error.message}`);
  }

  if (!perfil) {
    return {
      ok: false,
      status: 403,
      error: "Tu usuario no tiene perfil creado.",
    };
  }

  if (perfil.role !== "admin") {
    return {
      ok: false,
      status: 403,
      error: `No tenés permisos de administrador. Rol actual: ${
        perfil.role || "sin rol"
      }`,
    };
  }

  return {
    ok: true,
    perfil,
  };
}

async function validarAdmin() {
  const usuario = await obtenerUsuarioActual();

  if (!usuario) {
    return {
      ok: false,
      status: 401,
      error: "Tenés que iniciar sesión como administrador.",
      supabaseAdmin: null,
    };
  }

  const supabaseAdmin = crearSupabaseAdmin();
  const admin = await verificarAdmin(supabaseAdmin, usuario.id);

  if (!admin.ok) {
    return {
      ...admin,
      supabaseAdmin: null,
    };
  }

  return {
    ok: true,
    status: 200,
    usuario,
    perfil: admin.perfil,
    supabaseAdmin,
  };
}

function respuestaError(mensaje, status = 400) {
  return NextResponse.json(
    {
      ok: false,
      error: mensaje,
    },
    { status }
  );
}

function obtenerExtensionDesdeMime(mimeType) {
  const tipo = String(mimeType || "").toLowerCase();

  if (tipo === "image/jpeg") return "jpg";
  if (tipo === "image/png") return "png";
  if (tipo === "image/webp") return "webp";
  if (tipo === "image/gif") return "gif";

  return "";
}

function limpiarNombreArchivo(nombre) {
  return String(nombre || "foto")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
}

export async function POST(request) {
  try {
    const admin = await validarAdmin();

    if (!admin.ok) {
      return respuestaError(admin.error, admin.status);
    }

    const formData = await request.formData();
    const archivo = formData.get("archivo");

    if (!archivo || typeof archivo === "string") {
      return respuestaError("Tenés que seleccionar una imagen.", 400);
    }

    if (!archivo.type?.startsWith("image/")) {
      return respuestaError("Solo se permiten archivos de imagen.", 400);
    }

    if (archivo.size > MAX_FILE_SIZE) {
      return respuestaError("La imagen no puede superar los 8 MB.", 400);
    }

    const extension = obtenerExtensionDesdeMime(archivo.type);

    if (!extension) {
      return respuestaError(
        "Formato no permitido. Usá JPG, PNG, WEBP o GIF.",
        400
      );
    }

    const bytes = await archivo.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const nombreBase = limpiarNombreArchivo(archivo.name);
    const nombreFinal = `${Date.now()}-${crypto.randomUUID()}-${nombreBase}.${extension}`;
    const rutaStorage = `fotos/${nombreFinal}`;

    const { error: uploadError } = await admin.supabaseAdmin.storage
      .from(BUCKET_MEMBRESIA)
      .upload(rutaStorage, buffer, {
        contentType: archivo.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`No se pudo subir la imagen: ${uploadError.message}`);
    }

    const { data: signedData, error: signedError } =
      await admin.supabaseAdmin.storage
        .from(BUCKET_MEMBRESIA)
        .createSignedUrl(rutaStorage, 60 * 60);

    if (signedError) {
      throw new Error(
        `La imagen se subió, pero no se pudo generar vista previa: ${signedError.message}`
      );
    }

    return NextResponse.json({
      ok: true,
      bucket: BUCKET_MEMBRESIA,
      path: rutaStorage,
      url: rutaStorage,
      preview_url: signedData?.signedUrl || "",
    });
  } catch (error) {
    console.error("Error subiendo imagen de membresía:", error);

    return respuestaError(
      error?.message || "No se pudo subir la imagen.",
      500
    );
  }
}