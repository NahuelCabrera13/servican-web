import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "No has iniciado sesión." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const claseId = body?.clase_id;
    const completada = Boolean(body?.completada);

    if (!claseId) {
      return NextResponse.json(
        { error: "Falta el ID de la clase." },
        { status: 400 }
      );
    }

    const { data: clase, error: errorClase } = await supabase
      .from("curso_clases")
      .select(`
        id,
        modulo:curso_modulos (
          id,
          curso_id
        )
      `)
      .eq("id", claseId)
      .single();

    if (errorClase || !clase) {
      return NextResponse.json(
        { error: "Clase no encontrada." },
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

    const { data: perfil } = await supabase
      .from("perfiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const esAdminOInstructor =
      perfil?.role === "admin" || perfil?.role === "instructor";

    if (!esAdminOInstructor) {
      const { data: acceso } = await supabase
        .from("alumno_cursos")
        .select("id, estado")
        .eq("user_id", user.id)
        .eq("curso_id", cursoId)
        .eq("estado", "activo")
        .maybeSingle();

      if (!acceso) {
        return NextResponse.json(
          { error: "No tenés acceso activo a este curso." },
          { status: 403 }
        );
      }
    }

    const { data: progreso, error } = await supabase
      .from("clase_progreso")
      .upsert(
        {
          user_id: user.id,
          clase_id: Number(claseId),
          completada,
          completada_at: completada ? new Date().toISOString() : null,
        },
        {
          onConflict: "user_id,clase_id",
        }
      )
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      progreso,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}