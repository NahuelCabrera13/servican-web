"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function BotonCerrarSesion({
  texto = "Cerrar sesión",
  className = "",
}) {
  const [cerrando, setCerrando] = useState(false);

  async function cerrarSesion() {
    if (cerrando) return;

    setCerrando(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error cerrando sesión:", error);
      window.location.href = "/";
    }
  }

  return (
    <button
      type="button"
      onClick={cerrarSesion}
      disabled={cerrando}
      className={
        className ||
        "rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {cerrando ? "Cerrando..." : texto}
    </button>
  );
}