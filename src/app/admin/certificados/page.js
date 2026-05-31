import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CertificadosPanel from "./CertificadosPanel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Certificados | SERVICAN Admin",
  description: "Gestión privada de certificados emitidos por SERVICAN.",
};

export default async function AdminCertificadosPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: errorUsuario,
  } = await supabase.auth.getUser();

  if (errorUsuario || !user) {
    redirect("/login?redirect=/admin/certificados");
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

  return <CertificadosPanel usuario={user} perfil={perfil} />;
}