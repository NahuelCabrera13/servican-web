import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG_MEMBRESIA = "membresia-mensual-servican";

function crearRespuestaError(mensaje, status = 400, extra = {}) {
  return NextResponse.json(
    {
      ok: false,
      error: mensaje,
      ...extra,
    },
    { status }
  );
}

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

function limpiarSiteUrl(siteUrl) {
  const valor = String(siteUrl || "").trim().replace(/\/+$/, "");

  if (!valor) {
    return "";
  }

  try {
    const url = new URL(valor);

    if (!["https:", "http:"].includes(url.protocol)) {
      return "";
    }

    return url.toString().replace(/\/+$/, "");
  } catch {
    return "";
  }
}

function obtenerSiteUrl(request) {
  const desdeVariable = limpiarSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

  if (desdeVariable) {
    return desdeVariable;
  }

  const origen = request?.headers?.get("origin");

  return limpiarSiteUrl(origen);
}

function normalizarMoneda(moneda) {
  return String(moneda || "UYU").trim().toUpperCase();
}

function normalizarPrecio(precio) {
  const numero = Number(precio);

  if (!Number.isFinite(numero)) {
    return 0;
  }

  return Math.round(numero * 100) / 100;
}

function membresiaSigueVigente(membresia) {
  if (!membresia) {
    return false;
  }

  if (membresia.estado !== "activa") {
    return false;
  }

  if (!membresia.fecha_fin) {
    return true;
  }

  const fechaFin = new Date(membresia.fecha_fin);

  if (Number.isNaN(fechaFin.getTime())) {
    return false;
  }

  return fechaFin.getTime() > Date.now();
}

function productoDisponible(producto) {
  if (!producto) {
    return false;
  }

  if (!producto.activo || !producto.visible_en_web) {
    return false;
  }

  if (producto.tipo_producto !== "membresia") {
    return false;
  }

  if (producto.plan !== "mensual") {
    return false;
  }

  if (!producto.es_recurrente) {
    return false;
  }

  const precio = normalizarPrecio(producto.precio);

  return precio > 0;
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

async function obtenerPerfil(supabaseAdmin, userId) {
  const { data, error } = await supabaseAdmin
    .from("perfiles")
    .select("user_id, email, nombre, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo verificar el perfil: ${error.message}`);
  }

  return data;
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
      es_recurrente,
      activo,
      visible_en_web,
      texto_boton,
      updated_at
    `
    )
    .eq("slug", SLUG_MEMBRESIA)
    .eq("tipo_producto", "membresia")
    .eq("plan", "mensual")
    .eq("es_recurrente", true)
    .eq("activo", true)
    .eq("visible_en_web", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `No se pudo buscar el producto de membresía: ${error.message}`
    );
  }

  return data;
}

async function buscarMembresiaActivaOPausada(supabaseAdmin, userId) {
  const { data, error } = await supabaseAdmin
    .from("membresias_accesos")
    .select(
      `
      id,
      user_id,
      estado,
      fecha_fin,
      mercadopago_preapproval_id,
      mercadopago_status,
      created_at,
      updated_at
    `
    )
    .eq("user_id", userId)
    .in("estado", ["activa", "pausada"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo revisar la membresía actual: ${error.message}`);
  }

  return data;
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
    console.error("No se pudo consultar preapproval existente:", data);
    return null;
  }

  return data;
}

async function intentarReutilizarMembresiaPausada(membresiaExistente) {
  if (
    !membresiaExistente ||
    membresiaExistente.estado !== "pausada" ||
    !membresiaExistente.mercadopago_preapproval_id
  ) {
    return null;
  }

  const preapproval = await consultarPreapprovalMercadoPago(
    membresiaExistente.mercadopago_preapproval_id
  );

  if (!preapproval) {
    return null;
  }

  const estadoMp = String(preapproval.status || "").toLowerCase();
  const estadosReutilizables = ["pending", "pendiente", "paused", "pausado"];

  if (!estadosReutilizables.includes(estadoMp)) {
    return null;
  }

  const initPoint = preapproval.init_point || preapproval.sandbox_init_point;

  if (!initPoint) {
    return null;
  }

  return {
    ok: true,
    reutilizada: true,
    init_point: initPoint,
    preapproval_id: preapproval.id || membresiaExistente.mercadopago_preapproval_id,
    membresia: membresiaExistente,
  };
}

