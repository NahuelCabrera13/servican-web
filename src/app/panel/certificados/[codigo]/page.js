import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BotonImprimirCertificado from "./BotonImprimirCertificado";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Certificado privado | SERVICAN",
  description: "Certificado privado de finalización de curso SERVICAN.",
};

function formatearFecha(fecha) {
  if (!fecha) return "—";

  return new Date(fecha).toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function codigoValido(codigo) {
  if (!codigo) return false;

  const codigoLimpio = String(codigo).trim();

  if (codigoLimpio.length < 6) return false;
  if (codigoLimpio.length > 120) return false;

  return /^[a-zA-Z0-9._-]+$/.test(codigoLimpio);
}

export default async function CertificadoPage({ params }) {
  const { codigo } = await params;

  if (!codigoValido(codigo)) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: errorUsuario,
  } = await supabase.auth.getUser();

  if (errorUsuario || !user) {
    redirect(`/login?redirect=/panel/certificados/${codigo}`);
  }

  const { data: perfil, error: errorPerfil } = await supabase
    .from("perfiles")
    .select("id, user_id, email, nombre, role, created_at")
    .eq("user_id", user.id)
    .single();

  if (errorPerfil || !perfil) {
    redirect("/acceso-denegado");
  }

  const { data: certificado, error: errorCertificado } = await supabase
    .from("certificados")
    .select(`
      id,
      user_id,
      curso_id,
      codigo,
      nombre_alumno,
      email_alumno,
      titulo_curso,
      estado,
      emitido_at,
      created_at
    `)
    .eq("codigo", String(codigo).trim())
    .single();

  if (errorCertificado || !certificado) {
    notFound();
  }

  const esAdmin = perfil.role === "admin";
  const esInstructor = perfil.role === "instructor";
  const esPropietario = certificado.user_id === user.id;

  if (!esAdmin && !esInstructor && !esPropietario) {
    redirect("/acceso-denegado");
  }

  const certificadoAnulado = certificado.estado === "anulado";

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-8 text-white print:bg-white print:px-0 print:py-0">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-semibold transition hover:bg-white/20"
            >
              Volver al inicio
            </Link>

            <Link
              href="/panel"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-semibold transition hover:bg-white/20"
            >
              Volver al panel
            </Link>

            <Link
              href="/verificar-certificado"
              className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-3 text-center text-sm font-bold text-yellow-200 transition hover:bg-yellow-500/20"
            >
              Verificar código
            </Link>
          </div>

          {!certificadoAnulado && <BotonImprimirCertificado />}
        </div>

        {certificadoAnulado && (
          <div className="mb-6 rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-red-100 print:hidden">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-red-300">
              Certificado anulado
            </p>

            <p className="mt-2 text-sm leading-6">
              Este certificado figura como anulado en el sistema. No debe usarse
              como constancia válida de finalización.
            </p>
          </div>
        )}

        <section className="relative overflow-hidden rounded-[2rem] border border-yellow-500/40 bg-white text-neutral-950 shadow-2xl print:rounded-none print:border-0 print:shadow-none">
          {certificadoAnulado && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70">
              <p className="-rotate-12 border-8 border-red-600 px-10 py-5 text-5xl font-black uppercase tracking-[0.25em] text-red-600 opacity-80 md:text-7xl">
                Anulado
              </p>
            </div>
          )}

          <div className="absolute left-0 top-0 h-40 w-40 rounded-br-full bg-yellow-400/20" />
          <div className="absolute bottom-0 right-0 h-52 w-52 rounded-tl-full bg-yellow-400/20" />

          <div className="relative p-8 md:p-14">
            <header className="flex flex-col items-center border-b-4 border-yellow-500 pb-8 text-center">
              <img
                src="/logo-servican.jpeg"
                alt="Logo SERVICAN"
                className="h-28 w-28 rounded-full object-contain ring-4 ring-yellow-500/30"
              />

              <p className="mt-6 text-sm font-black uppercase tracking-[0.5em] text-yellow-700">
                SERVICAN
              </p>

              <h1 className="mt-4 text-4xl font-black uppercase tracking-wide md:text-6xl">
                Certificado
              </h1>

              <p className="mt-3 text-lg font-semibold text-neutral-600">
                de finalización de curso
              </p>
            </header>

            <section className="py-12 text-center">
              <p className="text-lg text-neutral-600">Se certifica que</p>

              <h2 className="mt-5 text-4xl font-black md:text-6xl">
                {certificado.nombre_alumno || "Alumno SERVICAN"}
              </h2>

              <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-neutral-700">
                ha completado satisfactoriamente el curso
              </p>

              <h3 className="mx-auto mt-5 max-w-4xl text-3xl font-black text-yellow-700 md:text-5xl">
                {certificado.titulo_curso}
              </h3>

              <p className="mx-auto mt-8 max-w-4xl text-base leading-8 text-neutral-700 md:text-lg">
                Este certificado es emitido por SERVICAN como constancia de que
                el alumno completó el contenido correspondiente al curso dentro
                de la plataforma privada de formación.
              </p>
            </section>

            <section className="grid gap-6 border-t-4 border-yellow-500 pt-8 md:grid-cols-3">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-center">
                <p className="text-xs font-black uppercase tracking-wide text-neutral-500">
                  Fecha de emisión
                </p>

                <p className="mt-2 text-lg font-bold">
                  {formatearFecha(certificado.emitido_at)}
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-center">
                <p className="text-xs font-black uppercase tracking-wide text-neutral-500">
                  Código
                </p>

                <p className="mt-2 break-words text-lg font-bold">
                  {certificado.codigo}
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-center">
                <p className="text-xs font-black uppercase tracking-wide text-neutral-500">
                  Estado
                </p>

                <p
                  className={`mt-2 text-lg font-bold uppercase ${
                    certificadoAnulado ? "text-red-600" : "text-green-700"
                  }`}
                >
                  {certificado.estado}
                </p>
              </div>
            </section>

            <footer className="mt-12 grid gap-8 md:grid-cols-2">
              <div className="text-center">
                <div className="mx-auto h-px w-64 bg-neutral-400" />
                <p className="mt-3 text-sm font-bold uppercase tracking-wide">
                  Dirección / Instructor SERVICAN
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto h-px w-64 bg-neutral-400" />
                <p className="mt-3 text-sm font-bold uppercase tracking-wide">
                  SERVICAN Uruguay
                </p>
              </div>
            </footer>

            <p className="mt-10 text-center text-xs leading-6 text-neutral-500">
              Certificado emitido digitalmente. Código de verificación:{" "}
              <strong>{certificado.codigo}</strong>
            </p>

            <p className="mt-3 text-center text-xs leading-6 text-neutral-400 print:hidden">
              La versión pública de verificación solo confirma la validez del
              código. No muestra ni permite descargar este certificado completo.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}