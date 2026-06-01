import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import PagosAdminPanel from "./PagosAdminPanel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pagos | Admin SERVICAN",
  description: "Panel administrativo de pagos de SERVICAN.",
};

function ordenarPagos(pagos) {
  return [...(pagos || [])].sort((a, b) => {
    const fechaA = new Date(a.created_at || 0).getTime();
    const fechaB = new Date(b.created_at || 0).getTime();

    return fechaB - fechaA;
  });
}

export default async function AdminPagosPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: errorUsuario,
  } = await supabase.auth.getUser();

  if (errorUsuario || !user) {
    redirect("/login?redirect=/admin/pagos");
  }

  const supabaseAdmin = createAdminClient();

  const { data: perfil, error: errorPerfil } = await supabaseAdmin
    .from("perfiles")
    .select("id, user_id, email, nombre, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (errorPerfil || !perfil || perfil.role !== "admin") {
    redirect("/acceso-denegado");
  }

  const { data: pagos, error: errorPagos } = await supabaseAdmin
    .from("pagos")
    .select(
      `
      id,
      user_id,
      comprador_user_id,
      producto_id,
      curso_id,
      email,
      mercadopago_payment_id,
      mercadopago_preference_id,
      estado,
      monto,
      moneda,
      tipo_producto,
      participantes,
      detalle,
      created_at,
      updated_at,
      productos (
        id,
        nombre,
        slug,
        plan,
        tipo_producto,
        precio,
        moneda,
        cantidad_maxima_usuarios,
        requiere_participantes
      ),
      cursos (
        id,
        titulo,
        slug
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(300);

  const { data: accesos, error: errorAccesos } = await supabaseAdmin
    .from("alumno_cursos")
    .select(
      `
      id,
      user_id,
      curso_id,
      estado,
      origen,
      pago_id,
      producto_id,
      comprador_user_id,
      nivel_acceso,
      acceso_grupal,
      fecha_inicio,
      fecha_fin,
      created_at
    `
    )
    .not("pago_id", "is", null)
    .limit(1000);

  return (
    <PagosAdminPanel
      pagosIniciales={ordenarPagos(pagos || [])}
      accesosIniciales={accesos || []}
      errorInicial={errorPagos?.message || errorAccesos?.message || ""}
    />
  );
}