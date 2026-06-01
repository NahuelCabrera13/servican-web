import { NextResponse } from "next/server";
import { verificarAdmin } from "@/lib/admin/verificarAdmin";

export const dynamic = "force-dynamic";

const BUCKET_NOTICIAS = "noticias";
const MAXIMO_MB = 10;
const MAXIMO_BYTES = MAXIMO_MB * 1024 * 1024;

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];

function crearRespuestaError(mensaje, status = 500) {
  return NextResponse.json(
    {
      ok: false,
      error: mensaje,
    },
    { status }
  );
}

function extensionDesdeTipo(tipo) {
  if (tipo === "image/png") return "png";
  if (tipo === "image/webp") return "webp";
  return "jpg";
}

export async function POST(request) {
  try {
    const admin = await verificarAdmin(request);

    if (!admin.ok) {
      return crearRespuestaError(admin.error, admin.status);
    }

    const supabase = admin.supabase;

    const formData = await request.formData();
    const archivo = formData.get("archivo");

    if (!archivo || typeof archivo === "string") {
      return crearRespuestaError("No se recibió ningún archivo.", 400);
    }

    if (!archivo.type) {
      return crearRespuestaError("El archivo no tiene un tipo válido.", 400);
    }

    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      return crearRespuestaError(
        "El archivo debe ser una imagen JPG, PNG o WEBP.",
        400
      );
    }

    if (archivo.size <= 0) {
      return crearRespuestaError("La imagen está vacía.", 400);
    }

    if (archivo.size > MAXIMO_BYTES) {
      return crearRespuestaError(
        `La imagen no puede superar ${MAXIMO_MB} MB.`,
        400
      );
    }

    const extension = extensionDesdeTipo(archivo.type);
    const nombreArchivo = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const ruta = `noticias/${nombreArchivo}`;

    const bytes = await archivo.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { error: errorUpload } = await supabase.storage
      .from(BUCKET_NOTICIAS)
      .upload(ruta, buffer, {
        contentType: archivo.type,
        upsert: false,
      });

    if (errorUpload) {
      console.error("Error subiendo imagen de noticia:", errorUpload);

      return crearRespuestaError(
        "No se pudo subir la imagen. Revisá que exista el bucket noticias.",
        500
      );
    }

    const { data } = supabase.storage.from(BUCKET_NOTICIAS).getPublicUrl(ruta);

    return NextResponse.json({
      ok: true,
      url: data.publicUrl,
      ruta,
    });
  } catch (error) {
    console.error("Error POST /api/admin/noticias/upload:", error);

    return crearRespuestaError(
      error?.message || "Error subiendo imagen.",
      500
    );
  }
}