async function crearPreapprovalMercadoPago({
  producto,
  usuario,
  perfil,
  siteUrl,
}) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("Falta MERCADOPAGO_ACCESS_TOKEN.");
  }

  const precio = normalizarPrecio(producto.precio);
  const moneda = normalizarMoneda(producto.moneda);

  if (precio <= 0) {
    throw new Error("El producto de membresía no tiene un precio válido.");
  }

  if (!usuario.email) {
    throw new Error("Tu usuario no tiene email válido.");
  }

  const externalReference = `MEMB|${producto.id}|${usuario.id}`;

  const body = {
    reason: producto.nombre || "Membresía mensual SERVICAN",
    external_reference: externalReference,
    payer_email: usuario.email,
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: precio,
      currency_id: moneda,
    },
    back_url: `${siteUrl}/panel/membresia`,
    notification_url: `${siteUrl}/api/membresia/webhook`,
    status: "pending",
    metadata: {
      tipo: "membresia",
      producto_id: producto.id,
      producto_slug: producto.slug,
      comprador_user_id: usuario.id,
      perfil_email: perfil?.email || usuario.email,
      perfil_nombre: perfil?.nombre || null,
    },
  };

  const respuesta = await fetch("https://api.mercadopago.com/preapproval", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    console.error("Mercado Pago rechazó la creación de preapproval:", data);

    throw new Error(
      data?.message ||
        data?.error ||
        "Mercado Pago no pudo crear la suscripción."
    );
  }

  return data;
}

async function guardarAccesoPendiente({
  supabaseAdmin,
  usuario,
  producto,
  preapproval,
}) {
  const preapprovalId = preapproval?.id || null;

  if (!preapprovalId) {
    throw new Error("Mercado Pago no devolvió ID de suscripción.");
  }

  const detalle = {
    origen: "mercadopago_preapproval_pending",
    producto_id: producto.id,
    producto_nombre: producto.nombre,
    producto_slug: producto.slug,
    producto_precio: producto.precio,
    producto_moneda: producto.moneda,
    creado_desde: "api_membresia_crear_suscripcion",
    preapproval: {
      id: preapproval.id,
      status: preapproval.status || null,
      reason: preapproval.reason || null,
      external_reference: preapproval.external_reference || null,
      init_point: preapproval.init_point || null,
      sandbox_init_point: preapproval.sandbox_init_point || null,
      payer_email: preapproval.payer_email || null,
      next_payment_date: preapproval.next_payment_date || null,
    },
  };

  const { data, error } = await supabaseAdmin
    .from("membresias_accesos")
    .insert({
      user_id: usuario.id,
      estado: "pausada",
      fecha_inicio: new Date().toISOString(),
      fecha_fin: null,
      descuento_porcentaje: 10,
      curso_pequeno_disponible: true,
      curso_pequeno_usado: false,
      mercadopago_preapproval_id: preapprovalId,
      mercadopago_status: preapproval.status || "pending",
      proximo_cobro_at: preapproval.next_payment_date || null,
      detalle,
      updated_at: new Date().toISOString(),
    })
    .select(
      `
      id,
      user_id,
      estado,
      mercadopago_preapproval_id,
      mercadopago_status,
      updated_at
    `
    )
    .single();

  if (error) {
    throw new Error(
      `No se pudo guardar la membresía pendiente: ${error.message}`
    );
  }

  return data;
}

export async function POST(request) {
  try {
    const usuario = await obtenerUsuarioActual();

    if (!usuario) {
      return crearRespuestaError(
        "Tenés que iniciar sesión antes de contratar la membresía.",
        401,
        {
          requiere_login: true,
        }
      );
    }

    const siteUrl = obtenerSiteUrl(request);

    if (!siteUrl) {
      return crearRespuestaError(
        "NEXT_PUBLIC_SITE_URL no está configurada correctamente.",
        500
      );
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const perfil = await obtenerPerfil(supabaseAdmin, usuario.id);

    if (!perfil) {
      return crearRespuestaError("No se encontró tu perfil.", 403);
    }

    const producto = await obtenerProductoMembresia(supabaseAdmin);

    if (!producto || !productoDisponible(producto)) {
      return crearRespuestaError(
        "La membresía mensual no está disponible para comprar.",
        404
      );
    }

    const membresiaExistente = await buscarMembresiaActivaOPausada(
      supabaseAdmin,
      usuario.id
    );

    if (membresiaSigueVigente(membresiaExistente)) {
      return crearRespuestaError(
        "Ya tenés una membresía activa.",
        409,
        {
          membresia: membresiaExistente,
        }
      );
    }

    const membresiaReutilizable =
      await intentarReutilizarMembresiaPausada(membresiaExistente);

    if (membresiaReutilizable) {
      return NextResponse.json(membresiaReutilizable);
    }

    const preapproval = await crearPreapprovalMercadoPago({
      producto,
      usuario,
      perfil,
      siteUrl,
    });

    const acceso = await guardarAccesoPendiente({
      supabaseAdmin,
      usuario,
      producto,
      preapproval,
    });

    const initPoint = preapproval.init_point || preapproval.sandbox_init_point;

    if (!initPoint) {
      return crearRespuestaError(
        "Mercado Pago no devolvió un enlace de pago válido.",
        500,
        {
          membresia: acceso,
        }
      );
    }

    return NextResponse.json({
      ok: true,
      reutilizada: false,
      init_point: initPoint,
      preapproval_id: preapproval.id,
      membresia: acceso,
    });
  } catch (error) {
    console.error("Error creando suscripción de membresía:", error);

    return crearRespuestaError(
      error?.message || "No se pudo crear la suscripción de membresía.",
      500
    );
  }
}