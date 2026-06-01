import CertificadosPanel from "./CertificadosPanel";
import { verificarAdminPage } from "@/lib/admin/verificarAdminPage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Certificados | SERVICAN Admin",
  description: "Gestión privada de certificados emitidos por SERVICAN.",
};

export default async function AdminCertificadosPage() {
  const { user, perfil } = await verificarAdminPage("/admin/certificados");

  return <CertificadosPanel usuario={user} perfil={perfil} />;
}