import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

function crearSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Faltan variables de entorno de Supabase.");
  }

  return createSupabaseAdminClient(supabaseUrl, serviceRoleKey);
}

function generarCodigoCertificado() {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `SERVICAN-${anio}-${random}`;
}

export async function POST(request) {
  try {
    const supabase = await createSupabaseServerClient();

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
      .select("nombre, email, role")
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

    let certificado = null;

    if (completada) {
      const supabaseAdmin = crearSupabaseAdmin();

      const { data: curso } = await supabaseAdmin
        .from("cursos")
        .select("id, titulo")
        .eq("id", cursoId)
        .single();

      const { data: modulos } = await supabaseAdmin
        .from("curso_modulos")
        .select(`
          id,
          activo,
          clases:curso_clases (
            id,
            activo
          )
        `)
        .eq("curso_id", cursoId)
        .eq("activo", true);

      const clasesActivas = (modulos || []).flatMap((modulo) =>
        (modulo.clases || []).filter((clase) => clase.activo)
      );

      const idsClasesActivas = clasesActivas.map((clase) => clase.id);

      if (idsClasesActivas.length > 0) {
        const { data: progresosCompletados } = await supabaseAdmin
          .from("clase_progreso")
          .select("clase_id, completada")
          .eq("user_id", user.id)
          .in("clase_id", idsClasesActivas)
          .eq("completada", true);

        const totalClases = idsClasesActivas.length;
        const totalCompletadas = progresosCompletados?.length || 0;

        const cursoCompletado = totalClases === totalCompletadas;

        if (cursoCompletado && curso) {
          const { data: certificadoExistente } = await supabaseAdmin
            .from("certificados")
            .select("*")
            .eq("user_id", user.id)
            .eq("curso_id", cursoId)
            .maybeSingle();

          if (certificadoExistente) {
            certificado = certificadoExistente;
          } else {
            const { data: nuevoCertificado, error: errorCertificado } =
              await supabaseAdmin
                .from("certificados")
                .insert({
                  user_id: user.id,
                  curso_id: cursoId,
                  codigo: generarCodigoCertificado(),
                  nombre_alumno:
                    perfil?.nombre || user.user_metadata?.nombre || "",
                  email_alumno: perfil?.email || user.email || "",
                  titulo_curso: curso.titulo,
                  estado: "emitido",
                })
                .select("*")
                .single();

            if (!errorCertificado) {
              certificado = nuevoCertificado;
            }
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      progreso,
      certificado,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}