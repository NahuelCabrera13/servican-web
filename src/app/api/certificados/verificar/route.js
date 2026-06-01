import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function crearSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Faltan variables de entorno de Supabase.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function codigoValido(codigo) {
  if (!codigo) return false;

  const codigoLimpio = String(codigo).trim();

  if (codigoLimpio.length < 6) return false;
  if (codigoLimpio.length > 120) return false;

  return /^[a-zA-Z0-9._-]+$/.test(codigoLimpio);
}

function limpiarCodigo(codigo) {
  return String(codigo || "").trim();
}

function ocultarNombre(nombre) {
  if (!nombre) return "Alumno SERVICAN";

  const partes = String(nombre).trim().split(" ").filter(Boolean);

  if (partes.length === 0) {
    return "Alumno SERVICAN";
  }

  if (partes.length === 1) {
    const inicial = partes[0][0]?.toUpperCase() || "";
    return `${inicial}.`;
  }

  const primerNombre = partes[0];
  const primerApellido = partes[1];

  return `${primerNombre} ${primerApellido[0]?.toUpperCase() || ""}.`;
}

function normalizarEstado(estado) {
  const valor = String(estado || "").toLowerCase().trim();

  if (valor === "anulado") return "anulado";

  return "emitido";
}

export async function POST(request) {
  try {
    const body = await request.json();

    const codigo = limpiarCodigo(body?.codigo);

    if (!codigo) {
      return NextResponse.json(
        { ok: false, error: "Ingresá un código de certificado." },
        { status: 400 }
      );
    }

    if (!codigoValido(codigo)) {
      return NextResponse.json(
        { ok: false, error: "El código ingresado no tiene un formato válido." },
        { status: 400 }
      );
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { data: certificados, error } = await supabaseAdmin
      .from("certificados")
      .select(
        `
        id,
        codigo,
        nombre_alumno,
        titulo_curso,
        estado,
        emitido_at,
        created_at
      `
      )
      .ilike("codigo", codigo)
      .limit(1);

    if (error) {
      console.error("Error verificando certificado:", error);

      return NextResponse.json(
        {
          ok: false,
          error: `No se pudo verificar el certificado: ${error.message}`,
        },
        { status: 500 }
      );
    }

    const certificado = certificados?.[0] || null;

    if (!certificado) {
      return NextResponse.json({
        ok: true,
        encontrado: false,
        mensaje: "No se encontró ningún certificado con ese código.",
      });
    }

    const estado = normalizarEstado(certificado.estado);

    return NextResponse.json({
      ok: true,
      encontrado: true,
      certificado: {
        codigo: certificado.codigo,
        alumno: ocultarNombre(certificado.nombre_alumno),
        curso: certificado.titulo_curso || "Curso SERVICAN",
        estado,
        emitido_at: certificado.emitido_at || certificado.created_at || null,
        emisor: "SERVICAN Uruguay",
      },
    });
  } catch (error) {
    console.error("Error POST /api/certificados/verificar:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error?.message ||
          "Error interno del servidor al verificar el certificado.",
      },
      { status: 500 }
    );
  }
}