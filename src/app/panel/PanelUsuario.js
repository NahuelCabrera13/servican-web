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

function claseEstado(estado) {
  if (estado === "activo") {
    return "border-green-500/30 bg-green-500/10 text-green-300";
  }

  if (estado === "pendiente") {
    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
  }

  if (estado === "pausado") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }

  if (estado === "finalizado") {
    return "border-zinc-500/30 bg-zinc-500/10 text-zinc-300";
  }

  return "border-red-500/30 bg-red-500/10 text-red-300";
}

function textoEstado(estado) {
  if (estado === "activo") return "Activo";
  if (estado === "pendiente") return "Pendiente";
  if (estado === "pausado") return "Pausado";
  if (estado === "finalizado") return "Finalizado";
  if (estado === "cancelado") return "Cancelado";
  return estado || "Sin estado";
}

export default function PanelUsuario({
  usuario,
  perfil,
  cursosHabilitados = [],
  errorCursos = null,
}) {
  const role = perfil?.role || "alumno";

  const cursosActivos = cursosHabilitados.filter(
    (item) => item.estado === "activo" && item.curso
  );

  const cursosNoActivos = cursosHabilitados.filter(
    (item) => item.estado !== "activo" && item.curso
  );

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

              <h1 className="text-3xl font-bold">Panel privado</h1>

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

          <h2 className="text-3xl font-bold">Bienvenido a SERVICAN</h2>

          <p className="mt-3 max-w-3xl text-neutral-300">
            Este es tu espacio privado dentro de la plataforma. El contenido que
            veas acá depende de tu rol y de los cursos o permisos que tengas
            asignados.
          </p>
        </section>

        {role === "admin" && (
          <section className="mb-8 grid gap-5 md:grid-cols-3">
            <Link
              href="/admin"
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl transition hover:-translate-y-1 hover:bg-white/10"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                Administración
              </p>

              <h3 className="mt-3 text-2xl font-bold">Panel admin</h3>

              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Gestionar consultas, cursos y contenido administrativo de la
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

              <h3 className="mt-3 text-2xl font-bold">Usuarios</h3>

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

              <h3 className="mt-3 text-2xl font-bold">Ver cursos</h3>

              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Revisar cómo se ven los cursos y la información pública de la
                plataforma.
              </p>
            </Link>
          </section>
        )}

        {role === "instructor" && (
          <section className="mb-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
                Instructor
              </p>

              <h3 className="mt-3 text-2xl font-bold">Panel de instructor</h3>

              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Acá más adelante vas a poder ver alumnos, cursos asignados,
                materiales y seguimiento de avance.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
                Próximamente
              </p>

              <h3 className="mt-3 text-2xl font-bold">Gestión de clases</h3>

              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Esta sección se va a conectar con módulos, clases, videos y
                alumnos asignados.
              </p>
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
                Academia
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Mis cursos habilitados
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-300">
                Acá aparecen los cursos que el administrador habilitó para esta
                cuenta. Solo los cursos activos permiten entrar al contenido
                privado.
              </p>
            </div>

            <Link
              href="/cursos"
              className="rounded-2xl border border-yellow-500/40 bg-yellow-500/10 px-5 py-3 text-center text-sm font-bold text-yellow-200 transition hover:bg-yellow-500/20"
            >
              Ver cursos públicos
            </Link>
          </div>

          {errorCursos && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              No se pudieron cargar tus cursos: {errorCursos}
            </div>
          )}

          {!errorCursos && cursosHabilitados.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-neutral-950 p-8 text-center">
              <h3 className="text-2xl font-bold">
                Todavía no tenés cursos habilitados
              </h3>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
                Cuando el administrador confirme tu inscripción o pago, el curso
                aparecerá en esta sección.
              </p>

              <Link
                href="/cursos"
                className="mt-6 inline-block rounded-2xl bg-yellow-500 px-6 py-3 font-bold text-neutral-950 transition hover:bg-yellow-400"
              >
                Consultar cursos disponibles
              </Link>
            </div>
          )}

          {!errorCursos && cursosActivos.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {cursosActivos.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-3xl border border-green-500/20 bg-neutral-950 shadow-xl"
                >
                  <div className="aspect-[16/10] bg-neutral-900">
                    {item.curso?.imagen_url ? (
                      <img
                        src={item.curso.imagen_url}
                        alt={item.curso.titulo}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <img
                          src="/logo-servican.jpeg"
                          alt="Logo SERVICAN"
                          className="h-24 w-24 rounded-full object-contain opacity-80"
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${claseEstado(
                          item.estado
                        )}`}
                      >
                        {textoEstado(item.estado)}
                      </span>

                      {item.curso?.categoria && (
                        <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-yellow-300">
                          {item.curso.categoria}
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold">
                      {item.curso?.titulo}
                    </h3>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-300">
                      {item.curso?.descripcion ||
                        "Curso SERVICAN habilitado para tu cuenta."}
                    </p>

                    <Link
                      href={`/panel/cursos/${item.curso?.slug}`}
                      className="mt-6 block rounded-2xl bg-green-500 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-green-400"
                    >
                      Entrar al curso
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!errorCursos && cursosNoActivos.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 text-xl font-bold">
                Cursos pendientes o pausados
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                {cursosNoActivos.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-3xl border border-white/10 bg-neutral-950 p-5"
                  >
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${claseEstado(
                          item.estado
                        )}`}
                      >
                        {textoEstado(item.estado)}
                      </span>
                    </div>

                    <h4 className="text-xl font-bold">
                      {item.curso?.titulo}
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-neutral-400">
                      Este curso está asociado a tu cuenta, pero todavía no se
                      encuentra activo para acceder al contenido.
                    </p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}