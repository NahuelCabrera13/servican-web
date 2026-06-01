import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function verificarAdmin(request) {
  const authHeader = request?.headers?.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();

  let user = null;

  if (token) {
    const supabaseAdmin = createAdminClient();

    const { data: userData, error: userError } =
      await supabaseAdmin.auth.getUser(token);

    if (userError || !userData?.user) {
      return {
        ok: false,
        status: 401,
        error: "Sesión inválida o expirada.",
      };
    }

    user = userData.user;
  } else {
    const supabase = await createClient();

    const {
      data: { user: usuarioSesion },
      error: errorUsuario,
    } = await supabase.auth.getUser();

    if (errorUsuario || !usuarioSesion) {
      return {
        ok: false,
        status: 401,
        error: "No autorizado. Iniciá sesión nuevamente.",
      };
    }

    user = usuarioSesion;
  }

  const supabaseAdmin = createAdminClient();

  const { data: perfil, error: perfilError } = await supabaseAdmin
    .from("perfiles")
    .select("id, user_id, email, nombre, role, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (perfilError) {
    return {
      ok: false,
      status: 500,
      error: "No se pudo verificar el perfil del usuario.",
    };
  }

  if (!perfil) {
    return {
      ok: false,
      status: 403,
      error: "Acceso denegado. El usuario no tiene perfil.",
    };
  }

  if (perfil.role !== "admin") {
    return {
      ok: false,
      status: 403,
      error: "Acceso denegado. Solo administradores.",
    };
  }

  return {
    ok: true,
    user,
    perfil,
    supabase: supabaseAdmin,
  };
}