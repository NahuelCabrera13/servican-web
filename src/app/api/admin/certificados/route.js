import { NextResponse } from "next/server";
import { verificarAdmin } from "@/lib/admin/verificarAdmin";

export const dynamic = "force-dynamic";

const ESTADOS_CERTIFICADO = ["emitido", "anulado"];

const CAMPOS_CERTIFICADO = `
  id,
  user_id,
  curso_id,
  codigo,
  nombre_alumno,
  email_alumno,
  titulo_curso,
  estado,
  emitido_at,
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

export async function GET(request) {
  try {
    const admin = await verificarAdmin(request);

    if (!admin.ok) {
      return crearRespuestaError(admin.error, admin.status);
    }

    const supabase = admin.supabase;

    const { data: certificados, error } = await supabase
      .from("certificados")
      .select(CAMPOS_CERTIFICADO)
      .order("emitido_at", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("Error cargando certificados:", error);

      return crearRespuestaError(
        "No se pudieron cargar los certificados.",
        500
      );
    }

    return NextResponse.json({
      ok: true,
      certificados: certificados || [],
    });
  } catch (error) {
    console.error("Error GET /api/admin/certificados:", error);

    return crearRespuestaError("Error interno del servidor.", 500);
  }
}

export async function PATCH(request) {
  try {
    const admin = await verificarAdmin(request);

    if (!admin.ok) {
      return crearRespuestaError(admin.error, admin.status);
    }

    const supabase = admin.supabase;

    const body = await request.json();

    const id = validarId(body?.id);
    const estado = String(body?.estado || "").trim();

    if (!id) {
      return crearRespuestaError("ID de certificado inválido.", 400);
    }

    if (!ESTADOS_CERTIFICADO.includes(estado)) {
      return crearRespuestaError("Estado no permitido.", 400);
    }

    const { data: certificadoExiste, error: errorExiste } = await supabase
      .from("certificados")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (errorExiste) {
      console.error("Error verificando certificado:", errorExiste);

      return crearRespuestaError(
        "No se pudo verificar el certificado.",
        500
      );
    }

    if (!certificadoExiste) {
      return crearRespuestaError("No se encontró el certificado.", 404);
    }

    const { data: certificado, error } = await supabase
      .from("certificados")
      .update({ estado })
      .eq("id", id)
      .select(CAMPOS_CERTIFICADO)
      .single();

    if (error || !certificado) {
      console.error("Error actualizando certificado:", error);

      return crearRespuestaError(
        "No se pudo actualizar el certificado.",
        500
      );
    }

    return NextResponse.json({
      ok: true,
      certificado,
    });
  } catch (error) {
    console.error("Error PATCH /api/admin/certificados:", error);

    return crearRespuestaError("Error interno del servidor.", 500);
  }
}