import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CertificadosPanel from "./CertificadosPanel";

export const dynamic = "force-dynamic";

export default async function AdminCertificadosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin/certificados");
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

  return <CertificadosPanel usuario={user} perfil={perfil} />;
}