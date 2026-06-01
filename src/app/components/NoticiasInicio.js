import Link from "next/link";
import { obtenerNoticiasPublicadas } from "@/lib/noticiasPublicas";

function formatearFecha(fecha) {
  if (!fecha) return "";

  try {
    return new Date(fecha).toLocaleDateString("es-UY", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function recortarTexto(texto, maximo = 170) {
  const limpio = String(texto || "").trim();

  if (limpio.length <= maximo) {
    return limpio;
  }

  return `${limpio.slice(0, maximo).trim()}...`;
}

function ImagenNoticiaProfesional({ noticia, grande = false }) {
  return (
    <div
      className={`relative overflow-hidden bg-zinc-950 ${
        grande ? "min-h-[360px]" : "min-h-[260px]"
      }`}
    >
      {noticia.imagen_url ? (
        <>
          <img
            src={noticia.imagen_url}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-xl"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/20" />

          <div
            className={`relative flex items-center justify-center p-4 ${
              grande ? "min-h-[360px]" : "min-h-[260px]"
            }`}
          >
            <img
              src={noticia.imagen_url}
              alt={noticia.titulo}
              className={`w-full rounded-2xl object-contain shadow-2xl ${
                grande ? "max-h-[420px]" : "max-h-[300px]"
              }`}
            />
          </div>
        </>
      ) : (
        <div
          className={`flex w-full items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-zinc-950 ${
            grande ? "min-h-[360px]" : "min-h-[260px]"
          }`}
        >
          <div className="text-center">
            <img
              src="/logo-servican.jpeg"
              alt="Logo SERVICAN"
              className="mx-auto h-20 w-20 rounded-full object-contain opacity-80"
            />
            <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-yellow-500">
              SERVICAN
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default async function NoticiasInicio() {
  const noticias = await obtenerNoticiasPublicadas({ limite: 3 });

  if (!noticias.length) {
    return null;
  }

  const [noticiaPrincipal, ...noticiasSecundarias] = noticias;

  return (
    <section
      id="noticias"
      className="border-y border-yellow-500/20 bg-zinc-950 px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[1450px]">
        <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Noticias
            </p>

            <h2 className="text-4xl font-black md:text-6xl">
              Novedades SERVICAN
            </h2>

            <p className="mt-5 max-w-3xl leading-8 text-zinc-300">
              Comunicados, actividades, cursos, jornadas de trabajo y novedades
              publicadas por el equipo SERVICAN.
            </p>
          </div>

          <Link
            href="/noticias"
            className="rounded-full border border-yellow-500 px-6 py-4 text-center font-black text-yellow-500 transition hover:bg-yellow-500 hover:text-black"
          >
            Ver todas las noticias
          </Link>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="group overflow-hidden rounded-[2.5rem] border border-yellow-500/30 bg-black shadow-2xl transition hover:-translate-y-1 hover:border-yellow-500/60">
            <div className="relative">
              <ImagenNoticiaProfesional noticia={noticiaPrincipal} grande />

              {noticiaPrincipal.destacada && (
                <div className="absolute left-5 top-5 rounded-full bg-yellow-500 px-5 py-2 text-xs font-black uppercase tracking-wide text-black">
                  Noticia destacada
                </div>
              )}
            </div>

            <div className="p-8">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-yellow-300">
                  {noticiaPrincipal.categoria || "General"}
                </span>

                {noticiaPrincipal.fecha_publicacion && (
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-zinc-300">
                    {formatearFecha(noticiaPrincipal.fecha_publicacion)}
                  </span>
                )}
              </div>

              <h3 className="text-3xl font-black leading-tight text-white md:text-4xl">
                {noticiaPrincipal.titulo}
              </h3>

              <p className="mt-5 leading-8 text-zinc-300">
                {recortarTexto(
                  noticiaPrincipal.encabezado || noticiaPrincipal.contenido,
                  260
                )}
              </p>

              <Link
                href={`/noticias/${noticiaPrincipal.slug}`}
                className="mt-7 inline-block rounded-full bg-yellow-500 px-7 py-4 font-black text-black transition hover:bg-yellow-400"
              >
                Leer noticia
              </Link>
            </div>
          </article>

          <div className="grid gap-8">
            {noticiasSecundarias.map((noticia) => (
              <article
                key={noticia.id}
                className="group overflow-hidden rounded-[2rem] border border-zinc-800 bg-black shadow-2xl transition hover:-translate-y-1 hover:border-yellow-500/50"
              >
                <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr] xl:grid-cols-1">
                  <div className="relative">
                    <ImagenNoticiaProfesional noticia={noticia} />

                    {noticia.destacada && (
                      <div className="absolute left-4 top-4 rounded-full bg-yellow-500 px-4 py-2 text-xs font-black uppercase tracking-wide text-black">
                        Destacada
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-yellow-300">
                        {noticia.categoria || "General"}
                      </span>

                      {noticia.fecha_publicacion && (
                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-zinc-300">
                          {formatearFecha(noticia.fecha_publicacion)}
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-black text-white">
                      {noticia.titulo}
                    </h3>

                    <p className="mt-4 leading-7 text-zinc-300">
                      {recortarTexto(noticia.encabezado || noticia.contenido)}
                    </p>

                    <Link
                      href={`/noticias/${noticia.slug}`}
                      className="mt-6 inline-block rounded-full bg-yellow-500 px-6 py-3 text-sm font-black text-black transition hover:bg-yellow-400"
                    >
                      Leer noticia
                    </Link>
                  </div>
                </div>
              </article>
            ))}

            {noticiasSecundarias.length === 0 && (
              <div className="rounded-[2rem] border border-white/10 bg-black p-8">
                <h3 className="text-2xl font-black">
                  Más novedades próximamente
                </h3>

                <p className="mt-3 leading-7 text-zinc-400">
                  Cuando SERVICAN publique nuevas noticias, aparecerán en esta
                  sección.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}