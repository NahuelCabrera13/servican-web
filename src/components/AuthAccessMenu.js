"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthAccessMenu() {
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    cargarSesion();
  }, []);

  async function cargarSesion() {
    setCargando(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUsuario(user || null);

    if (user) {
      const { data } = await supabase
        .from("perfiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setPerfil(data || null);
    } else {
      setPerfil(null);
    }

    setCargando(false);
  }

  function nombreRol(role) {
    if (role === "admin") return "Administrador";
    if (role === "instructor") return "Instructor";
    return "Alumno";
  }

  const role = perfil?.role || "visitante";
  const esAdmin = role === "admin";

  return (
    <div className="fixed bottom-5 left-5 z-50">
      {abierto && (
        <div className="mb-3 w-72 rounded-3xl border border-white/10 bg-neutral-950/95 p-4 text-white shadow-2xl backdrop-blur">
          <div className="mb-4 border-b border-white/10 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-400">
              SERVICAN
            </p>

            <h2 className="mt-1 text-lg font-bold">
              Acceso privado
            </h2>

            {cargando ? (
              <p className="mt-2 text-sm text-neutral-400">
                Cargando sesión...
              </p>
            ) : usuario ? (
              <div className="mt-2">
                <p className="break-words text-sm text-neutral-300">
                  {perfil?.email || usuario.email}
                </p>

                <span className="mt-2 inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-200">
                  {nombreRol(role)}
                </span>
              </div>
            ) : (
              <p className="mt-2 text-sm text-neutral-400">
                No hay sesión iniciada.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            {!usuario && (
              <Link
                href="/login"
                onClick={() => setAbierto(false)}
                className="rounded-2xl bg-yellow-500 px-4 py-3 text-center text-sm font-bold text-neutral-950 transition hover:bg-yellow-400"
              >
                Iniciar sesión
              </Link>
            )}

            {usuario && (
              <Link
                href="/panel"
                onClick={() => setAbierto(false)}
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-white/20"
              >
                Panel privado
              </Link>
            )}

            {esAdmin && (
              <>
                <Link
                  href="/admin"
                  onClick={() => setAbierto(false)}
                  className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-center text-sm font-bold text-yellow-100 transition hover:bg-yellow-500/20"
                >
                  Panel admin
                </Link>

                <Link
                  href="/admin/usuarios"
                  onClick={() => setAbierto(false)}
                  className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-center text-sm font-bold text-yellow-100 transition hover:bg-yellow-500/20"
                >
                  Usuarios y roles
                </Link>
              </>
            )}

            {usuario && (
              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-400"
                >
                  Cerrar sesión
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAbierto((actual) => !actual)}
        className="rounded-full bg-yellow-500 px-6 py-4 text-sm font-black uppercase tracking-wide text-neutral-950 shadow-2xl transition hover:scale-105 hover:bg-yellow-400"
      >
        {abierto ? "Cerrar" : "Acceso"}
      </button>
    </div>
  );
}