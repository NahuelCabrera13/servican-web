import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BotonImprimirCertificado from "./BotonImprimirCertificado";

export const dynamic = "force-dynamic";

function formatearFecha(fecha) {
  if (!fecha) return "—";

  return new Date(fecha).toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({ params }) {
  const { codigo } = await params;

  return {
    title: `Certificado ${codigo} | SERVICAN`,
    description: "Certificado de finalización de curso SERVICAN.",
  };
}

export default async function CertificadoPage({ params }) {
  const { codigo } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/panel/certificados/${codigo}`);
  }

  const { data: perfil, error: errorPerfil } = await supabase
    .from("perfiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (errorPerfil || !perfil) {
    redirect("/acceso-denegado");
  }

  const { data: certificado, error: errorCertificado } = await supabase
    .from("certificados")
    .select("*")
    .eq("codigo", codigo)
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

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-8 text-white print:bg-white print:px-0 print:py-0">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <Link
            href="/panel"
            className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-semibold transition hover:bg-white/20"
          >
            Volver al panel
          </Link>

          <BotonImprimirCertificado />
        </div>

        <section className="relative overflow-hidden rounded-[2rem] border border-yellow-500/40 bg-white text-neutral-950 shadow-2xl print:rounded-none print:border-0 print:shadow-none">
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
              <p className="text-lg text-neutral-600">
                Se certifica que
              </p>

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

                <p className="mt-2 text-lg font-bold uppercase">
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
          </div>
        </section>
      </section>
    </main>
  );
}