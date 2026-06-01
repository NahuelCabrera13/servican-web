import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function verificarAdminPage(redirectTo = "/admin") {
  const supabase = await createClient();

  const {
    data: { user },
    error: errorUsuario,
  } = await supabase.auth.getUser();

  if (errorUsuario || !user) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }

  const { data: perfil, error: errorPerfil } = await supabase
    .from("perfiles")
    .select("id, user_id, email, nombre, role, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (errorPerfil || !perfil) {
    redirect("/acceso-denegado");
  }

  if (perfil.role !== "admin") {
    redirect("/acceso-denegado");
  }

  return {
    supabase,
    user,
    perfil,
  };
}