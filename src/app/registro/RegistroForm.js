"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegistroForm() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [verificandoSesion, setVerificandoSesion] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function verificarSesionActiva() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.replace("/");
        router.refresh();
        return;
      }

      setVerificandoSesion(false);
    }

    verificarSesionActiva();
  }, [router]);

  async function crearCuenta(event) {
    event.preventDefault();

    setCargando(true);
    setError("");
    setMensaje("");

    const nombreLimpio = nombre.trim();
    const emailLimpio = email.trim().toLowerCase();

    if (!nombreLimpio) {
      setError("Ingresá tu nombre.");
      setCargando(false);
      return;
    }

    if (!emailLimpio) {
      setError("Ingresá tu email.");
      setCargando(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setCargando(false);
      return;
    }

    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: emailLimpio,
      password,
      options: {
        data: {
          nombre: nombreLimpio,
          role: "alumno",
        },
      },
    });

    if (error) {
      const mensajeError = String(error.message || "").toLowerCase();

      if (
        mensajeError.includes("already registered") ||
        mensajeError.includes("already exists") ||
        mensajeError.includes("user already")
      ) {
        setError("Ya existe una cuenta registrada con ese email. Probá iniciar sesión.");
      } else {
        setError("No se pudo crear la cuenta. Revisá los datos e intentá nuevamente.");
      }

      setCargando(false);
      return;
    }

    if (!data?.session || !data?.user) {
      setError(
        "La cuenta se creó, pero no inició sesión automáticamente. Revisá que la confirmación de email esté apagada en Supabase."
      );
      setCargando(false);
      return;
    }

    setMensaje("Cuenta creada correctamente. Volviendo al inicio...");

    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 700);
  }

  if (verificandoSesion) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white">
        <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl">
            <Image
              src="/logo-servican.jpeg"
              alt="Logo SERVICAN"
              width={96}
              height={96}
              priority
              className="mx-auto mb-5 h-24 w-24 rounded-full object-contain ring-4 ring-yellow-500/30"
            />

            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
              SERVICAN
            </p>

            <h1 className="mt-3 text-3xl font-bold">Verificando acceso...</h1>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <Image
              src="/logo-servican.jpeg"
              alt="Logo SERVICAN"
              width={96}
              height={96}
              priority
              className="mx-auto mb-5 h-24 w-24 rounded-full object-contain ring-4 ring-yellow-500/30"
            />

            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
              SERVICAN
            </p>

            <h1 className="text-3xl font-bold">Crear cuenta de alumno</h1>

            <p className="mt-3 text-sm leading-6 text-neutral-300">
              Registrate para tener tu cuenta privada. Luego vas a poder entrar
              a tu panel desde la página principal.
            </p>
          </div>

          <form onSubmit={crearCuenta} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-200">
                Nombre completo
              </label>

              <input
                type="text"
                required
                autoComplete="name"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Tu nombre"
                className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-200">
                Email
              </label>

              <input
                type="email"
                required
                autoComplete="email"
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
                required
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
                {error}
              </div>
            )}

            {mensaje && (
              <div className="rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm leading-6 text-green-200">
                {mensaje}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-2xl bg-yellow-500 px-5 py-3 font-bold text-neutral-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm leading-6 text-yellow-100">
            Crear una cuenta no habilita automáticamente cursos pagos. SERVICAN
            habilita el acceso después de confirmar inscripción o pago.
          </div>

          <div className="mt-6 flex flex-col gap-3 text-center text-sm">
            <Link href="/login" className="font-semibold text-neutral-300 hover:text-yellow-400">
              Ya tengo cuenta, iniciar sesión
            </Link>

            <Link href="/cursos" className="font-semibold text-neutral-300 hover:text-yellow-400">
              Ver cursos disponibles
            </Link>

            <Link href="/" className="font-semibold text-neutral-300 hover:text-yellow-400">
              Volver al inicio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}