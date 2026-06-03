import { NextResponse } from "next/server";
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

function obtenerAccessTokenMP() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!token) {
    throw new Error("Falta MERCADOPAGO_ACCESS_TOKEN.");
  }

  return token;
}

function respuestaOk(extra = {}) {
  return NextResponse.json({
    ok: true,
    ...extra,
  });
}

function respuestaError(mensaje, status = 400, extra = {}) {
  return NextResponse.json(
    {
      ok: false,
      error: mensaje,
      ...extra,
    },
    { status }
  );
}

function normalizarEstadoMercadoPago(status) {
  const estado = String(status || "").toLowerCase().trim();

  if (["authorized", "autorizado", "approved", "aprobado", "accredited"].includes(estado)) {
    return "activa";
  }

  if (["cancelled", "canceled", "cancelado", "finished", "finalizado"].includes(estado)) {
    return "cancelada";
  }

  if (["paused", "pausado", "pending", "pendiente", "in_process", "en_proceso"].includes(estado)) {
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

function extraerTopicYId(requestUrl, body) {
  const url = new URL(requestUrl);

  const topic =
    url.searchParams.get("topic") ||
    url.searchParams.get("type") ||
    body?.topic ||
    body?.type ||
    body?.action ||
    "";

  const id =
    url.searchParams.get("id") ||
    url.searchParams.get("data.id") ||
    body?.id ||
    body?.data?.id ||
    body?.resource ||
    "";

  return {
    topic: String(topic || "").trim(),
    id: String(id || "").trim(),
  };
}

function extraerReferenciaCompacta(valor) {
  const externalReference = String(valor || "").trim();

  if (!externalReference.startsWith("MEMB|")) {
    return null;
  }

  const partes = externalReference.split("|");

  return {
    productoId: partes[1] || null,
    userId: partes[2] || null,
    raw: externalReference,
  };
}

function extraerReferenciaPreapproval(preapproval) {
  const refCompacta = extraerReferenciaCompacta(preapproval?.external_reference);

  if (refCompacta) {
    return {
      ...refCompacta,
      email: preapproval?.payer_email || preapproval?.payer?.email || "",
      formato: "compacto",
    };
  }

  return {
    productoId: preapproval?.metadata?.producto_id || null,
    userId: preapproval?.metadata?.comprador_user_id || null,
    email: preapproval?.payer_email || preapproval?.payer?.email || "",
    raw: preapproval?.external_reference || "",
    formato: "metadata",
  };
}

async function consultarMercadoPago(path) {
  const accessToken = obtenerAccessTokenMP();

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

async function consultarPreapproval(preapprovalId) {
  if (!preapprovalId) {
    throw new Error("Falta ID de preapproval.");
  }

  return consultarMercadoPago(`/preapproval/${preapprovalId}`);
}

async function consultarAuthorizedPayment(authorizedPaymentId) {
  if (!authorizedPaymentId) {
    throw new Error("Falta ID de authorized payment.");
  }

  return consultarMercadoPago(`/authorized_payments/${authorizedPaymentId}`);
}

async function consultarPayment(paymentId) {
  if (!paymentId) {
    throw new Error("Falta ID de payment.");
  }

  return consultarMercadoPago(`/v1/payments/${paymentId}`);
}

async function obtenerProducto(supabaseAdmin, productoId) {
  if (!productoId) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("productos")
    .select(
      `
      id,
      nombre,
      slug,
      tipo_producto,
      plan,
      precio,
      moneda,
      es_recurrente,
      activo,
      visible_en_web
    `
    )
    .eq("id", productoId)
    .eq("tipo_producto", "membresia")
    .eq("es_recurrente", true)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo buscar el producto: ${error.message}`);
  }

  return data;
}

async function obtenerPerfil(supabaseAdmin, userId) {
  if (!userId) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("perfiles")
    .select("user_id, email, nombre, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo buscar el perfil: ${error.message}`);
  }

  return data;
}

async function buscarAccesoPorPreapproval(supabaseAdmin, preapprovalId) {
  if (!preapprovalId) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("membresias_accesos")
    .select("*")
    .eq("mercadopago_preapproval_id", preapprovalId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo buscar la membresía por preapproval: ${error.message}`);
  }

  return data;
}

async function buscarAccesoPorUsuario(supabaseAdmin, userId) {
  if (!userId) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("membresias_accesos")
    .select("*")
    .eq("user_id", userId)
    .in("estado", ["pausada", "activa"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo buscar la membresía del usuario: ${error.message}`);
  }

  return data;
}

