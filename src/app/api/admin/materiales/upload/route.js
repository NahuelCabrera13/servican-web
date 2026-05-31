import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

const BUCKET_MATERIALES = "materiales-cursos";

const TIPOS_PERMITIDOS = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const EXTENSIONES_PERMITIDAS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
];

const MAXIMO_MB = 25;
const MAXIMO_BYTES = MAXIMO_MB * 1024 * 1024;

const CAMPOS_CLASE = `
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

function limpiarSlug(slug) {
  return String(slug || "curso")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "curso";
}

function limpiarNombreArchivo(nombre) {
  const nombreLimpio = String(nombre || "archivo")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 160);

  return nombreLimpio || "archivo";
}

function obtenerExtension(nombre) {
  const nombreLimpio = String(nombre || "").toLowerCase();
  const punto = nombreLimpio.lastIndexOf(".");

  if (punto === -1) return "";

  return nombreLimpio.slice(punto);
}

function archivoPermitido(archivo) {
  const extension = obtenerExtension(archivo.name);

  const tipoPermitido = TIPOS_PERMITIDOS.includes(archivo.type);
  const extensionPermitida = EXTENSIONES_PERMITIDAS.includes(extension);

  return tipoPermitido && extensionPermitida;
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

export async function POST(request) {
  try {
    const admin = await verificarAdmin();

    if (!admin.ok) {
      return crearRespuestaError(admin.error, admin.status);
    }

    const formData = await request.formData();

    const archivo = formData.get("archivo");
    const claseId = validarId(formData.get("clase_id"));
    const slug = limpiarSlug(formData.get("slug"));

    if (!archivo || typeof archivo === "string") {
      return crearRespuestaError("No se recibió ningún archivo.", 400);
    }

    if (!claseId) {
      return crearRespuestaError("ID de clase inválido.", 400);
    }

    if (!archivo.name) {
      return crearRespuestaError("El archivo no tiene nombre válido.", 400);
    }

    if (!archivo.type) {
      return crearRespuestaError("El archivo no tiene un tipo válido.", 400);
    }

    if (archivo.size <= 0) {
      return crearRespuestaError("El archivo está vacío.", 400);
    }

    if (archivo.size > MAXIMO_BYTES) {
      return crearRespuestaError(
        `El archivo no puede superar ${MAXIMO_MB} MB.`,
        400
      );
    }

    if (!archivoPermitido(archivo)) {
      return crearRespuestaError(
        "Tipo de archivo no permitido. Subí PDF, imagen, Word o Excel.",
        400
      );
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { data: clase, error: errorClase } = await supabaseAdmin
      .from("curso_clases")
      .select(`
        id,
        pdf_url,
        modulo:curso_modulos (
          id,
          curso_id
        )
      `)
      .eq("id", claseId)
      .single();

    if (errorClase || !clase) {
      return crearRespuestaError("No se encontró la clase.", 404);
    }

    const nombreLimpio = limpiarNombreArchivo(archivo.name);
    const extension = obtenerExtension(nombreLimpio);
    const timestamp = Date.now();

    const nombreFinal = extension
      ? `${timestamp}-${nombreLimpio}`
      : `${timestamp}-${nombreLimpio}.bin`;

    const rutaArchivo = `${slug}/clase-${claseId}/${nombreFinal}`;

    const bytes = await archivo.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { error: errorUpload } = await supabaseAdmin.storage
      .from(BUCKET_MATERIALES)
      .upload(rutaArchivo, buffer, {
        contentType: archivo.type,
        upsert: false,
      });

    if (errorUpload) {
      return crearRespuestaError("No se pudo subir el material.", 500);
    }

    const { data: claseActualizada, error: errorActualizar } =
      await supabaseAdmin
        .from("curso_clases")
        .update({
          pdf_url: rutaArchivo,
        })
        .eq("id", claseId)
        .select(CAMPOS_CLASE)
        .single();

    if (errorActualizar || !claseActualizada) {
      await supabaseAdmin.storage
        .from(BUCKET_MATERIALES)
        .remove([rutaArchivo]);

      return crearRespuestaError(
        "El archivo subió, pero no se pudo asociar a la clase.",
        500
      );
    }

    return NextResponse.json({
      ok: true,
      ruta: rutaArchivo,
      clase: claseActualizada,
    });
  } catch (error) {
    return crearRespuestaError("Error interno del servidor.", 500);
  }
}