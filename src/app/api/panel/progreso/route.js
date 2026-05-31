import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

const CAMPOS_PROGRESO = `
  id,
  user_id,
  clase_id,
  completada,
  completada_at,
  created_at
`;

const CAMPOS_CERTIFICADO = `
  id,
  user_id,
  curso_id,
  codigo,
  nombre_alumno,
  email_alumno,
  titulo_curso,
  estado,
  emitido_at,
  created_at
`;

function crearRespuestaError(mensaje, status = 500) {
  return NextResponse.json(
    {
      ok: false,
      error: mensaje,
    },
    { status }
  );
}

function validarId(id) {
  const numero = Number(id);

  if (!Number.isInteger(numero) || numero <= 0) {
    return null;
  }

  return numero;
}

function generarCodigoCertificado() {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const random = crypto.randomUUID().slice(0, 8).toUpperCase();

  return `SERVICAN-${anio}-${random}`;
}

function crearSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Faltan variables de entorno de Supabase.");
  }

  return createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function obtenerPerfil(supabase, userId) {
  const { data: perfil, error } = await supabase
    .from("perfiles")
    .select("id, user_id, nombre, email, role")
    .eq("user_id", userId)
    .single();

  if (error || !perfil) {
    return null;
  }

  return perfil;
}

function clasesActivasOrdenadas(modulos) {
  return (modulos || [])
    .flatMap((modulo) =>
      (modulo.clases || [])
        .filter((clase) => clase.activo)
        .map((clase) => ({
          ...clase,
          modulo_id: modulo.id,
          modulo_orden: modulo.orden,
        }))
    )
    .sort((a, b) => {
      if (a.modulo_orden !== b.modulo_orden) {
        return a.modulo_orden - b.modulo_orden;
      }

      return a.orden - b.orden;
    });
}

async function generarOCargarCertificado({
  supabaseAdmin,
  user,
  perfil,
  cursoId,
  tituloCurso,
}) {
  const { data: certificadoExistente } = await supabaseAdmin
    .from("certificados")
    .select(CAMPOS_CERTIFICADO)
    .eq("user_id", user.id)
    .eq("curso_id", cursoId)
    .maybeSingle();

  if (certificadoExistente) {
    return certificadoExistente;
  }

  for (let intento = 0; intento < 5; intento += 1) {
    const { data: nuevoCertificado, error: errorCertificado } =
      await supabaseAdmin
        .from("certificados")
        .insert({
          user_id: user.id,
          curso_id: cursoId,
          codigo: generarCodigoCertificado(),
          nombre_alumno: perfil?.nombre || user.user_metadata?.nombre || "",
          email_alumno: perfil?.email || user.email || "",
          titulo_curso: tituloCurso,
          estado: "emitido",
        })
        .select(CAMPOS_CERTIFICADO)
        .single();

    if (!errorCertificado && nuevoCertificado) {
      return nuevoCertificado;
    }

    const codigoDuplicado =
      errorCertificado?.code === "23505" ||
      String(errorCertificado?.message || "").includes("duplicate");

    if (!codigoDuplicado) {
      break;
    }
  }

  return null;
}