async function actualizarAccesoDesdePreapproval({
  supabaseAdmin,
  preapproval,
  payment = null,
  authorizedPayment = null,
}) {
  const preapprovalId = preapproval?.id || preapproval?.subscription_id;

  if (!preapprovalId) {
    throw new Error("La preapproval no tiene ID.");
  }

  const referencia = extraerReferenciaPreapproval(preapproval);

  if (!referencia.userId || !referencia.productoId) {
    throw new Error("La referencia de la membresía está incompleta.");
  }

  const producto = await obtenerProducto(supabaseAdmin, referencia.productoId);

  if (!producto) {
    throw new Error("El producto de membresía no existe o no es válido.");
  }

  const perfil = await obtenerPerfil(supabaseAdmin, referencia.userId);

  if (!perfil) {
    throw new Error("No se encontró el perfil del usuario.");
  }

  const accesoExistente =
    (await buscarAccesoPorPreapproval(supabaseAdmin, preapprovalId)) ||
    (await buscarAccesoPorUsuario(supabaseAdmin, referencia.userId));

  const estadoPreapproval = String(preapproval?.status || "").toLowerCase();
  const estadoPago = String(payment?.status || authorizedPayment?.status || "").toLowerCase();

  let estadoMembresia = normalizarEstadoMercadoPago(estadoPreapproval);

  if (["approved", "aprobado", "accredited", "authorized", "autorizado"].includes(estadoPago)) {
    estadoMembresia = "activa";
  }

  const fechaFin =
    estadoMembresia === "activa" ? calcularFechaFin(preapproval) : null;

  const detalle = {
    ...(accesoExistente?.detalle || {}),
    origen: "mercadopago_webhook",
    referencia,
    producto: {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      moneda: producto.moneda,
    },
    perfil: {
      user_id: perfil.user_id,
      email: perfil.email,
    },
    preapproval: {
      id: preapprovalId,
      status: preapproval.status || null,
      reason: preapproval.reason || null,
      external_reference: preapproval.external_reference || null,
      next_payment_date: preapproval.next_payment_date || null,
      payer_email: preapproval.payer_email || null,
    },
    authorized_payment: authorizedPayment
      ? {
          id: authorizedPayment.id || null,
          status: authorizedPayment.status || null,
          payment_id: authorizedPayment.payment_id || null,
          preapproval_id:
            authorizedPayment.preapproval_id ||
            authorizedPayment.subscription_id ||
            null,
        }
      : null,
    payment: payment
      ? {
          id: payment.id || null,
          status: payment.status || null,
          status_detail: payment.status_detail || null,
          external_reference: payment.external_reference || null,
          transaction_amount: payment.transaction_amount || null,
          currency_id: payment.currency_id || null,
        }
      : null,
    actualizado_en: new Date().toISOString(),
  };

  const datosActualizados = {
    user_id: referencia.userId,
    estado: estadoMembresia,
    fecha_inicio: accesoExistente?.fecha_inicio || new Date().toISOString(),
    fecha_fin: fechaFin,
    descuento_porcentaje: 10,
    curso_pequeno_disponible: true,
    mercadopago_preapproval_id: preapprovalId,
    mercadopago_status: preapproval.status || payment?.status || null,
    ultimo_pago_id:
      String(payment?.id || authorizedPayment?.payment_id || "") || null,
    ultimo_pago_estado:
      payment?.status ||
      authorizedPayment?.status ||
      null,
    proximo_cobro_at: preapproval.next_payment_date || null,
    cancelada_at:
      estadoMembresia === "cancelada"
        ? new Date().toISOString()
        : null,
    detalle,
    updated_at: new Date().toISOString(),
  };

  if (accesoExistente?.id) {
    const { data, error } = await supabaseAdmin
      .from("membresias_accesos")
      .update(datosActualizados)
      .eq("id", accesoExistente.id)
      .select("*")
      .single();

    if (error) {
      throw new Error(`No se pudo actualizar la membresía: ${error.message}`);
    }

    return data;
  }

  const { data, error } = await supabaseAdmin
    .from("membresias_accesos")
    .insert(datosActualizados)
    .select("*")
    .single();

  if (error) {
    throw new Error(`No se pudo crear la membresía: ${error.message}`);
  }

  return data;
}

