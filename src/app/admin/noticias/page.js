import NoticiasAdminClient from "./NoticiasAdminClient";
import { verificarAdminPage } from "@/lib/admin/verificarAdminPage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Noticias | SERVICAN Admin",
  description: "Gestión privada de noticias publicadas por SERVICAN.",
};

export default async function AdminNoticiasPage() {
  await verificarAdminPage("/admin/noticias");

  return <NoticiasAdminClient />;
}