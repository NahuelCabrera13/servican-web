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

async function obtenerMembresiaActiva(supabaseAdmin, userId) {
  const ahora = new Date().toISOString();

  const { data, error } = await supabaseAdmin
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
      mercadopago_status,
      proximo_cobro_at,
      updated_at
    `
    )
    .eq("user_id", userId)
    .eq("estado", "activa")
    .or(`fecha_fin.is.null,fecha_fin.gt.${ahora}`)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo verificar la membresía: ${error.message}`);
  }

  return data;
}

async function obtenerContenidos(supabaseAdmin) {
  const { data, error } = await supabaseAdmin
    .from("membresia_contenidos")
    .select(
      `
      id,
      titulo,
      descripcion,
      tipo,
      url,
      portada_url,
      activo,
      destacado,
      orden,
      fecha_publicacion,
      created_at,
      updated_at
    `
    )
    .eq("activo", true)
    .order("destacado", { ascending: false })
    .order("orden", { ascending: true })
    .order("fecha_publicacion", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron cargar contenidos: ${error.message}`);
  }

  return data || [];
}

export async function GET() {
  try {
    const usuario = await obtenerUsuarioActual();

    if (!usuario) {
      return NextResponse.json(
        {
          ok: false,
          error: "Tenés que iniciar sesión para ver la galería privada.",
        },
        { status: 401 }
      );
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const membresia = await obtenerMembresiaActiva(
      supabaseAdmin,
      usuario.id
    );

    if (!membresia) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Necesitás una membresía activa para acceder a la galería privada.",
          requiere_membresia_activa: true,
          membresia: null,
          contenidos: [],
        },
        { status: 403 }
      );
    }

    const contenidos = await obtenerContenidos(supabaseAdmin);

    return NextResponse.json({
      ok: true,
      membresia,
      contenidos,
      total: contenidos.length,
    });
  } catch (error) {
    console.error("Error cargando galería privada:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "No se pudo cargar la galería privada.",
      },
      { status: 500 }
    );
  }
}