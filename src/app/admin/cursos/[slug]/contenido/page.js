import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ContenidoCursoPanel from "./ContenidoCursoPanel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contenido del curso | SERVICAN Admin",
  description: "Gestión privada de módulos, clases y materiales del curso.",
};

export default async function AdminContenidoCursoPage({ params }) {
  const { slug } = await params;

  if (!slug) {
    redirect("/admin");
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: errorUsuario,
  } = await supabase.auth.getUser();

  if (errorUsuario || !user) {
    redirect(`/login?redirect=/admin/cursos/${slug}/contenido`);
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

  return (
    <ContenidoCursoPanel
      slug={slug}
      usuario={user}
      perfil={perfil}
    />
  );
}