async function activarDesdePaymentConReferencia({
  supabaseAdmin,
  payment,
}) {
  const referencia = extraerReferenciaCompacta(payment?.external_reference);

  if (!referencia?.userId || !referencia?.productoId) {
    return {
      procesado: false,
      motivo: "Payment sin referencia MEMB válida.",
      payment_status: payment?.status || null,
    };
  }

  const producto = await obtenerProducto(supabaseAdmin, referencia.productoId);

  if (!producto) {
    throw new Error("El producto de membresía no existe o no es válido.");
  }

  const perfil = await obtenerPerfil(supabaseAdmin, referencia.userId);

  if (!perfil) {
    throw new Error("No se encontró el perfil del usuario.");
  }

  const accesoExistente = await buscarAccesoPorUsuario(
    supabaseAdmin,
    referencia.userId
  );

  const estadoPago = String(payment?.status || "").toLowerCase();
  const estadoMembresia = normalizarEstadoMercadoPago(estadoPago);

  const detalle = {
    ...(accesoExistente?.detalle || {}),
    origen: "mercadopago_webhook_payment",
    referencia,
    producto: {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      moneda: producto.moneda,
    },
    perfil: {
      user_id: perfil.user_id,
      email: perfil.email,
    },
    payment: {
      id: payment.id || null,
      status: payment.status || null,
      status_detail: payment.status_detail || null,
      external_reference: payment.external_reference || null,
      transaction_amount: payment.transaction_amount || null,
      currency_id: payment.currency_id || null,
    },
    actualizado_en: new Date().toISOString(),
  };

  const datosActualizados = {
    user_id: referencia.userId,
    estado: estadoMembresia,
    fecha_inicio: accesoExistente?.fecha_inicio || new Date().toISOString(),
    fecha_fin:
      estadoMembresia === "activa" ? calcularFechaFin(null) : null,
    descuento_porcentaje: 10,
    curso_pequeno_disponible: true,
    mercadopago_status: payment.status || null,
    ultimo_pago_id: String(payment.id || "") || null,
    ultimo_pago_estado: payment.status || null,
    detalle,
    updated_at: new Date().toISOString(),
  };

  if (accesoExistente?.id) {
    const { data, error } = await supabaseAdmin
      .from("membresias_accesos")
      .update(datosActualizados)
      .eq("id", accesoExistente.id)
      .select("*")
      .single();

    if (error) {
      throw new Error(`No se pudo actualizar la membresía por payment: ${error.message}`);
    }

    return {
      procesado: true,
      tipo: "payment_external_reference",
      estado: data.estado,
      membresia_id: data.id,
    };
  }

  const { data, error } = await supabaseAdmin
    .from("membresias_accesos")
    .insert(datosActualizados)
    .select("*")
    .single();

  if (error) {
    throw new Error(`No se pudo crear la membresía por payment: ${error.message}`);
  }

  return {
    procesado: true,
    tipo: "payment_external_reference",
    estado: data.estado,
    membresia_id: data.id,
  };
}

async function manejarEvento({ topic, id }) {
  const supabaseAdmin = crearSupabaseAdmin();
  const topicNormalizado = String(topic || "").toLowerCase();

  if (!id) {
    return {
      procesado: false,
      motivo: "Evento sin ID.",
    };
  }

  if (
    topicNormalizado.includes("subscription_preapproval") ||
    topicNormalizado.includes("preapproval")
  ) {
    const preapproval = await consultarPreapproval(id);

    const acceso = await actualizarAccesoDesdePreapproval({
      supabaseAdmin,
      preapproval,
    });

    return {
      procesado: true,
      tipo: "preapproval",
      estado: acceso.estado,
      membresia_id: acceso.id,
    };
  }

  if (
    topicNormalizado.includes("subscription_authorized_payment") ||
    topicNormalizado.includes("authorized_payment")
  ) {
    const authorizedPayment = await consultarAuthorizedPayment(id);

    const preapprovalId =
      authorizedPayment?.preapproval_id ||
      authorizedPayment?.subscription_id ||
      authorizedPayment?.preapproval?.id ||
      null;

    let payment = null;

    if (authorizedPayment?.payment_id) {
      payment = await consultarPayment(authorizedPayment.payment_id);
    }

    if (!preapprovalId) {
      if (payment) {
        return activarDesdePaymentConReferencia({
          supabaseAdmin,
          payment,
        });
      }

      return {
        procesado: false,
        motivo: "Authorized payment sin preapproval_id.",
      };
    }

    const preapproval = await consultarPreapproval(preapprovalId);

    const acceso = await actualizarAccesoDesdePreapproval({
      supabaseAdmin,
      preapproval,
      payment,
      authorizedPayment,
    });

    return {
      procesado: true,
      tipo: "authorized_payment",
      estado: acceso.estado,
      membresia_id: acceso.id,
    };
  }

  if (topicNormalizado.includes("payment")) {
    const payment = await consultarPayment(id);

    const preapprovalId =
      payment?.metadata?.preapproval_id ||
      payment?.metadata?.subscription_id ||
      payment?.additional_info?.items?.[0]?.id ||
      null;

    if (preapprovalId) {
      const preapproval = await consultarPreapproval(preapprovalId);

      const acceso = await actualizarAccesoDesdePreapproval({
        supabaseAdmin,
        preapproval,
        payment,
      });

      return {
        procesado: true,
        tipo: "payment_con_preapproval",
        estado: acceso.estado,
        membresia_id: acceso.id,
      };
    }

    return activarDesdePaymentConReferencia({
      supabaseAdmin,
      payment,
    });
  }

  return {
    procesado: false,
    motivo: `Topic no manejado: ${topic}`,
  };
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));

    const { topic, id } = extraerTopicYId(request.url, body);

    const resultado = await manejarEvento({
      topic,
      id,
    });

    return respuestaOk(resultado);
  } catch (error) {
    console.error("Error en webhook de membresía:", error);

    return respuestaError(
      error?.message || "No se pudo procesar el webhook de membresía.",
      500
    );
  }
}

export async function GET(request) {
  return respuestaOk({
    mensaje: "Webhook de membresía activo.",
    url: request.url,
  });
}