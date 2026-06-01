import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function normalizarEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function obtenerPrecioNumerico(precio) {
  const numero = Number(precio);

  if (!numero || Number.isNaN(numero) || numero <= 0) {
    return null;
  }

  return numero;
}

function limpiarParticipantes(participantes) {
  if (!Array.isArray(participantes)) {
    return [];
  }

  const emailsLimpios = participantes
    .map((email) => normalizarEmail(email))
    .filter(Boolean);

  return [...new Set(emailsLimpios)];
}

function limpiarSiteUrl(siteUrl) {
  return String(siteUrl || "").replace(/\/+$/, "");
}

function esUrlProduccion(siteUrl) {
  return siteUrl.startsWith("https://");
}

async function buscarUsuariosPorEmails(supabase, emails) {
  if (!emails.length) {
    return [];
  }

  const { data, error } = await supabase.rpc(
    "admin_buscar_usuarios_por_emails",
    {
      correos: emails,
    }
  );

  if (error) {
    console.error("Error buscando usuarios por email:", error);
    throw new Error("No se pudieron validar los participantes.");
  }

  return data || [];
}

export async function GET() {
  const siteUrl = limpiarSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

  return NextResponse.json({
    ok: true,
    ruta: "/api/pagos/crear-preferencia",
    mensaje: "La API de crear preferencia existe y responde correctamente.",
    variables: {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      MERCADOPAGO_ACCESS_TOKEN: Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN),
      NEXT_PUBLIC_SITE_URL: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    },
    siteUrl,
    esProduccion: esUrlProduccion(siteUrl),
  });
}

