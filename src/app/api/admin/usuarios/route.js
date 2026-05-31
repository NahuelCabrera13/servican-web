import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

const ROLES_PERMITIDOS = ["admin", "instructor", "alumno"];
const ESTADOS_ACCESO = ["activo", "pendiente", "pausado", "finalizado", "cancelado"];

async function verificarAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      status: 401,
      error: "No has iniciado sesión.",
    };
  }

  const { data: perfil, error } = await supabase
    .from("perfiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (error || !perfil || perfil.role !== "admin") {
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

  return createSupabaseAdminClient(supabaseUrl, serviceRoleKey);
}

export async function GET() {
  try {
    const admin = await verificarAdmin();

    if (!admin.ok) {
      return NextResponse.json(
        { error: admin.error },
        { status: admin.status }
      );
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { data: perfiles, error: perfilesError } = await supabaseAdmin
      .from("perfiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (perfilesError) {
      return NextResponse.json(
        { error: perfilesError.message },
        { status: 500 }
      );
    }

    const { data: usuariosAuth, error: usuariosError } =
      await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (usuariosError) {
      return NextResponse.json(
        { error: usuariosError.message },
        { status: 500 }
      );
    }

    const { data: cursos, error: cursosError } = await supabaseAdmin
      .from("cursos")
      .select("id, titulo, slug, categoria, activo")
      .order("titulo", { ascending: true });

    if (cursosError) {
      return NextResponse.json(
        { error: cursosError.message },
        { status: 500 }
      );
    }

    const { data: accesos, error: accesosError } = await supabaseAdmin
      .from("alumno_cursos")
      .select(`
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
      `)
      .order("created_at", { ascending: false });

    if (accesosError) {
      return NextResponse.json(
        { error: accesosError.message },
        { status: 500 }
      );
    }

    const usuarios = (perfiles || []).map((perfil) => {
      const usuarioAuth = usuariosAuth?.users?.find(
        (usuario) => usuario.id === perfil.user_id
      );

      const cursosHabilitados = (accesos || []).filter(
        (acceso) => acceso.user_id === perfil.user_id
      );

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
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const admin = await verificarAdmin();

    if (!admin.ok) {
      return NextResponse.json(
        { error: admin.error },
        { status: admin.status }
      );
    }

    const body = await request.json();
    const tipo = body?.tipo || "rol";

    const supabaseAdmin = crearSupabaseAdmin();

    if (tipo === "acceso_curso") {
      const userId = body?.user_id;
      const cursoId = body?.curso_id;
      const estado = body?.estado || "activo";

      if (!userId || !cursoId) {
        return NextResponse.json(
          { error: "Falta el usuario o el curso." },
          { status: 400 }
        );
      }

      if (!ESTADOS_ACCESO.includes(estado)) {
        return NextResponse.json(
          { error: "Estado de acceso no permitido." },
          { status: 400 }
        );
      }

      const { data: acceso, error } = await supabaseAdmin
        .from("alumno_cursos")
        .upsert(
          {
            user_id: userId,
            curso_id: Number(cursoId),
            estado,
          },
          {
            onConflict: "user_id,curso_id",
          }
        )
        .select(`
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
        `)
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        acceso,
      });
    }

    const userId = body?.user_id;
    const role = body?.role;
    const nombre = body?.nombre;

    if (!userId) {
      return NextResponse.json(
        { error: "Falta el ID del usuario." },
        { status: 400 }
      );
    }

    if (!role || !ROLES_PERMITIDOS.includes(role)) {
      return NextResponse.json(
        { error: "Rol no permitido." },
        { status: 400 }
      );
    }

    const { data: perfilActual, error: perfilActualError } =
      await supabaseAdmin
        .from("perfiles")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (perfilActualError || !perfilActual) {
      return NextResponse.json(
        { error: "No se encontró el perfil del usuario." },
        { status: 404 }
      );
    }

    if (perfilActual.role === "admin" && role !== "admin") {
      const { count, error: countError } = await supabaseAdmin
        .from("perfiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");

      if (countError) {
        return NextResponse.json(
          { error: countError.message },
          { status: 500 }
        );
      }

      if ((count || 0) <= 1) {
        return NextResponse.json(
          {
            error:
              "No podés quitar el último administrador. Debe quedar al menos un admin.",
          },
          { status: 400 }
        );
      }
    }

    const datosActualizados = {
      role,
    };

    if (typeof nombre === "string") {
      datosActualizados.nombre = nombre;
    }

    const { data: perfilActualizado, error } = await supabaseAdmin
      .from("perfiles")
      .update(datosActualizados)
      .eq("user_id", userId)
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
      usuario: perfilActualizado,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const admin = await verificarAdmin();

    if (!admin.ok) {
      return NextResponse.json(
        { error: admin.error },
        { status: admin.status }
      );
    }

    const body = await request.json();
    const tipo = body?.tipo;

    if (tipo !== "acceso_curso") {
      return NextResponse.json(
        { error: "Tipo de eliminación inválido." },
        { status: 400 }
      );
    }

    const id = body?.id;

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID del acceso." },
        { status: 400 }
      );
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const { error } = await supabaseAdmin
      .from("alumno_cursos")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}