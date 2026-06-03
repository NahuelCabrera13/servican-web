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
      error: `No tenés permisos de administrador. Rol actual: ${
        perfil.role || "sin rol"
      }`,
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
    };
  }

  const supabaseAdmin = crearSupabaseAdmin();
  const admin = await verificarAdmin(supabaseAdmin, usuario.id);

  if (!admin.ok) {
    return {
      ...admin,
      supabaseAdmin: null,
    };
  }

  return {
    ok: true,
    status: 200,
    usuario,
    perfil: admin.perfil,
    supabaseAdmin,
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

function limpiarTexto(valor) {
  return String(valor || "").trim();
}

function normalizarEstadoMercadoPago(status) {
  const estado = String(status || "").toLowerCase().trim();

  if (["authorized", "autorizado", "approved", "aprobado", "accredited"].includes(estado)) {
    return "activa";
  }

  if (["cancelled", "canceled", "cancelado", "finished", "finalizado"].includes(estado)) {
    return "cancelada";
  }

  return "pausada";
}

function calcularFechaFin(preapproval) {
  if (preapproval?.next_payment_date) {
    const fecha = new Date(preapproval.next_payment_date);

    if (!Number.isNaN(fecha.getTime())) {
      return fecha.toISOString();
    }
  }

  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 32);
  return fecha.toISOString();
}

async function consultarMercadoPago(path) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("Falta MERCADOPAGO_ACCESS_TOKEN.");
  }

  const respuesta = await fetch(`https://api.mercadopago.com${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Mercado Pago devolvió error al consultar ${path}.`
    );
  }

  return data;
}

async function buscarMembresia(supabaseAdmin, { id, preapprovalId }) {
  let consulta = supabaseAdmin
    .from("membresias_accesos")
    .select("*");

  if (id) {
    consulta = consulta.eq("id", id);
  } else if (preapprovalId) {
    consulta = consulta.eq("mercadopago_preapproval_id", preapprovalId);
  } else {
    throw new Error("Falta id o preapproval_id.");
  }

  const { data, error } = await consulta
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo buscar la membresía: ${error.message}`);
  }

  return data;
}

export async function POST(request) {
  try {
    const admin = await validarAdmin();

    if (!admin.ok) {
      return respuestaError(admin.error, admin.status);
    }

    const body = await request.json().catch(() => ({}));
    const id = limpiarTexto(body.id);
    const preapprovalIdBody = limpiarTexto(body.preapproval_id);

    const membresia = await buscarMembresia(admin.supabaseAdmin, {
      id,
      preapprovalId: preapprovalIdBody,
    });

    if (!membresia) {
      return respuestaError("No se encontró la membresía.", 404);
    }

    const preapprovalId =
      preapprovalIdBody || membresia.mercadopago_preapproval_id;

    if (!preapprovalId) {
      return respuestaError(
        "La membresía no tiene mercadopago_preapproval_id para sincronizar.",
        400
      );
    }

    const preapproval = await consultarMercadoPago(
      `/preapproval/${preapprovalId}`
    );

    const estadoMembresia = normalizarEstadoMercadoPago(preapproval.status);

    const detalle = {
      ...(membresia.detalle || {}),
      sincronizacion_manual_admin: {
        fecha: new Date().toISOString(),
        preapproval: {
          id: preapproval.id || preapprovalId,
          status: preapproval.status || null,
          reason: preapproval.reason || null,
          external_reference: preapproval.external_reference || null,
          payer_email: preapproval.payer_email || null,
          next_payment_date: preapproval.next_payment_date || null,
        },
      },
    };

    const datos = {
      estado: estadoMembresia,
      mercadopago_preapproval_id: preapproval.id || preapprovalId,
      mercadopago_status: preapproval.status || null,
      fecha_fin:
        estadoMembresia === "activa" ? calcularFechaFin(preapproval) : null,
      proximo_cobro_at: preapproval.next_payment_date || null,
      cancelada_at:
        estadoMembresia === "cancelada" ? new Date().toISOString() : null,
      detalle,
      updated_at: new Date().toISOString(),
    };

    const { data: actualizada, error } = await admin.supabaseAdmin
      .from("membresias_accesos")
      .update(datos)
      .eq("id", membresia.id)
      .select("*")
      .single();

    if (error) {
      throw new Error(`No se pudo actualizar la membresía: ${error.message}`);
    }

    return NextResponse.json({
      ok: true,
      membresia: actualizada,
      mercadopago: {
        preapproval_id: preapproval.id || preapprovalId,
        status: preapproval.status || null,
      },
    });
  } catch (error) {
    console.error("Error sincronizando membresía:", error);

    return respuestaError(
      error?.message || "No se pudo sincronizar la membresía.",
      500
    );
  }
}