export async function POST(request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const siteUrl = limpiarSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

    if (!accessToken) {
      return NextResponse.json(
        { error: "Falta MERCADOPAGO_ACCESS_TOKEN." },
        { status: 500 }
      );
    }

    if (!siteUrl) {
      return NextResponse.json(
        { error: "Falta NEXT_PUBLIC_SITE_URL." },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "El cuerpo de la solicitud no es JSON válido." },
        { status: 400 }
      );
    }

    const productoId = body?.productoId;
    const compradorUserId = body?.userId;
    const compradorEmail = normalizarEmail(body?.email);
    const participantesSolicitados = limpiarParticipantes(body?.participantes);

    if (!productoId) {
      return NextResponse.json(
        { error: "Falta el ID del producto." },
        { status: 400 }
      );
    }

    if (!compradorUserId) {
      return NextResponse.json(
        { error: "Falta el ID del comprador." },
        { status: 400 }
      );
    }

    if (!compradorEmail) {
      return NextResponse.json(
        { error: "Falta el email del comprador." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: producto, error: errorProducto } = await supabase
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
      .eq("activo", true)
      .eq("visible_en_web", true)
      .single();

    if (errorProducto || !producto) {
      console.error("Producto no encontrado o inactivo:", errorProducto);

      return NextResponse.json(
        {
          error:
            "Producto no encontrado, inactivo o no visible en la web. Revisá en admin que esté activo y visible.",
        },
        { status: 404 }
      );
    }

    if (producto.es_recurrente) {
      return NextResponse.json(
        {
          error:
            "Este producto es una membresía recurrente. Se debe pagar desde el sistema de suscripciones.",
        },
        { status: 400 }
      );
    }

    const precioNumero = obtenerPrecioNumerico(producto.precio);

    if (!precioNumero) {
      return NextResponse.json(
        {
          error:
            "Este producto no tiene un precio válido. Configuralo en el admin con un número mayor a 0.",
        },
        { status: 400 }
      );
    }

    const cantidadMaximaUsuarios = Number(producto.cantidad_maxima_usuarios || 1);
    const requiereParticipantes = Boolean(producto.requiere_participantes);

    let participantesValidados = [];

    if (cantidadMaximaUsuarios > 1 || requiereParticipantes) {
      const cuposParticipantes = cantidadMaximaUsuarios - 1;

      if (participantesSolicitados.length !== cuposParticipantes) {
        return NextResponse.json(
          {
            error: `Este producto requiere exactamente ${cuposParticipantes} participantes además del comprador.`,
          },
          { status: 400 }
        );
      }

      if (participantesSolicitados.includes(compradorEmail)) {
        return NextResponse.json(
          {
            error:
              "No podés colocar tu propio email como participante. El comprador ya cuenta como un usuario.",
          },
          { status: 400 }
        );
      }

      const usuariosEncontrados = await buscarUsuariosPorEmails(
        supabase,
        participantesSolicitados
      );

      const mapaUsuarios = new Map(
        usuariosEncontrados.map((usuario) => [
          normalizarEmail(usuario.email),
          usuario.user_id,
        ])
      );

      const emailsNoRegistrados = participantesSolicitados.filter(
        (email) => !mapaUsuarios.has(email)
      );

      if (emailsNoRegistrados.length > 0) {
        return NextResponse.json(
          {
            error:
              "No se puede continuar. Todos los participantes deben tener una cuenta registrada en SERVICAN antes de comprar.",
            emails_no_registrados: emailsNoRegistrados,
          },
          { status: 400 }
        );
      }

      participantesValidados = participantesSolicitados.map((email) => ({
        email,
        user_id: mapaUsuarios.get(email),
      }));
    }

    const client = new MercadoPagoConfig({
      accessToken,
    });

    const preference = new Preference(client);

    const externalReference = JSON.stringify({
      tipo: "producto",
      productoId: producto.id,
      compradorUserId,
      participantes: participantesValidados,
    });

    const preferenceBody = {
      items: [
        {
          id: String(producto.id),
          title: producto.nombre,
          description: producto.descripcion || "Producto SERVICAN",
          quantity: 1,
          unit_price: precioNumero,
          currency_id: producto.moneda || "UYU",
        },
      ],
      payer: {
        email: compradorEmail,
      },
      external_reference: externalReference,
      metadata: {
        tipo: "producto",
        producto_id: producto.id,
        comprador_user_id: compradorUserId,
        comprador_email: compradorEmail,
        tipo_producto: producto.tipo_producto,
        plan: producto.plan,
        cantidad_maxima_usuarios: cantidadMaximaUsuarios,
        participantes: participantesValidados,
      },
      back_urls: {
        success: `${siteUrl}/pagos/exito`,
        failure: `${siteUrl}/pagos/error`,
        pending: `${siteUrl}/pagos/pendiente`,
      },
      notification_url: `${siteUrl}/api/pagos/webhook`,
    };

    if (esUrlProduccion(siteUrl)) {
      preferenceBody.auto_return = "approved";
    }

    const resultado = await preference.create({
      body: preferenceBody,
    });

    const preferenceId = resultado.id;

    const { error: errorInsertarPago } = await supabase.from("pagos").insert([
      {
        user_id: compradorUserId,
        comprador_user_id: compradorUserId,
        producto_id: producto.id,
        curso_id: producto.curso_id || null,
        email: compradorEmail,
        mercadopago_preference_id: preferenceId,
        estado: "pendiente",
        monto: precioNumero,
        moneda: producto.moneda || "UYU",
        tipo_producto: producto.tipo_producto,
        participantes: participantesValidados,
        detalle: {
          producto,
          preference: resultado,
        },
      },
    ]);

    if (errorInsertarPago) {
      console.error("Error guardando pago pendiente:", errorInsertarPago);

      return NextResponse.json(
        {
          error:
            "Mercado Pago creó la preferencia, pero no se pudo guardar el pago pendiente en Supabase.",
          detalle: errorInsertarPago.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      init_point: resultado.init_point,
      sandbox_init_point: resultado.sandbox_init_point,
      preference_id: preferenceId,
    });
  } catch (error) {
    console.error("Error creando preferencia Mercado Pago:", error);

    return NextResponse.json(
      {
        error: error?.message || "Error interno creando preferencia de pago.",
        detalle: error?.cause || null,
      },
      { status: 500 }
    );
  }
}