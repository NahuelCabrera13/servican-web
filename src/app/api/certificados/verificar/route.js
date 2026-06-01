import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function crearSupabasePublico() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Faltan variables públicas de Supabase.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
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
  return String(codigo || "").trim().toUpperCase();
}

function ocultarNombre(nombre) {
  if (!nombre) return "Alumno SERVICAN";

  const partes = String(nombre).trim().split(" ").filter(Boolean);

  if (partes.length === 0) {
    return "Alumno SERVICAN";
  }

  if (partes.length === 1) {
    return `${partes[0][0]?.toUpperCase() || ""}.`;
  }

  const primerNombre = partes[0];
  const primerApellido = partes[1];

  return `${primerNombre} ${primerApellido[0]?.toUpperCase() || ""}.`;
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

    const supabase = crearSupabasePublico();

    const { data: certificado, error } = await supabase
      .from("certificados_publicos")
      .select(
        `
        codigo,
        nombre_alumno,
        titulo_curso,
        estado,
        emitido_at,
        created_at
      `
      )
      .eq("codigo", codigo)
      .maybeSingle();

    if (error) {
      console.error("Error verificando certificado público:", error);

      return NextResponse.json(
        { ok: false, error: "No se pudo verificar el certificado." },
        { status: 500 }
      );
    }

    if (!certificado) {
      return NextResponse.json({
        ok: true,
        encontrado: false,
        mensaje: "No se encontró ningún certificado con ese código.",
      });
    }

    if (certificado.estado !== "emitido") {
      return NextResponse.json({
        ok: true,
        encontrado: false,
        mensaje:
          "El certificado no está disponible como válido. Puede estar anulado o no habilitado.",
      });
    }

    return NextResponse.json({
      ok: true,
      encontrado: true,
      certificado: {
        codigo: certificado.codigo,
        alumno: ocultarNombre(certificado.nombre_alumno),
        curso: certificado.titulo_curso || "Curso SERVICAN",
        estado: certificado.estado,
        emitido_at: certificado.emitido_at || certificado.created_at || null,
        emisor: "SERVICAN Uruguay",
      },
    });
  } catch (error) {
    console.error("Error POST /api/certificados/verificar:", error);

    return NextResponse.json(
      { ok: false, error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}