export async function POST(request) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: errorUsuario,
    } = await supabase.auth.getUser();

    if (errorUsuario || !user) {
      return crearRespuestaError("No has iniciado sesión.", 401);
    }

    const body = await request.json();

    const claseId = validarId(body?.clase_id);
    const completada = Boolean(body?.completada);

    if (!claseId) {
      return crearRespuestaError("ID de clase inválido.", 400);
    }

    const perfil = await obtenerPerfil(supabase, user.id);

    if (!perfil) {
      return crearRespuestaError("No se encontró tu perfil.", 403);
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { data: clase, error: errorClase } = await supabaseAdmin
      .from("curso_clases")
      .select(`
        id,
        titulo,
        orden,
        activo,
        modulo:curso_modulos (
          id,
          curso_id,
          orden,
          activo,
          curso:cursos (
            id,
            titulo,
            activo
          )
        )
      `)
      .eq("id", claseId)
      .single();

    if (errorClase || !clase) {
      return crearRespuestaError("Clase no encontrada.", 404);
    }

    if (!clase.activo || !clase.modulo?.activo) {
      return crearRespuestaError("Esta clase no está activa.", 403);
    }

    const curso = clase.modulo?.curso;
    const cursoId = clase.modulo?.curso_id;

    if (!cursoId || !curso) {
      return crearRespuestaError(
        "No se pudo encontrar el curso de la clase.",
        400
      );
    }

    if (!curso.activo) {
      return crearRespuestaError("Este curso no está activo.", 403);
    }

    const esAdminOInstructor =
      perfil.role === "admin" || perfil.role === "instructor";

    if (!esAdminOInstructor) {
      const { data: acceso } = await supabaseAdmin
        .from("alumno_cursos")
        .select("id, estado")
        .eq("user_id", user.id)
        .eq("curso_id", cursoId)
        .eq("estado", "activo")
        .maybeSingle();

      if (!acceso) {
        return crearRespuestaError(
          "No tenés acceso activo a este curso.",
          403
        );
      }
    }

    const { data: modulos, error: errorModulos } = await supabaseAdmin
      .from("curso_modulos")
      .select(`
        id,
        orden,
        activo,
        clases:curso_clases (
          id,
          orden,
          activo
        )
      `)
      .eq("curso_id", cursoId)
      .eq("activo", true)
      .order("orden", { ascending: true })
      .order("orden", {
        referencedTable: "curso_clases",
        ascending: true,
      });

    if (errorModulos) {
      return crearRespuestaError("No se pudo verificar el curso.", 500);
    }

    const clasesOrdenadas = clasesActivasOrdenadas(modulos);
    const indiceClaseActual = clasesOrdenadas.findIndex(
      (item) => item.id === claseId
    );

    if (indiceClaseActual === -1) {
      return crearRespuestaError("La clase no pertenece al curso activo.", 400);
    }

    if (completada && indiceClaseActual > 0) {
      const claseAnterior = clasesOrdenadas[indiceClaseActual - 1];

      const { data: progresoAnterior } = await supabaseAdmin
        .from("clase_progreso")
        .select("id, completada")
        .eq("user_id", user.id)
        .eq("clase_id", claseAnterior.id)
        .eq("completada", true)
        .maybeSingle();

      if (!progresoAnterior) {
        return crearRespuestaError(
          "No podés completar esta clase antes de finalizar la clase anterior.",
          403
        );
      }
    }

    const { data: progreso, error: errorProgreso } = await supabaseAdmin
      .from("clase_progreso")
      .upsert(
        {
          user_id: user.id,
          clase_id: claseId,
          completada,
          completada_at: completada ? new Date().toISOString() : null,
        },
        {
          onConflict: "user_id,clase_id",
        }
      )
      .select(CAMPOS_PROGRESO)
      .single();

    if (errorProgreso || !progreso) {
      return crearRespuestaError("No se pudo guardar el progreso.", 500);
    }

    let certificado = null;

    if (completada && clasesOrdenadas.length > 0) {
      const idsClasesActivas = clasesOrdenadas.map((item) => item.id);

      const { data: progresosCompletados, error: errorProgresos } =
        await supabaseAdmin
          .from("clase_progreso")
          .select("clase_id, completada")
          .eq("user_id", user.id)
          .in("clase_id", idsClasesActivas)
          .eq("completada", true);

      if (!errorProgresos) {
        const totalClases = idsClasesActivas.length;
        const totalCompletadas = progresosCompletados?.length || 0;
        const cursoCompletado = totalClases === totalCompletadas;

        if (cursoCompletado) {
          certificado = await generarOCargarCertificado({
            supabaseAdmin,
            user,
            perfil,
            cursoId,
            tituloCurso: curso.titulo,
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      progreso,
      certificado,
    });
  } catch (error) {
    return crearRespuestaError("Error interno del servidor.", 500);
  }
}