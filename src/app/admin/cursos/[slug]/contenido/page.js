import { redirect } from "next/navigation";
import ContenidoCursoPanel from "./ContenidoCursoPanel";
import { verificarAdminPage } from "@/lib/admin/verificarAdminPage";

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

  const { user, perfil } = await verificarAdminPage(
    `/admin/cursos/${slug}/contenido`
  );

  return <ContenidoCursoPanel slug={slug} usuario={user} perfil={perfil} />;
}