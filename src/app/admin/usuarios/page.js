import UsuariosPanel from "./UsuariosPanel";
import { verificarAdminPage } from "@/lib/admin/verificarAdminPage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Usuarios | SERVICAN Admin",
  description: "Gestión privada de usuarios, roles y accesos a cursos.",
};

export default async function AdminUsuariosPage() {
  const { user, perfil } = await verificarAdminPage("/admin/usuarios");

  return <UsuariosPanel usuarioActual={user} perfilActual={perfil} />;
}