"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function HeaderAcceso() {
  const [cargando, setCargando] = useState(true);
  const [logueado, setLogueado] = useState(false);
  const [destinoPanel, setDestinoPanel] = useState("/panel");

  useEffect(() => {
    async function verificarSesion() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLogueado(false);
        setCargando(false);
        return;
      }

      const { data: perfil } = await supabase
        .from("perfiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (perfil?.role === "admin") {
        setDestinoPanel("/admin");
      } else {
        setDestinoPanel("/panel");
      }

      setLogueado(true);
      setCargando(false);
    }

    verificarSesion();
  }, []);

  if (cargando) {
    return <div className="h-11 w-32 animate-pulse rounded-full bg-white/10" />;
  }

  if (!logueado) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm font-bold text-yellow-200 transition hover:bg-yellow-500 hover:text-black"
        >
          Iniciar sesión
        </Link>

        <Link
          href="/registro"
          className="hidden rounded-full bg-yellow-500 px-4 py-3 text-sm font-bold text-black transition hover:bg-yellow-400 sm:inline-block"
        >
          Crear cuenta
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={destinoPanel}
        className="rounded-full bg-yellow-500 px-4 py-3 text-sm font-bold text-black transition hover:bg-yellow-400"
      >
        Entrar a mi panel
      </Link>

      <form action="/auth/logout" method="post" className="hidden sm:block">
        <button
          type="submit"
          className="rounded-full border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200 transition hover:bg-red-500 hover:text-white"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}