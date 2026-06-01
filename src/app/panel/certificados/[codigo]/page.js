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

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) return "—";

  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const anio = date.getFullYear();

  return `${dia}/${mes}/${anio}`;
}

function codigoValido(codigo) {
  if (!codigo) return false;

  const codigoLimpio = String(codigo).trim();

  if (codigoLimpio.length < 6) return false;
  if (codigoLimpio.length > 120) return false;

  return /^[a-zA-Z0-9._-]+$/.test(codigoLimpio);
}

function BadgeEstado({ estado }) {
  const anulado = estado === "anulado";

  return (
    <span
      className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.2em] ${
        anulado
          ? "border-red-500/30 bg-red-500/10 text-red-200"
          : "border-green-500/30 bg-green-500/10 text-green-200"
      }`}
    >
      {anulado ? "Anulado" : "Emitido"}
    </span>
  );
}

export default async function CertificadoPage({ params }) {
  const { codigo } = await params;
  const codigoLimpio = String(codigo || "").trim();

  if (!codigoValido(codigoLimpio)) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: errorUsuario,
  } = await supabase.auth.getUser();

  if (errorUsuario || !user) {
    redirect(`/login?redirect=/panel/certificados/${codigoLimpio}`);
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
    .select(
      `
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
    `
    )
    .eq("codigo", codigoLimpio)
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
  const nombreAlumno = certificado.nombre_alumno || "Alumno SERVICAN";
  const tituloCurso = certificado.titulo_curso || "Curso SERVICAN";
  const fechaEmision = formatearFecha(
    certificado.emitido_at || certificado.created_at
  );

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white print:bg-white print:px-0 print:py-0">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-zinc-950 p-5 shadow-2xl sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
              Certificado privado
            </p>

            <h1 className="mt-2 text-2xl font-black">{tituloCurso}</h1>

            <p className="mt-1 text-sm text-zinc-400">
              Alumno: <span className="font-bold">{nombreAlumno}</span>
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              Código: <span className="font-bold">{certificado.codigo}</span>
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/panel"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/20"
            >
              Volver al panel
            </Link>

            <Link
              href="/verificar-certificado"
              className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-3 text-center text-sm font-bold text-yellow-200 transition hover:bg-yellow-500/20"
            >
              Verificar código
            </Link>

            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/20"
            >
              Inicio
            </Link>

            {!certificadoAnulado && (
              <BotonImprimirCertificado
                nombreAlumno={nombreAlumno}
                tituloCurso={tituloCurso}
                codigo={certificado.codigo}
              />
            )}
          </div>
        </div>

        {certificadoAnulado && (
          <div className="mb-6 rounded-[2rem] border border-red-500/30 bg-red-500/10 p-5 text-red-100 print:hidden">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-red-300">
              Certificado anulado
            </p>

            <p className="mt-2 text-sm leading-6">
              Este certificado figura como anulado en el sistema. No debe usarse
              como constancia válida de finalización.
            </p>
          </div>
        )}

        <section className="relative overflow-hidden rounded-[2.5rem] border border-yellow-500/40 bg-white text-neutral-950 shadow-2xl print:rounded-none print:border-0 print:shadow-none">
          {certificadoAnulado && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70">
              <p className="-rotate-12 border-8 border-red-600 px-10 py-5 text-5xl font-black uppercase tracking-[0.25em] text-red-600 opacity-80 md:text-7xl">
                Anulado
              </p>
            </div>
          )}

          <div className="absolute left-0 top-0 h-48 w-48 rounded-br-full bg-yellow-400/20" />
          <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-neutral-950/5" />
          <div className="absolute bottom-0 right-0 h-60 w-60 rounded-tl-full bg-yellow-400/20" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-tr-full bg-neutral-950/5" />

          <div className="relative p-7 md:p-14 print:p-12">
            <header className="flex flex-col items-center border-b-4 border-yellow-500 pb-8 text-center">
              <img
                src="/logo-servican.jpeg"
                alt="Logo SERVICAN"
                className="h-28 w-28 rounded-full object-contain ring-4 ring-yellow-500/30"
              />

              <p className="mt-6 text-sm font-black uppercase tracking-[0.5em] text-yellow-700">
                SERVICAN
              </p>

              <h2 className="mt-4 text-4xl font-black uppercase tracking-wide md:text-6xl">
                Certificado
              </h2>

              <p className="mt-3 text-lg font-semibold text-neutral-600">
                de finalización de curso
              </p>
            </header>

            <section className="py-12 text-center">
              <p className="text-lg text-neutral-600">Se certifica que</p>

              <h3 className="mx-auto mt-5 max-w-5xl text-4xl font-black leading-tight md:text-6xl">
                {nombreAlumno}
              </h3>

              <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-neutral-700">
                ha completado satisfactoriamente el curso
              </p>

              <h4 className="mx-auto mt-5 max-w-5xl text-3xl font-black leading-tight text-yellow-700 md:text-5xl">
                {tituloCurso}
              </h4>

              <p className="mx-auto mt-8 max-w-4xl text-base leading-8 text-neutral-700 md:text-lg">
                Este certificado es emitido por SERVICAN como constancia de que
                el alumno completó el contenido correspondiente al curso dentro
                de la plataforma privada de formación.
              </p>
            </section>

            <section className="grid gap-5 border-t-4 border-yellow-500 pt-8 md:grid-cols-3">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-center">
                <p className="text-xs font-black uppercase tracking-wide text-neutral-500">
                  Fecha de emisión
                </p>

                <p className="mt-2 text-lg font-black">{fechaEmision}</p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-center">
                <p className="text-xs font-black uppercase tracking-wide text-neutral-500">
                  Código
                </p>

                <p className="mt-2 break-words text-lg font-black">
                  {certificado.codigo}
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-center">
                <p className="text-xs font-black uppercase tracking-wide text-neutral-500">
                  Estado
                </p>

                <p
                  className={`mt-2 text-lg font-black uppercase ${
                    certificadoAnulado ? "text-red-600" : "text-green-700"
                  }`}
                >
                  {certificadoAnulado ? "Anulado" : "Emitido"}
                </p>
              </div>
            </section>

            <section className="mt-10 grid gap-5 rounded-[2rem] border border-neutral-200 bg-neutral-50 p-6 md:grid-cols-2">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-neutral-500">
                  Alumno
                </p>

                <p className="mt-2 text-xl font-black">{nombreAlumno}</p>

                <p className="mt-1 text-sm text-neutral-500">
                  {certificado.email_alumno || "Email no disponible"}
                </p>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wide text-neutral-500">
                  Validez
                </p>

                <p className="mt-2 text-xl font-black">
                  Verificable públicamente
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  El código permite comprobar si el certificado está emitido y
                  vigente.
                </p>
              </div>
            </section>

            <footer className="mt-14 grid gap-10 md:grid-cols-2">
              <div className="text-center">
                <div className="mx-auto h-px w-64 bg-neutral-400" />
                <p className="mt-3 text-sm font-black uppercase tracking-wide">
                  Dirección / Instructor SERVICAN
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto h-px w-64 bg-neutral-400" />
                <p className="mt-3 text-sm font-black uppercase tracking-wide">
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

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-zinc-950 p-6 print:hidden">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <BadgeEstado estado={certificado.estado} />

                <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-yellow-200">
                  Privado
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-black">
                Información del certificado
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                Este documento completo solo puede verlo el alumno dueño del
                certificado, un administrador o un instructor autorizado.
              </p>
            </div>

            <Link
              href="/verificar-certificado"
              className="rounded-2xl bg-yellow-500 px-6 py-3 text-center text-sm font-black text-black transition hover:bg-yellow-400"
            >
              Ir a verificación pública
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}