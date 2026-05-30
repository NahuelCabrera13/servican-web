import Link from "next/link";

function nombreRol(role) {
  if (role === "admin") return "Administrador";
  if (role === "instructor") return "Instructor";
  return "Alumno";
}

function claseRol(role) {
  if (role === "admin") {
    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-200";
  }

  if (role === "instructor") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-200";
  }

  return "border-green-500/30 bg-green-500/10 text-green-200";
}

export default function PanelUsuario({ usuario, perfil }) {
  const role = perfil?.role || "alumno";

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/logo-servican.jpeg"
              alt="Logo SERVICAN"
              className="h-16 w-16 rounded-full object-cover ring-4 ring-yellow-500/30"
            />

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                SERVICAN
              </p>

              <h1 className="text-3xl font-bold">
                Panel privado
              </h1>

              <p className="mt-1 text-sm text-neutral-300">
                Sesión iniciada como {perfil?.email || usuario?.email}
              </p>
            </div>
          </div>

          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="w-full rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400"
            >
              Cerrar sesión
            </button>
          </form>
        </header>

        <section className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide ${claseRol(
                role
              )}`}
            >
              {nombreRol(role)}
            </span>
          </div>

          <h2 className="text-3xl font-bold">
            Bienvenido a SERVICAN
          </h2>

          <p className="mt-3 max-w-3xl text-neutral-300">
            Este es tu espacio privado dentro de la plataforma. El contenido que
            veas acá depende de tu rol y de los cursos o permisos que tengas
            asignados.
          </p>
        </section>

        {role === "admin" && (
          <section className="grid gap-5 md:grid-cols-3">
            <Link
              href="/admin"
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl transition hover:-translate-y-1 hover:bg-white/10"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                Administración
              </p>

              <h3 className="mt-3 text-2xl font-bold">
                Panel admin
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Gestionar inscripciones, cursos y contenido administrativo de la
                plataforma.
              </p>
            </Link>

            <Link
              href="/admin/usuarios"
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl transition hover:-translate-y-1 hover:bg-white/10"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                Roles
              </p>

              <h3 className="mt-3 text-2xl font-bold">
                Usuarios
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Ver usuarios registrados y cambiar roles entre administrador,
                instructor y alumno.
              </p>
            </Link>

            <Link
              href="/cursos"
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl transition hover:-translate-y-1 hover:bg-white/10"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                Web pública
              </p>

              <h3 className="mt-3 text-2xl font-bold">
                Ver cursos
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Revisar cómo se ven los cursos y la información pública de la
                plataforma.
              </p>
            </Link>
          </section>
        )}

        {role === "instructor" && (
          <section className="grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
                Instructor
              </p>

              <h3 className="mt-3 text-2xl font-bold">
                Panel de instructor
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Acá más adelante vas a poder ver alumnos, cursos asignados,
                materiales y seguimiento de avance.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
                Próximamente
              </p>

              <h3 className="mt-3 text-2xl font-bold">
                Gestión de clases
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Esta sección se va a conectar con módulos, clases, videos y
                alumnos asignados.
              </p>
            </div>
          </section>
        )}

        {role === "alumno" && (
          <section className="grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
                Alumno
              </p>

              <h3 className="mt-3 text-2xl font-bold">
                Mis cursos
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Acá más adelante vas a ver los cursos comprados, videos,
                materiales PDF y progreso de aprendizaje.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
                Acceso privado
              </p>

              <h3 className="mt-3 text-2xl font-bold">
                Contenido bloqueado por pago
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Cuando el administrador marque una inscripción como pagada, el
                alumno podrá acceder al contenido del curso correspondiente.
              </p>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}