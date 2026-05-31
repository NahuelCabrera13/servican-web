import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

const ROLES_PERMITIDOS = ["admin", "instructor", "alumno"];
const ESTADOS_ACCESO = [
  "activo",
  "pendiente",
  "pausado",
  "finalizado",
  "cancelado",
];

const CAMPOS_PERFIL = `
  id,
  user_id,
  nombre,
  email,
  role,
  created_at
`;

const CAMPOS_CURSO_SIMPLE = `
  id,
  titulo,
  slug,
  categoria,
  activo
`;

const CAMPOS_ACCESO = `
  id,
  user_id,
  curso_id,
  estado,
  fecha_inicio,
  fecha_fin,
  created_at,
  curso:cursos (
    id,
    titulo,
    slug,
    categoria,
    activo
  )
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

function validarIdNumerico(id) {
  const numero = Number(id);

  if (!Number.isInteger(numero) || numero <= 0) {
    return null;
  }

  return numero;
}

function validarUuid(valor) {
  if (!valor) return false;

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(valor)
  );
}

function limpiarTexto(valor, maximo = 120) {
  return String(valor || "").trim().slice(0, maximo);
}

async function verificarAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: errorUsuario,
  } = await supabase.auth.getUser();

  if (errorUsuario || !user) {
    return {
      ok: false,
      status: 401,
      error: "No has iniciado sesión.",
    };
  }

  const { data: perfil, error: errorPerfil } = await supabase
    .from("perfiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (errorPerfil || !perfil || perfil.role !== "admin") {
    return {
      ok: false,
      status: 403,
      error: "No tenés permisos de administrador.",
    };
  }

  return {
    ok: true,
    user,
    perfil,
  };
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

export async function GET() {
  try {
    const admin = await verificarAdmin();

    if (!admin.ok) {
      return crearRespuestaError(admin.error, admin.status);
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { data: perfiles, error: perfilesError } = await supabaseAdmin
      .from("perfiles")
      .select(CAMPOS_PERFIL)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (perfilesError) {
      return crearRespuestaError("No se pudieron cargar los perfiles.", 500);
    }

    const { data: usuariosAuth, error: usuariosError } =
      await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (usuariosError) {
      return crearRespuestaError("No se pudieron cargar los usuarios.", 500);
    }

    const { data: cursos, error: cursosError } = await supabaseAdmin
      .from("cursos")
      .select(CAMPOS_CURSO_SIMPLE)
      .order("titulo", { ascending: true })
      .limit(500);

    if (cursosError) {
      return crearRespuestaError("No se pudieron cargar los cursos.", 500);
    }

    const { data: accesos, error: accesosError } = await supabaseAdmin
      .from("alumno_cursos")
      .select(CAMPOS_ACCESO)
      .order("created_at", { ascending: false })
      .limit(3000);

    if (accesosError) {
      return crearRespuestaError(
        "No se pudieron cargar los accesos a cursos.",
        500
      );
    }

    const usuariosAuthPorId = new Map();

    for (const usuario of usuariosAuth?.users || []) {
      usuariosAuthPorId.set(usuario.id, usuario);
    }

    const accesosPorUsuario = new Map();

    for (const acceso of accesos || []) {
      const lista = accesosPorUsuario.get(acceso.user_id) || [];
      lista.push(acceso);
      accesosPorUsuario.set(acceso.user_id, lista);
    }

    const usuarios = (perfiles || []).map((perfil) => {
      const usuarioAuth = usuariosAuthPorId.get(perfil.user_id);
      const cursosHabilitados = accesosPorUsuario.get(perfil.user_id) || [];

      return {
        id: perfil.id,
        user_id: perfil.user_id,
        nombre: perfil.nombre || "",
        email: perfil.email || usuarioAuth?.email || "",
        role: perfil.role || "alumno",
        created_at: perfil.created_at,
        ultimo_ingreso: usuarioAuth?.last_sign_in_at || null,
        confirmado: Boolean(usuarioAuth?.email_confirmed_at),
        cursos_habilitados: cursosHabilitados,
      };
    });

    return NextResponse.json({
      ok: true,
      usuarios,
      cursos: cursos || [],
    });
  } catch (error) {
    return crearRespuestaError("Error interno del servidor.", 500);
  }
}

export async function PATCH(request) {
  try {
    const admin = await verificarAdmin();

    if (!admin.ok) {
      return crearRespuestaError(admin.error, admin.status);
    }

    const body = await request.json();
    const tipo = body?.tipo || "rol";

    const supabaseAdmin = crearSupabaseAdmin();

    if (tipo === "acceso_curso") {
      const userId = String(body?.user_id || "").trim();
      const cursoId = validarIdNumerico(body?.curso_id);
      const estado = String(body?.estado || "activo").trim();

      if (!validarUuid(userId)) {
        return crearRespuestaError("ID de usuario inválido.", 400);
      }

      if (!cursoId) {
        return crearRespuestaError("ID de curso inválido.", 400);
      }

      if (!ESTADOS_ACCESO.includes(estado)) {
        return crearRespuestaError("Estado de acceso no permitido.", 400);
      }

      const { data: perfilExiste } = await supabaseAdmin
        .from("perfiles")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!perfilExiste) {
        return crearRespuestaError("No se encontró el usuario.", 404);
      }

      const { data: cursoExiste } = await supabaseAdmin
        .from("cursos")
        .select("id")
        .eq("id", cursoId)
        .maybeSingle();

      if (!cursoExiste) {
        return crearRespuestaError("No se encontró el curso.", 404);
      }

      const { data: acceso, error } = await supabaseAdmin
        .from("alumno_cursos")
        .upsert(
          {
            user_id: userId,
            curso_id: cursoId,
            estado,
          },
          {
            onConflict: "user_id,curso_id",
          }
        )
        .select(CAMPOS_ACCESO)
        .single();

      if (error || !acceso) {
        return crearRespuestaError(
          "No se pudo habilitar o actualizar el curso del alumno.",
          500
        );
      }

      return NextResponse.json({
        ok: true,
        acceso,
      });
    }

    if (tipo !== "rol") {
      return crearRespuestaError("Tipo de actualización inválido.", 400);
    }

    const userId = String(body?.user_id || "").trim();
    const role = String(body?.role || "").trim();
    const nombre = limpiarTexto(body?.nombre, 120);

    if (!validarUuid(userId)) {
      return crearRespuestaError("ID de usuario inválido.", 400);
    }

    if (!ROLES_PERMITIDOS.includes(role)) {
      return crearRespuestaError("Rol no permitido.", 400);
    }

    const { data: perfilActual, error: perfilActualError } =
      await supabaseAdmin
        .from("perfiles")
        .select(CAMPOS_PERFIL)
        .eq("user_id", userId)
        .single();

    if (perfilActualError || !perfilActual) {
      return crearRespuestaError("No se encontró el perfil del usuario.", 404);
    }

    if (perfilActual.role === "admin" && role !== "admin") {
      const { count, error: countError } = await supabaseAdmin
        .from("perfiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");

      if (countError) {
        return crearRespuestaError(
          "No se pudo verificar la cantidad de administradores.",
          500
        );
      }

      if ((count || 0) <= 1) {
        return crearRespuestaError(
          "No podés quitar el último administrador. Debe quedar al menos un admin.",
          400
        );
      }
    }

    const datosActualizados = {
      role,
    };

    if (typeof body?.nombre === "string") {
      datosActualizados.nombre = nombre;
    }

    const { data: perfilActualizado, error } = await supabaseAdmin
      .from("perfiles")
      .update(datosActualizados)
      .eq("user_id", userId)
      .select(CAMPOS_PERFIL)
      .single();

    if (error || !perfilActualizado) {
      return crearRespuestaError("No se pudo actualizar el usuario.", 500);
    }

    return NextResponse.json({
      ok: true,
      usuario: perfilActualizado,
    });
  } catch (error) {
    return crearRespuestaError("Error interno del servidor.", 500);
  }
}

export async function DELETE(request) {
  try {
    const admin = await verificarAdmin();

    if (!admin.ok) {
      return crearRespuestaError(admin.error, admin.status);
    }

    const body = await request.json();
    const tipo = body?.tipo;

    if (tipo !== "acceso_curso") {
      return crearRespuestaError("Tipo de eliminación inválido.", 400);
    }

    const id = validarIdNumerico(body?.id);

    if (!id) {
      return crearRespuestaError("ID de acceso inválido.", 400);
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("alumno_cursos")
      .delete()
      .eq("id", id)
      .select("id")
      .single();

    if (error || !data) {
      return crearRespuestaError("No se pudo eliminar el acceso al curso.", 500);
    }

    return NextResponse.json({
      ok: true,
      id: data.id,
    });
  } catch (error) {
    return crearRespuestaError("Error interno del servidor.", 500);
  }
}