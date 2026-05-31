import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ContenidoCursoPanel from "./ContenidoCursoPanel";

export default async function AdminContenidoCursoPage({ params }) {
  const { slug } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/admin/cursos/${slug}/contenido`);
  }

  const { data: perfil, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !perfil || perfil.role !== "admin") {
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