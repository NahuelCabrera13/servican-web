import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function crearSupabasePublico() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Faltan variables públicas de Supabase.");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

function ocultarNombre(nombre) {
  if (!nombre) return "Alumno SERVICAN";

  const partes = nombre.trim().split(" ").filter(Boolean);

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

    const codigo = String(body?.codigo || "")
      .trim()
      .toUpperCase();

    if (!codigo) {
      return NextResponse.json(
        { error: "Ingresá un código de certificado." },
        { status: 400 }
      );
    }

    const supabase = crearSupabasePublico();

    const { data: certificado, error } = await supabase
      .from("certificados_publicos")
      .select(`
        codigo,
        nombre_alumno,
        titulo_curso,
        estado,
        emitido_at
      `)
      .eq("codigo", codigo)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "No se pudo verificar el certificado." },
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

    return NextResponse.json({
      ok: true,
      encontrado: true,
      certificado: {
        codigo: certificado.codigo,
        alumno: ocultarNombre(certificado.nombre_alumno),
        curso: certificado.titulo_curso,
        estado: certificado.estado,
        emitido_at: certificado.emitido_at,
        emisor: "SERVICAN",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}