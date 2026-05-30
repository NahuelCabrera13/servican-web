import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UsuariosPanel from "./UsuariosPanel";

export default async function AdminUsuariosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin/usuarios");
  }

  const { data: perfil, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !perfil) {
    redirect("/acceso-denegado");
  }

  if (perfil.role !== "admin") {
    redirect("/acceso-denegado");
  }

  return <UsuariosPanel usuarioActual={user} perfilActual={perfil} />;
}