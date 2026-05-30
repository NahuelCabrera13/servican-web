"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function iniciarSesion(event) {
    event.preventDefault();

    setCargando(true);
    setError("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email o contraseña incorrectos.");
      setCargando(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <img
              src="/logo-servican.jpeg"
              alt="Logo SERVICAN"
              className="mx-auto mb-5 h-24 w-24 rounded-full object-cover ring-4 ring-yellow-500/30"
            />

            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
              SERVICAN
            </p>

            <h1 className="text-3xl font-bold">
              Iniciar sesión
            </h1>

            <p className="mt-3 text-sm text-neutral-300">
              Acceso privado para administradores, instructores y alumnos.
            </p>
          </div>

          <form onSubmit={iniciarSesion} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-200">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu@email.com"
                className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-200">
                Contraseña
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Tu contraseña"
                className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-2xl bg-yellow-500 px-5 py-3 font-bold text-neutral-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando ? "Ingresando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-neutral-500">
            Si sos alumno o instructor, el administrador debe habilitar tu acceso.
          </p>
        </div>
      </section>
    </main>
  );
}