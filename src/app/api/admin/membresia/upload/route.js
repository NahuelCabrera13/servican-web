import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET_MEMBRESIA = "membresia-galeria";
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const MIME_PERMITIDOS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",

  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/ogg": "ogg",

  "application/pdf": "pdf",
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
  "application/vnd.rar": "rar",
  "application/x-rar-compressed": "rar",

  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",

  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",

  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",
};

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

function limpiarNombreArchivo(nombre) {
  return String(nombre || "archivo")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
}

function obtenerExtensionDesdeNombre(nombre) {
  const texto = String(nombre || "").toLowerCase();
  const partes = texto.split(".");
  const extension = partes.length > 1 ? partes.pop() : "";

  return String(extension || "").replace(/[^a-z0-9]/g, "").slice(0, 10);
}

function obtenerExtensionArchivo(archivo) {
  const extensionMime = MIME_PERMITIDOS[archivo.type];

  if (extensionMime) {
    return extensionMime;
  }

  return obtenerExtensionDesdeNombre(archivo.name);
}

function obtenerCarpetaPorMime(mimeType) {
  const tipo = String(mimeType || "").toLowerCase();

  if (tipo.startsWith("image/")) {
    return "fotos";
  }

  if (tipo.startsWith("video/")) {
    return "videos";
  }

  return "archivos";
}

function validarArchivo(archivo) {
  if (!archivo || typeof archivo === "string") {
    return "Tenés que seleccionar un archivo.";
  }

  if (archivo.size > MAX_FILE_SIZE) {
    return "El archivo no puede superar los 50 MB.";
  }

  if (!MIME_PERMITIDOS[archivo.type]) {
    return "Formato no permitido. Podés subir imágenes, videos MP4/WEBM/OGG, PDF, documentos Office, ZIP o RAR.";
  }

  return "";
}

export async function POST(request) {
  try {
    const admin = await validarAdmin();

    if (!admin.ok) {
      return respuestaError(admin.error, admin.status);
    }

    const formData = await request.formData();
    const archivo = formData.get("archivo");

    const errorArchivo = validarArchivo(archivo);

    if (errorArchivo) {
      return respuestaError(errorArchivo, 400);
    }

    const extension = obtenerExtensionArchivo(archivo);

    if (!extension) {
      return respuestaError("No se pudo detectar la extensión del archivo.", 400);
    }

    const bytes = await archivo.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const carpeta = obtenerCarpetaPorMime(archivo.type);
    const nombreBase = limpiarNombreArchivo(archivo.name);
    const nombreFinal = `${Date.now()}-${crypto.randomUUID()}-${nombreBase}`;
    const nombreConExtension = nombreFinal.endsWith(`.${extension}`)
      ? nombreFinal
      : `${nombreFinal}.${extension}`;
    const rutaStorage = `${carpeta}/${nombreConExtension}`;

    const { error: uploadError } = await admin.supabaseAdmin.storage
      .from(BUCKET_MEMBRESIA)
      .upload(rutaStorage, buffer, {
        contentType: archivo.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`No se pudo subir el archivo: ${uploadError.message}`);
    }

    const { data: signedData, error: signedError } =
      await admin.supabaseAdmin.storage
        .from(BUCKET_MEMBRESIA)
        .createSignedUrl(rutaStorage, 60 * 60);

    if (signedError) {
      throw new Error(
        `El archivo se subió, pero no se pudo generar vista previa: ${signedError.message}`
      );
    }

    return NextResponse.json({
      ok: true,
      bucket: BUCKET_MEMBRESIA,
      path: rutaStorage,
      url: rutaStorage,
      preview_url: signedData?.signedUrl || "",
      mime_type: archivo.type,
      size: archivo.size,
    });
  } catch (error) {
    console.error("Error subiendo archivo de membresía:", error);

    return respuestaError(
      error?.message || "No se pudo subir el archivo.",
      500
    );
  }
}