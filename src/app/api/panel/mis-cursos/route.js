import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const JERARQUIA_PLANES = {
  basico: 1,
  extenso: 2,
  pro: 3,
  plantel: 4,
};

function crearRespuestaError(mensaje, status = 500) {
  return NextResponse.json(
    {
      ok: false,
      error: mensaje,
    },
    { status }
  );
}

function normalizarNivel(nivel) {
  const valor = String(nivel || "basico").toLowerCase().trim();

  if (JERARQUIA_PLANES[valor]) {
    return valor;
  }

  return "basico";
}

function nivelesPermitidos(nivelAlumno) {
  const nivel = normalizarNivel(nivelAlumno);
  const valorNivel = JERARQUIA_PLANES[nivel];

  return Object.entries(JERARQUIA_PLANES)
    .filter(([, valor]) => valor <= valorNivel)
    .map(([nombre]) => nombre);
}

function nombrePlan(nivel) {
  const normalizado = normalizarNivel(nivel);

  const nombres = {
    basico: "Básico",
    extenso: "Extenso",
    pro: "Pro",
    plantel: "Plantel",
  };

  return nombres[normalizado] || "Básico";
}

async function obtenerUsuarioDesdeToken(supabase, request) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.replace("Bearer ", "").trim();

  if (!token) {
    return {
      user: null,
      error: "No hay token de sesión.",
    };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return {
      user: null,
      error: "Sesión inválida o expirada.",
    };
  }

  return {
    user,
    error: null,
  };
}

async function obtenerProgresoPorClases(supabase, userId, claseIds) {
  if (!claseIds.length) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("clase_progreso")
    .select("*")
    .eq("user_id", userId)
    .in("clase_id", claseIds);

  if (error) {
    console.error("Error cargando progreso:", error);
    return new Map();
  }

  return new Map((data || []).map((item) => [String(item.clase_id), item]));
}

async function obtenerCertificadosPorCurso(supabase, userId, cursoIds) {
  if (!cursoIds.length) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("certificados")
    .select("*")
    .eq("user_id", userId)
    .in("curso_id", cursoIds);

  if (error) {
    console.error("Error cargando certificados:", error);
    return new Map();
  }

  return new Map((data || []).map((item) => [String(item.curso_id), item]));
}

export async function GET(request) {
  try {
    const supabase = createAdminClient();

    const { user, error: errorUsuario } = await obtenerUsuarioDesdeToken(
      supabase,
      request
    );

    if (errorUsuario || !user) {
      return crearRespuestaError(errorUsuario || "No autorizado.", 401);
    }

    const { data: accesos, error: errorAccesos } = await supabase
      .from("alumno_cursos")
      .select(
        `
        id,
        user_id,
        curso_id,
        estado,
        nivel_acceso,
        fecha_inicio,
        fecha_fin,
        created_at,
        cursos (
          id,
          titulo,
          slug,
          descripcion,
          categoria,
          duracion,
          modalidad,
          imagen_url,
          activo
        )
      `
      )
      .eq("user_id", user.id)
      .eq("estado", "activo");

    if (errorAccesos) {
      console.error("Error cargando cursos del alumno:", errorAccesos);
      return crearRespuestaError("No se pudieron cargar tus cursos.", 500);
    }

    const accesosValidos = (accesos || []).filter(
      (acceso) => acceso.cursos && acceso.cursos.activo === true
    );

    const cursoIds = accesosValidos.map((acceso) => acceso.curso_id);

    const certificadosPorCurso = await obtenerCertificadosPorCurso(
      supabase,
      user.id,
      cursoIds
    );

    const cursosConContenido = [];

    for (const acceso of accesosValidos) {
      const curso = acceso.cursos;
      const nivelAlumno = normalizarNivel(acceso.nivel_acceso);
      const niveles = nivelesPermitidos(nivelAlumno);

      const { data: modulos, error: errorModulos } = await supabase
        .from("curso_modulos")
        .select("*")
        .eq("curso_id", curso.id)
        .eq("activo", true)
        .in("nivel_minimo_acceso", niveles)
        .order("orden", { ascending: true })
        .order("id", { ascending: true });

      if (errorModulos) {
        console.error("Error cargando módulos:", {
          curso_id: curso.id,
          error: errorModulos,
        });

        cursosConContenido.push({
          acceso,
          curso,
          nivel_acceso: nivelAlumno,
          nombre_plan: nombrePlan(nivelAlumno),
          niveles_permitidos: niveles,
          modulos: [],
          total_clases: 0,
          clases_completadas: 0,
          porcentaje: 0,
          certificado: certificadosPorCurso.get(String(curso.id)) || null,
          error_contenido: "No se pudieron cargar los módulos.",
        });

        continue;
      }

      const moduloIds = (modulos || []).map((modulo) => modulo.id);

      let clases = [];

      if (moduloIds.length) {
        const { data: clasesData, error: errorClases } = await supabase
          .from("curso_clases")
          .select("*")
          .in("modulo_id", moduloIds)
          .eq("activo", true)
          .in("nivel_minimo_acceso", niveles)
          .order("orden", { ascending: true })
          .order("id", { ascending: true });

        if (errorClases) {
          console.error("Error cargando clases:", {
            curso_id: curso.id,
            error: errorClases,
          });
        } else {
          clases = clasesData || [];
        }
      }

      const claseIds = clases.map((clase) => clase.id);

      const progresoPorClase = await obtenerProgresoPorClases(
        supabase,
        user.id,
        claseIds
      );

      const clasesConProgreso = clases.map((clase) => {
        const progreso = progresoPorClase.get(String(clase.id));

        return {
          ...clase,
          progreso: progreso || null,
          completada: Boolean(progreso?.completada),
        };
      });

      const clasesPorModulo = new Map();

      for (const clase of clasesConProgreso) {
        const listaActual = clasesPorModulo.get(String(clase.modulo_id)) || [];
        listaActual.push(clase);
        clasesPorModulo.set(String(clase.modulo_id), listaActual);
      }

      const modulosConClases = (modulos || []).map((modulo) => ({
        ...modulo,
        clases: clasesPorModulo.get(String(modulo.id)) || [],
      }));

      const totalClases = clasesConProgreso.length;
      const clasesCompletadas = clasesConProgreso.filter(
        (clase) => clase.completada
      ).length;

      const porcentaje =
        totalClases > 0
          ? Math.round((clasesCompletadas / totalClases) * 100)
          : 0;

      cursosConContenido.push({
        acceso,
        curso,
        nivel_acceso: nivelAlumno,
        nombre_plan: nombrePlan(nivelAlumno),
        niveles_permitidos: niveles,
        modulos: modulosConClases,
        total_clases: totalClases,
        clases_completadas: clasesCompletadas,
        porcentaje,
        certificado: certificadosPorCurso.get(String(curso.id)) || null,
      });
    }

    return NextResponse.json({
      ok: true,
      usuario: {
        id: user.id,
        email: user.email,
      },
      cursos: cursosConContenido,
    });
  } catch (error) {
    console.error("Error en API /api/panel/mis-cursos:", error);

    return crearRespuestaError(
      error?.message || "Error cargando panel del alumno.",
      500
    );
  }
}