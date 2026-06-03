import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function GET() {
  try {
    const usuario = await obtenerUsuarioActual();

    if (!usuario) {
      return NextResponse.json(
        {
          ok: false,
          error: "Tenés que iniciar sesión para ver tu membresía.",
        },
        { status: 401 }
      );
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { data: membresia, error } = await supabaseAdmin
      .from("membresias_accesos")
      .select(
        `
        id,
        estado,
        fecha_inicio,
        fecha_fin,
        descuento_porcentaje,
        curso_pequeno_disponible,
        curso_pequeno_usado,
        mercadopago_preapproval_id,
        mercadopago_status,
        ultimo_pago_estado,
        proximo_cobro_at,
        cancelada_at,
        updated_at
      `
      )
      .eq("user_id", usuario.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      ok: true,
      tiene_membresia: Boolean(membresia),
      membresia,
    });
  } catch (error) {
    console.error("Error consultando estado de membresía:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error?.message || "No se pudo consultar el estado de la membresía.",
      },
      { status: 500 }
    );
  }
}