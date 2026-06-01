import { createAdminClient } from "@/lib/supabase/admin";

export async function verificarAdmin(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return {
      ok: false,
      status: 401,
      error: "No autorizado. Falta token de sesión.",
    };
  }

  const supabase = createAdminClient();

  const { data: userData, error: userError } = await supabase.auth.getUser(
    token
  );

  if (userError || !userData?.user) {
    return {
      ok: false,
      status: 401,
      error: "Sesión inválida o expirada.",
    };
  }

  const user = userData.user;

  const { data: perfil, error: perfilError } = await supabase
    .from("perfiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (perfilError) {
    return {
      ok: false,
      status: 500,
      error: "No se pudo verificar el perfil del usuario.",
    };
  }

  if (perfil?.role !== "admin") {
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
    supabase,
  };
}