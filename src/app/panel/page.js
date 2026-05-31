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

  const { data: perfil, error: errorPerfil } = await supabase
    .from("perfiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (errorPerfil || !perfil) {
    redirect("/acceso-denegado");
  }

  const { data: cursosHabilitados, error: errorCursos } = await supabase
    .from("alumno_cursos")
    .select(`
      id,
      estado,
      fecha_inicio,
      fecha_fin,
      curso:cursos (
        id,
        titulo,
        slug,
        descripcion,
        categoria,
        precio,
        duracion,
        modalidad,
        imagen_url,
        activo,
        destacado
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: certificados, error: errorCertificados } = await supabase
    .from("certificados")
    .select("*")
    .eq("user_id", user.id)
    .order("emitido_at", { ascending: false });

  return (
    <PanelUsuario
      usuario={user}
      perfil={perfil}
      cursosHabilitados={cursosHabilitados || []}
      certificados={certificados || []}
      errorCursos={errorCursos?.message || null}
      errorCertificados={errorCertificados?.message || null}
    />
  );
}