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
      error: `No tenés permisos de administrador. Rol actual: ${perfil.role || "sin rol"}`,
    };
  }

  return {
    ok: true,
    perfil,
  };
}

async function obtenerPerfilesPorUsuarios(supabaseAdmin, userIds) {
  const idsUnicos = [...new Set((userIds || []).filter(Boolean))];

  if (idsUnicos.length === 0) {
    return {};
  }

  const { data, error } = await supabaseAdmin
    .from("perfiles")
    .select("user_id, email, nombre, role")
    .in("user_id", idsUnicos);

  if (error) {
    throw new Error(`No se pudieron cargar perfiles: ${error.message}`);
  }

  const mapa = {};

  for (const perfil of data || []) {
    mapa[perfil.user_id] = perfil;
  }

  return mapa;
}

export async function GET(request) {
  try {
    const usuario = await obtenerUsuarioActual();

    if (!usuario) {
      return NextResponse.json(
        {
          ok: false,
          error: "Tenés que iniciar sesión como administrador.",
        },
        { status: 401 }
      );
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const admin = await verificarAdmin(supabaseAdmin, usuario.id);

    if (!admin.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: admin.error,
        },
        { status: admin.status }
      );
    }

    const url = new URL(request.url);
    const estado = url.searchParams.get("estado");

    let consulta = supabaseAdmin
      .from("membresias_accesos")
      .select(
        `
        id,
        user_id,
        estado,
        fecha_inicio,
        fecha_fin,
        descuento_porcentaje,
        curso_pequeno_disponible,
        curso_pequeno_usado,
        mercadopago_preapproval_id,
        mercadopago_status,
        ultimo_pago_id,
        ultimo_pago_estado,
        proximo_cobro_at,
        cancelada_at,
        detalle,
        created_at,
        updated_at
      `
      )
      .order("updated_at", { ascending: false })
      .limit(100);

    if (estado && estado !== "todas") {
      consulta = consulta.eq("estado", estado);
    }

    const { data: membresias, error } = await consulta;

    if (error) {
      throw new Error(`No se pudieron cargar membresías: ${error.message}`);
    }

    const perfilesPorUsuario = await obtenerPerfilesPorUsuarios(
      supabaseAdmin,
      (membresias || []).map((membresia) => membresia.user_id)
    );

    const membresiasConPerfil = (membresias || []).map((membresia) => ({
      ...membresia,
      perfil: perfilesPorUsuario[membresia.user_id] || null,
    }));

    return NextResponse.json({
      ok: true,
      membresias: membresiasConPerfil,
      total: membresiasConPerfil.length,
    });
  } catch (error) {
    console.error("Error cargando membresías admin:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "No se pudieron cargar las membresías.",
      },
      { status: 500 }
    );
  }
}