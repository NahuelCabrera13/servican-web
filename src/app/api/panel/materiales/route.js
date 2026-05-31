import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

const BUCKET_MATERIALES = "materiales-cursos";

function crearSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Faltan variables de entorno de Supabase.");
  }

  return createSupabaseAdminClient(supabaseUrl, serviceRoleKey);
}

export async function GET(request) {
  try {
    const requestUrl = new URL(request.url);
    const claseId = requestUrl.searchParams.get("clase_id");

    if (!claseId) {
      return NextResponse.json(
        { error: "Falta el ID de la clase." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL(`/login?redirect=/panel`, request.url)
      );
    }

    const { data: perfil } = await supabase
      .from("perfiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const supabaseAdmin = crearSupabaseAdmin();

    const { data: clase, error: errorClase } = await supabaseAdmin
      .from("curso_clases")
      .select(`
        id,
        pdf_url,
        modulo:curso_modulos (
          id,
          curso_id
        )
      `)
      .eq("id", Number(claseId))
      .single();

    if (errorClase || !clase) {
      return NextResponse.json(
        { error: "No se encontró la clase." },
        { status: 404 }
      );
    }

    if (!clase.pdf_url) {
      return NextResponse.json(
        { error: "Esta clase no tiene material cargado." },
        { status: 404 }
      );
    }

    const cursoId = clase.modulo?.curso_id;

    if (!cursoId) {
      return NextResponse.json(
        { error: "No se pudo encontrar el curso de la clase." },
        { status: 400 }
      );
    }

    const esAdminOInstructor =
      perfil?.role === "admin" || perfil?.role === "instructor";

    if (!esAdminOInstructor) {
      const { data: acceso } = await supabaseAdmin
        .from("alumno_cursos")
        .select("id, estado")
        .eq("user_id", user.id)
        .eq("curso_id", cursoId)
        .eq("estado", "activo")
        .maybeSingle();

      if (!acceso) {
        return NextResponse.json(
          { error: "No tenés acceso activo a este material." },
          { status: 403 }
        );
      }
    }

    if (clase.pdf_url.startsWith("http://") || clase.pdf_url.startsWith("https://")) {
      return NextResponse.redirect(clase.pdf_url);
    }

    const { data: signedUrl, error: errorSignedUrl } =
      await supabaseAdmin.storage
        .from(BUCKET_MATERIALES)
        .createSignedUrl(clase.pdf_url, 60 * 10);

    if (errorSignedUrl || !signedUrl?.signedUrl) {
      return NextResponse.json(
        { error: "No se pudo abrir el material." },
        { status: 500 }
      );
    }

    return NextResponse.redirect(signedUrl.signedUrl);
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}