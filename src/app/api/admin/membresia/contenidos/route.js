import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET_MEMBRESIA = "membresia-galeria";
const DURACION_URL_FIRMADA_SEGUNDOS = 60 * 60;

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

function limpiarTexto(valor, fallback = "") {
  return String(valor ?? fallback).trim();
}

function esUrlHttp(valor) {
  const texto = limpiarTexto(valor);

  if (!texto) {
    return false;
  }

  try {
    const url = new URL(texto);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function esRutaLocal(valor) {
  const texto = limpiarTexto(valor);
  return texto.startsWith("/");
}

function esRutaStoragePrivada(valor) {
  const texto = limpiarTexto(valor);

  if (!texto) {
    return false;
  }

  if (texto === "#") {
    return false;
  }

  if (esUrlHttp(texto)) {
    return false;
  }

  if (esRutaLocal(texto)) {
    return false;
  }

  return true;
}

function limpiarUrl(valor) {
  const texto = limpiarTexto(valor);

  if (!texto) {
    return "";
  }

  if (esUrlHttp(texto)) {
    return texto;
  }

  if (esRutaLocal(texto)) {
    return texto;
  }

  return texto.replace(/^\/+/, "");
}

function normalizarTipo(valor) {
  const tipo = limpiarTexto(valor, "foto").toLowerCase();

  if (["foto", "video", "texto", "archivo"].includes(tipo)) {
    return tipo;
  }

  return "foto";
}

function normalizarBoolean(valor) {
  return Boolean(valor);
}

function normalizarOrden(valor) {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return 0;
  }

  return Math.trunc(numero);
}

function validarDatosContenido(body) {
  const titulo = limpiarTexto(body.titulo);
  const descripcion = limpiarTexto(body.descripcion);
  const tipo = normalizarTipo(body.tipo);
  const url = limpiarUrl(body.url);
  const portadaUrl = limpiarUrl(body.portada_url);
  const activo = normalizarBoolean(body.activo);
  const destacado = normalizarBoolean(body.destacado);
  const orden = normalizarOrden(body.orden);

  if (!titulo) {
    return {
      ok: false,
      error: "El título es obligatorio.",
    };
  }

  if (tipo !== "texto" && !url) {
    return {
      ok: false,
      error: "La URL o archivo del contenido es obligatorio.",
    };
  }

  if (tipo === "texto" && !descripcion) {
    return {
      ok: false,
      error: "El contenido de texto necesita una descripción.",
    };
  }

  return {
    ok: true,
    datos: {
      titulo,
      descripcion,
      tipo,
      url: url || "#",
      portada_url: portadaUrl || null,
      activo,
      destacado,
      orden,
      updated_at: new Date().toISOString(),
    },
  };
}

async function crearUrlFirmada(supabaseAdmin, ruta) {
  if (!esRutaStoragePrivada(ruta)) {
    return ruta;
  }

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_MEMBRESIA)
    .createSignedUrl(ruta, DURACION_URL_FIRMADA_SEGUNDOS);

  if (error || !data?.signedUrl) {
    console.error("No se pudo firmar preview de archivo privado:", {
      ruta,
      error: error?.message,
    });

    return ruta;
  }

  return data.signedUrl;
}

async function agregarUrlsFirmadasAdmin(supabaseAdmin, contenidos) {
  return Promise.all(
    (contenidos || []).map(async (contenido) => {
      const previewUrl = await crearUrlFirmada(supabaseAdmin, contenido.url);
      const portadaPreviewUrl = await crearUrlFirmada(
        supabaseAdmin,
        contenido.portada_url
      );

      return {
        ...contenido,
        preview_url: previewUrl,
        portada_preview_url: portadaPreviewUrl,
      };
    })
  );
}

export async function GET() {
  try {
    const admin = await validarAdmin();

    if (!admin.ok) {
      return respuestaError(admin.error, admin.status);
    }

    const { data: contenidos, error } = await admin.supabaseAdmin
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
      .order("destacado", { ascending: false })
      .order("orden", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`No se pudieron cargar contenidos: ${error.message}`);
    }

    const contenidosConPreview = await agregarUrlsFirmadasAdmin(
      admin.supabaseAdmin,
      contenidos || []
    );

    return NextResponse.json({
      ok: true,
      contenidos: contenidosConPreview,
      total: contenidosConPreview.length,
    });
  } catch (error) {
    console.error("Error cargando contenidos admin:", error);

    return respuestaError(
      error?.message || "No se pudieron cargar los contenidos.",
      500
    );
  }
}

export async function POST(request) {
  try {
    const admin = await validarAdmin();

    if (!admin.ok) {
      return respuestaError(admin.error, admin.status);
    }

    const body = await request.json().catch(() => ({}));
    const validacion = validarDatosContenido(body);

    if (!validacion.ok) {
      return respuestaError(validacion.error, 400);
    }

    const { data, error } = await admin.supabaseAdmin
      .from("membresia_contenidos")
      .insert({
        ...validacion.datos,
        fecha_publicacion: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`No se pudo crear el contenido: ${error.message}`);
    }

    return NextResponse.json({
      ok: true,
      contenido: data,
    });
  } catch (error) {
    console.error("Error creando contenido membresía:", error);

    return respuestaError(
      error?.message || "No se pudo crear el contenido.",
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
    const id = limpiarTexto(body.id);

    if (!id) {
      return respuestaError("Falta el ID del contenido.", 400);
    }

    const validacion = validarDatosContenido(body);

    if (!validacion.ok) {
      return respuestaError(validacion.error, 400);
    }

    const { data, error } = await admin.supabaseAdmin
      .from("membresia_contenidos")
      .update(validacion.datos)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new Error(`No se pudo actualizar el contenido: ${error.message}`);
    }

    return NextResponse.json({
      ok: true,
      contenido: data,
    });
  } catch (error) {
    console.error("Error actualizando contenido membresía:", error);

    return respuestaError(
      error?.message || "No se pudo actualizar el contenido.",
      500
    );
  }
}

export async function DELETE(request) {
  try {
    const admin = await validarAdmin();

    if (!admin.ok) {
      return respuestaError(admin.error, admin.status);
    }

    const url = new URL(request.url);
    const id = limpiarTexto(url.searchParams.get("id"));

    if (!id) {
      return respuestaError("Falta el ID del contenido.", 400);
    }

    const { error } = await admin.supabaseAdmin
      .from("membresia_contenidos")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`No se pudo eliminar el contenido: ${error.message}`);
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Error eliminando contenido membresía:", error);

    return respuestaError(
      error?.message || "No se pudo eliminar el contenido.",
      500
    );
  }
}