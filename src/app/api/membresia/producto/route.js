import { NextResponse } from "next/server";
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

  const precio = Number(producto.precio || 0);

  if (!Number.isFinite(precio) || precio <= 0) {
    return false;
  }

  return true;
}

export async function GET() {
  try {
    const supabaseAdmin = crearSupabaseAdmin();

    const { data: producto, error } = await supabaseAdmin
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
        destacado,
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
      throw new Error(error.message);
    }

    if (!producto || !productoDisponible(producto)) {
      return NextResponse.json({
        ok: true,
        disponible: false,
        mensaje: "La membresía mensual no está disponible en este momento.",
        producto: null,
      });
    }

    return NextResponse.json({
      ok: true,
      disponible: true,
      mensaje: "Membresía mensual disponible.",
      producto,
    });
  } catch (error) {
    console.error("Error cargando producto membresía público:", error);

    return NextResponse.json(
      {
        ok: false,
        disponible: false,
        error:
          error?.message || "No se pudo cargar el producto de membresía.",
        producto: null,
      },
      { status: 500 }
    );
  }
}