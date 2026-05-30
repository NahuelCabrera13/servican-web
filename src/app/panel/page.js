import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PanelUsuario from "./PanelUsuario";

export default async function PanelPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/panel");
  }

  const { data: perfil, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !perfil) {
    redirect("/acceso-denegado");
  }

  return <PanelUsuario usuario={user} perfil={perfil} />;
}