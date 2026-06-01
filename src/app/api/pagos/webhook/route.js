import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function normalizarEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizarParticipantes(participantes) {
  if (!Array.isArray(participantes)) {
    return [];
  }

  return participantes
    .map((participante) => ({
      user_id: participante?.user_id || participante?.userId || null,
      email: normalizarEmail(participante?.email),
    }))
    .filter((participante) => participante.user_id && participante.email);
}

function obtenerPaymentId(requestUrl, body) {
  const url = new URL(requestUrl);

  const idDesdeQuery =
    url.searchParams.get("id") ||
    url.searchParams.get("data.id") ||
    url.searchParams.get("payment_id");

  if (idDesdeQuery) {
    return String(idDesdeQuery);
  }

  if (body?.data?.id) {
    return String(body.data.id);
  }

  if (body?.id) {
    return String(body.id);
  }

  return null;
}

function parsearExternalReference(valor) {
  if (!valor) return null;

  try {
    return JSON.parse(valor);
  } catch {
    return null;
  }
}

function leerMetadata(payment) {
  const metadata = payment?.metadata || {};
  const externalReference = parsearExternalReference(payment?.external_reference);

  return {
    productoId:
      metadata.producto_id ||
      metadata.productoId ||
      externalReference?.productoId ||
      externalReference?.producto_id ||
      null,

    compradorUserId:
      metadata.comprador_user_id ||
      metadata.compradorUserId ||
      externalReference?.compradorUserId ||
      externalReference?.comprador_user_id ||
      null,

    participantes: normalizarParticipantes(
      metadata.participantes || externalReference?.participantes || []
    ),
  };
}

async function obtenerProductoConCursos(supabase, productoId) {
  const { data, error } = await supabase
    .from("productos")
    .select(
      `
      *,
      producto_cursos (
        curso_id,
        nivel_acceso,
        beneficios_pro
      )
    `
    )
    .eq("id", productoId)
    .maybeSingle();

  if (error || !data) {
    console.error("No se encontró el producto del pago:", error);
    return null;
  }

  return data;
}

async function guardarOActualizarPago({
  supabase,
  pagoExistente,
  payment,
  producto,
  compradorUserId,
  participantes,
}) {
  const paymentId = String(payment.id);
  const estado = payment.status || "desconocido";
  const email = normalizarEmail(payment.payer?.email);
  const monto = payment.transaction_amount || null;
  const moneda = payment.currency_id || producto?.moneda || "UYU";
  const preferenceId = payment.preference_id || null;

  const datosPago = {
    user_id: compradorUserId,
    comprador_user_id: compradorUserId,
    producto_id: producto?.id || null,
    curso_id: producto?.curso_id || null,
    email,
    mercadopago_payment_id: paymentId,
    mercadopago_preference_id: preferenceId,
    estado,
    monto,
    moneda,
    tipo_producto: producto?.tipo_producto || null,
    participantes,
    detalle: {
      payment,
      producto,
    },
    updated_at: new Date().toISOString(),
  };

  if (pagoExistente) {
    const { data, error } = await supabase
      .from("pagos")
      .update(datosPago)
      .eq("id", pagoExistente.id)
      .select("*")
      .single();

    if (error) {
      console.error("Error actualizando pago:", error);
      return null;
    }

    return data;
  }

  const { data, error } = await supabase
    .from("pagos")
    .insert([datosPago])
    .select("*")
    .single();

  if (error) {
    console.error("Error insertando pago:", error);
    return null;
  }

  return data;
}

