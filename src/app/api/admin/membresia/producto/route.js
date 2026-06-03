import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG_MEMBRESIA = "membresia-mensual-servican";

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

async function validarAdmin() {
  const usuario = await obtenerUsuarioActual();

  if (!usuario) {
    return {
      ok: false,
      status: 401,
      error: "Tenés que iniciar sesión como administrador.",
      supabaseAdmin: null,
      usuario: null,
    };
  }

  const supabaseAdmin = crearSupabaseAdmin();
  const admin = await verificarAdmin(supabaseAdmin, usuario.id);

  if (!admin.ok) {
    return {
      ...admin,
      supabaseAdmin: null,
      usuario,
    };
  }

  return {
    ok: true,
    status: 200,
    supabaseAdmin,
    usuario,
    perfil: admin.perfil,
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

function normalizarTexto(valor, fallback = "") {
  return String(valor ?? fallback).trim();
}

function normalizarPrecio(valor) {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return null;
  }

  return Math.round(numero * 100) / 100;
}

function normalizarBoolean(valor) {
  return Boolean(valor);
}

async function obtenerProductoMembresia(supabaseAdmin) {
  const { data, error } = await supabaseAdmin
    .from("productos")
    .select(
      `
      id,
      nombre,
      slug,
      descripcion,
      tipo_producto,
      plan,
      precio,
      moneda,
      cantidad_maxima_usuarios,
      requiere_participantes,
      requiere_correos_registrados,
      es_recurrente,
      activo,
      visible_en_web,
      destacado,
      orden,
      texto_boton,
      created_at,
      updated_at
    `
    )
    .eq("slug", SLUG_MEMBRESIA)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar el producto: ${error.message}`);
  }

  return data;
}

export async function GET() {
  try {
    const admin = await validarAdmin();

    if (!admin.ok) {
      return respuestaError(admin.error, admin.status);
    }

    const producto = await obtenerProductoMembresia(admin.supabaseAdmin);

    return NextResponse.json({
      ok: true,
      producto,
    });
  } catch (error) {
    console.error("Error cargando producto membresía:", error);

    return respuestaError(
      error?.message || "No se pudo cargar el producto de membresía.",
      500
    );
  }
}

export async function PATCH(request) {
  try {
    const admin = await validarAdmin();

    if (!admin.ok) {
      return respuestaError(admin.error, admin.status);
    }

    const body = await request.json().catch(() => ({}));

    const precio = normalizarPrecio(body.precio);

    if (precio === null || precio <= 0) {
      return respuestaError("El precio debe ser un número mayor a 0.", 400);
    }

    const nombre = normalizarTexto(
      body.nombre,
      "Membresía mensual SERVICAN"
    );

    const descripcion = normalizarTexto(body.descripcion);

    const textoBoton = normalizarTexto(
      body.texto_boton,
      "Contratar membresía mensual"
    );

    const moneda = normalizarTexto(body.moneda, "UYU").toUpperCase();

    if (!["UYU", "USD"].includes(moneda)) {
      return respuestaError("La moneda debe ser UYU o USD.", 400);
    }

    const datos = {
      nombre,
      descripcion,
      precio,
      moneda,
      texto_boton: textoBoton,
      activo: normalizarBoolean(body.activo),
      visible_en_web: normalizarBoolean(body.visible_en_web),
      destacado: normalizarBoolean(body.destacado),
      tipo_producto: "membresia",
      plan: "mensual",
      curso_id: null,
      cantidad_maxima_usuarios: 1,
      requiere_participantes: false,
      requiere_correos_registrados: false,
      es_recurrente: true,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await admin.supabaseAdmin
      .from("productos")
      .update(datos)
      .eq("slug", SLUG_MEMBRESIA)
      .select(
        `
        id,
        nombre,
        slug,
        descripcion,
        tipo_producto,
        plan,
        precio,
        moneda,
        es_recurrente,
        activo,
        visible_en_web,
        destacado,
        texto_boton,
        updated_at
      `
      )
      .single();

    if (error) {
      throw new Error(`No se pudo actualizar el producto: ${error.message}`);
    }

    return NextResponse.json({
      ok: true,
      producto: data,
    });
  } catch (error) {
    console.error("Error actualizando producto membresía:", error);

    return respuestaError(
      error?.message || "No se pudo actualizar el producto de membresía.",
      500
    );
  }
}