import AdminPanel from "./AdminPanel";
import { verificarAdminPage } from "@/lib/admin/verificarAdminPage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Panel admin | SERVICAN",
  description: "Panel de administración privado de SERVICAN.",
};

export default async function AdminPage() {
  const { user, perfil } = await verificarAdminPage("/admin");

  return <AdminPanel usuario={user} perfil={perfil} />;
}