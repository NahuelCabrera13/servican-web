import Link from "next/link";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function crearSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Faltan variables de entorno de Supabase Admin.");
  }

  return createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function obtenerUsuarioActual() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

async function verificarAdmin(supabaseAdmin, userId) {
  const { data: perfil, error } = await supabaseAdmin
    .from("perfiles")
    .select("user_id, email, nombre, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo verificar el perfil: ${error.message}`);
  }

  return perfil?.role === "admin";
}

async function obtenerMembresias(supabaseAdmin) {
  const { data: membresias, error } = await supabaseAdmin
    .from("membresias_accesos")
    .select(
      `
      id,
      user_id,
      estado,
      fecha_inicio,
      fecha_fin,
      descuento_porcentaje,
      curso_pequeno_disponible,
      curso_pequeno_usado,
      mercadopago_preapproval_id,
      mercadopago_status,
      ultimo_pago_id,
      ultimo_pago_estado,
      proximo_cobro_at,
      cancelada_at,
      created_at,
      updated_at
    `
    )
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`No se pudieron cargar membresías: ${error.message}`);
  }

  const userIds = [...new Set((membresias || []).map((m) => m.user_id))];

  if (userIds.length === 0) {
    return [];
  }

  const { data: perfiles, error: perfilesError } = await supabaseAdmin
    .from("perfiles")
    .select("user_id, email, nombre, role")
    .in("user_id", userIds);

  if (perfilesError) {
    throw new Error(`No se pudieron cargar perfiles: ${perfilesError.message}`);
  }

  const perfilesPorUserId = {};

  for (const perfil of perfiles || []) {
    perfilesPorUserId[perfil.user_id] = perfil;
  }

  return (membresias || []).map((membresia) => ({
    ...membresia,
    perfil: perfilesPorUserId[membresia.user_id] || null,
  }));
}

function formatearFecha(fecha) {
  if (!fecha) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat("es-UY", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(fecha));
  } catch {
    return fecha;
  }
}

function claseEstado(estado) {
  if (estado === "activa") {
    return "border-green-500/30 bg-green-500/10 text-green-200";
  }

  if (estado === "cancelada") {
    return "border-red-500/30 bg-red-500/10 text-red-200";
  }

  if (estado === "vencida") {
    return "border-orange-500/30 bg-orange-500/10 text-orange-200";
  }

  return "border-yellow-500/30 bg-yellow-500/10 text-yellow-200";
}

export default async function AdminMembresiaPage() {
  const usuario = await obtenerUsuarioActual();

  if (!usuario) {
    redirect("/login?redirect=/admin/membresia");
  }

  const supabaseAdmin = crearSupabaseAdmin();
  const esAdmin = await verificarAdmin(supabaseAdmin, usuario.id);

  if (!esAdmin) {
    redirect("/acceso-denegado");
  }

  const membresias = await obtenerMembresias(supabaseAdmin);

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
              Admin SERVICAN
            </p>

            <h1 className="mt-3 text-4xl font-black">
              Membresías
            </h1>

            <p className="mt-3 max-w-2xl text-zinc-400">
              Control de membresías mensuales, estados de Mercado Pago y acceso
              de usuarios.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/20"
          >
            Volver al admin
          </Link>
        </div>

        <div className="mb-6 rounded-[2rem] border border-white/10 bg-zinc-950 p-5">
          <p className="text-sm text-zinc-400">
            Total de registros:
          </p>

          <p className="mt-1 text-3xl font-black text-white">
            {membresias.length}
          </p>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-zinc-400">
                <tr>
                  <th className="px-5 py-4">Usuario</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4">Mercado Pago</th>
                  <th className="px-5 py-4">Descuento</th>
                  <th className="px-5 py-4">Curso pequeño</th>
                  <th className="px-5 py-4">Próximo cobro</th>
                  <th className="px-5 py-4">Actualizado</th>
                  <th className="px-5 py-4">Preapproval</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {membresias.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-8 text-center text-zinc-400"
                    >
                      Todavía no hay membresías registradas.
                    </td>
                  </tr>
                ) : (
                  membresias.map((membresia) => (
                    <tr key={membresia.id} className="align-top">
                      <td className="px-5 py-4">
                        <p className="font-bold text-white">
                          {membresia.perfil?.nombre || "Sin nombre"}
                        </p>
                        <p className="mt-1 text-xs text-zinc-400">
                          {membresia.perfil?.email || membresia.user_id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase ${claseEstado(
                            membresia.estado
                          )}`}
                        >
                          {membresia.estado || "sin estado"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-bold text-white">
                          {membresia.mercadopago_status || "Sin confirmar"}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          Último pago:{" "}
                          {membresia.ultimo_pago_estado || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        {membresia.descuento_porcentaje || 0}%
                      </td>

                      <td className="px-5 py-4">
                        {membresia.curso_pequeno_usado
                          ? "Usado"
                          : membresia.curso_pequeno_disponible
                            ? "Disponible"
                            : "No disponible"}
                      </td>

                      <td className="px-5 py-4">
                        {formatearFecha(membresia.proximo_cobro_at)}
                      </td>

                      <td className="px-5 py-4">
                        {formatearFecha(membresia.updated_at)}
                      </td>

                      <td className="max-w-[240px] px-5 py-4">
                        <code className="break-all rounded-xl bg-black px-2 py-1 text-xs text-zinc-300">
                          {membresia.mercadopago_preapproval_id || "—"}
                        </code>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}