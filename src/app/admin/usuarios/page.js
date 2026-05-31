import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UsuariosPanel from "./UsuariosPanel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Usuarios | SERVICAN Admin",
  description: "Gestión privada de usuarios, roles y accesos a cursos.",
};

export default async function AdminUsuariosPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: errorUsuario,
  } = await supabase.auth.getUser();

  if (errorUsuario || !user) {
    redirect("/login?redirect=/admin/usuarios");
  }

  const { data: perfil, error: errorPerfil } = await supabase
    .from("perfiles")
    .select("id, user_id, email, nombre, role, created_at")
    .eq("user_id", user.id)
    .single();

  if (errorPerfil || !perfil) {
    redirect("/acceso-denegado");
  }

  if (perfil.role !== "admin") {
    redirect("/acceso-denegado");
  }

  return <UsuariosPanel usuarioActual={user} perfilActual={perfil} />;
}