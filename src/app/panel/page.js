import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PanelUsuario from "./PanelUsuario";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Panel privado | SERVICAN",
  description: "Panel privado del usuario en la plataforma SERVICAN.",
};

export default async function PanelPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: errorUsuario,
  } = await supabase.auth.getUser();

  if (errorUsuario || !user) {
    redirect("/login?redirect=/panel");
  }

  const { data: perfil, error: errorPerfil } = await supabase
    .from("perfiles")
    .select("id, user_id, email, nombre, role, created_at")
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
      created_at,
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
    .select(`
      id,
      user_id,
      curso_id,
      codigo,
      nombre_alumno,
      email_alumno,
      titulo_curso,
      estado,
      emitido_at,
      created_at
    `)
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