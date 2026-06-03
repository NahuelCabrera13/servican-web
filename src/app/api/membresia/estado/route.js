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

function normalizarEstadoMercadoPago(status) {
  const estado = String(status || "").toLowerCase().trim();

  if (
    [
      "authorized",
      "autorizado",
      "approved",
      "aprobado",
      "accredited",
      "acreditado",
    ].includes(estado)
  ) {
    return "activa";
  }

  if (
    [
      "cancelled",
      "canceled",
      "cancelado",
      "finished",
      "finalizado",
    ].includes(estado)
  ) {
    return "cancelada";
  }

  if (
    [
      "paused",
      "pausado",
      "pending",
      "pendiente",
      "in_process",
      "en_proceso",
    ].includes(estado)
  ) {
    return "pausada";
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

async function consultarPreapprovalMercadoPago(preapprovalId) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("Falta MERCADOPAGO_ACCESS_TOKEN.");
  }

  if (!preapprovalId) {
    return null;
  }

  const respuesta = await fetch(
    `https://api.mercadopago.com/preapproval/${preapprovalId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const data = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "Mercado Pago no pudo verificar la suscripción."
    );
  }

  return data;
}

async function obtenerUltimaMembresia(supabaseAdmin, userId) {
  const { data: membresia, error } = await supabaseAdmin
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
      ultimo_pago_estado,
      proximo_cobro_at,
      cancelada_at,
      detalle,
      updated_at
    `
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return membresia;
}

async function sincronizarMembresiaSiHaceFalta(supabaseAdmin, membresia) {
  if (!membresia) {
    return null;
  }

  if (membresia.estado === "activa") {
    return membresia;
  }

  if (!membresia.mercadopago_preapproval_id) {
    return membresia;
  }

  const preapproval = await consultarPreapprovalMercadoPago(
    membresia.mercadopago_preapproval_id
  );

  if (!preapproval) {
    return membresia;
  }

  const estadoMembresia = normalizarEstadoMercadoPago(preapproval.status);

  if (estadoMembresia === membresia.estado) {
    const { data: actualizada, error } = await supabaseAdmin
      .from("membresias_accesos")
      .update({
        mercadopago_status: preapproval.status || membresia.mercadopago_status,
        proximo_cobro_at:
          preapproval.next_payment_date || membresia.proximo_cobro_at,
        detalle: {
          ...(membresia.detalle || {}),
          ultima_verificacion_automatica: {
            fecha: new Date().toISOString(),
            preapproval_id: preapproval.id || membresia.mercadopago_preapproval_id,
            status: preapproval.status || null,
            next_payment_date: preapproval.next_payment_date || null,
          },
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", membresia.id)
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
      .single();

    if (error) {
      throw new Error(`No se pudo actualizar verificación: ${error.message}`);
    }

    return actualizada;
  }

  const detalle = {
    ...(membresia.detalle || {}),
    sincronizacion_automatica_estado: {
      fecha: new Date().toISOString(),
      estado_anterior: membresia.estado,
      estado_nuevo: estadoMembresia,
      preapproval: {
        id: preapproval.id || membresia.mercadopago_preapproval_id,
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
    mercadopago_preapproval_id:
      preapproval.id || membresia.mercadopago_preapproval_id,
    mercadopago_status: preapproval.status || null,
    fecha_fin:
      estadoMembresia === "activa" ? calcularFechaFin(preapproval) : null,
    proximo_cobro_at: preapproval.next_payment_date || null,
    cancelada_at:
      estadoMembresia === "cancelada" ? new Date().toISOString() : null,
    detalle,
    updated_at: new Date().toISOString(),
  };

  const { data: actualizada, error } = await supabaseAdmin
    .from("membresias_accesos")
    .update(datos)
    .eq("id", membresia.id)
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
    .single();

  if (error) {
    throw new Error(`No se pudo sincronizar la membresía: ${error.message}`);
  }

  return actualizada;
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

    const membresiaActual = await obtenerUltimaMembresia(
      supabaseAdmin,
      usuario.id
    );

    const membresiaSincronizada = await sincronizarMembresiaSiHaceFalta(
      supabaseAdmin,
      membresiaActual
    );

    return NextResponse.json({
      ok: true,
      tiene_membresia: Boolean(membresiaSincronizada),
      membresia: membresiaSincronizada,
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