async function habilitarCursos({
  supabase,
  pago,
  producto,
  compradorUserId,
  participantes,
}) {
  const cursosDelProducto = producto?.producto_cursos || [];

  if (!cursosDelProducto.length) {
    throw new Error("El producto comprado no tiene cursos asociados.");
  }

  const usuariosAutorizados = [
    {
      user_id: compradorUserId,
      email: pago.email,
      comprador: true,
    },
    ...participantes.map((participante) => ({
      user_id: participante.user_id,
      email: participante.email,
      comprador: false,
    })),
  ].filter((usuario) => usuario.user_id);

  for (const usuario of usuariosAutorizados) {
    for (const cursoProducto of cursosDelProducto) {
      const nivelAcceso =
        cursoProducto.nivel_acceso || producto.plan || "basico";

      const { error } = await supabase.from("alumno_cursos").upsert(
        {
          user_id: usuario.user_id,
          curso_id: cursoProducto.curso_id,
          estado: "activo",
          origen: "mercadopago",
          pago_id: pago.id,
          producto_id: producto.id,
          comprador_user_id: compradorUserId,
          nivel_acceso: nivelAcceso,
          acceso_grupal: Boolean(!usuario.comprador),
          fecha_inicio: new Date().toISOString(),
        },
        {
          onConflict: "user_id,curso_id",
        }
      );

      if (error) {
        console.error("Error habilitando alumno_cursos:", {
          usuario,
          cursoProducto,
          error,
        });

        throw new Error("No se pudo habilitar el curso automáticamente.");
      }
    }
  }

  for (const participante of participantes) {
    const { error } = await supabase.from("compra_participantes").upsert(
      {
        pago_id: pago.id,
        producto_id: producto.id,
        comprador_user_id: compradorUserId,
        participante_user_id: participante.user_id,
        participante_email: participante.email,
      },
      {
        onConflict: "pago_id,participante_user_id",
      }
    );

    if (error) {
      console.error("Error guardando participante de compra:", error);
    }
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    ruta: "/api/pagos/webhook",
    mensaje: "Webhook de Mercado Pago activo.",
    variables: {
      MERCADOPAGO_ACCESS_TOKEN: Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN),
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
  });
}

export async function POST(request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { ok: false, error: "Falta MERCADOPAGO_ACCESS_TOKEN." },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const paymentId = obtenerPaymentId(request.url, body);

    if (!paymentId) {
      return NextResponse.json({
        ok: true,
        ignored: "Notificación sin payment id.",
      });
    }

    const client = new MercadoPagoConfig({
      accessToken,
    });

    const paymentClient = new Payment(client);

    const payment = await paymentClient.get({
      id: paymentId,
    });

    const estado = payment.status || "desconocido";

    const { productoId, compradorUserId, participantes } =
      leerMetadata(payment);

    if (!productoId || !compradorUserId) {
      console.error("Webhook sin productoId o compradorUserId:", {
        paymentId,
        productoId,
        compradorUserId,
        estado,
      });

      return NextResponse.json({
        ok: true,
        ignored: "Pago sin productoId o compradorUserId.",
      });
    }

    const supabase = createAdminClient();

    const producto = await obtenerProductoConCursos(supabase, productoId);

    if (!producto) {
      return NextResponse.json({
        ok: true,
        ignored: "Producto no encontrado.",
      });
    }

    const { data: pagoExistente, error: errorPagoExistente } = await supabase
      .from("pagos")
      .select("*")
      .eq("mercadopago_payment_id", String(paymentId))
      .maybeSingle();

    if (errorPagoExistente) {
      console.error("Error buscando pago existente:", errorPagoExistente);

      return NextResponse.json(
        { ok: false, error: "No se pudo verificar el pago existente." },
        { status: 500 }
      );
    }

    const pago = await guardarOActualizarPago({
      supabase,
      pagoExistente,
      payment,
      producto,
      compradorUserId,
      participantes,
    });

    if (!pago) {
      return NextResponse.json(
        { ok: false, error: "No se pudo guardar el pago." },
        { status: 500 }
      );
    }

    let cursoHabilitado = false;

    if (estado === "approved") {
      await habilitarCursos({
        supabase,
        pago,
        producto,
        compradorUserId,
        participantes,
      });

      cursoHabilitado = true;
    }

    return NextResponse.json({
      ok: true,
      payment_id: paymentId,
      estado,
      producto_id: productoId,
      curso_habilitado: cursoHabilitado,
    });
  } catch (error) {
    console.error("Error en webhook Mercado Pago:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Error procesando webhook Mercado Pago.",
      },
      { status: 500 }
    );
  }
}