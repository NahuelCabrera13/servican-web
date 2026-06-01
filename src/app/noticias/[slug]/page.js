import Link from "next/link";
import { notFound } from "next/navigation";
import HeaderAcceso from "../../components/HeaderAcceso";
import { obtenerNoticiaPorSlug } from "@/lib/noticiasPublicas";

export const dynamic = "force-dynamic";

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

function ImagenPrincipalNoticia({ noticia }) {
  if (!noticia.imagen_url) {
    return null;
  }

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.8rem] border border-yellow-500/25 bg-zinc-950 shadow-2xl">
        <div className="relative min-h-[430px] overflow-hidden">
          <img
            src={noticia.imagen_url}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />

          <div className="relative flex min-h-[430px] items-center justify-center p-5">
            <img
              src={noticia.imagen_url}
              alt={noticia.titulo}
              className="max-h-[720px] w-full rounded-[2rem] object-contain shadow-2xl ring-1 ring-white/10"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function NoticiaDetallePage({ params }) {
  const { slug } = await params;
  const noticia = await obtenerNoticiaPorSlug(slug);

  if (!noticia) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-yellow-500/20 bg-black/95">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logo-servican.jpeg"
              alt="Logo SERVICAN"
              className="h-14 w-14 rounded-full object-contain"
            />

            <div>
              <p className="text-xl font-black tracking-[0.25em] text-yellow-500">
                SERVICAN
              </p>
              <p className="text-xs text-zinc-400">Noticias y novedades</p>
            </div>
          </Link>

          <HeaderAcceso />
        </div>
      </header>

      <article>
        <section className="relative overflow-hidden border-b border-zinc-900 px-4 py-16 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(234,179,8,0.20),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_32%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black to-black" />

          <div className="relative mx-auto max-w-5xl">
            <Link
              href="/noticias"
              className="inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-5 py-3 text-sm font-black text-yellow-300 transition hover:bg-yellow-500 hover:text-black"
            >
              ← Volver a noticias
            </Link>

            <div className="mt-10 flex flex-wrap gap-3">
              <span className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-4 py-2 text-xs font-black uppercase tracking-wide text-yellow-200">
                {noticia.categoria || "General"}
              </span>

              {noticia.fecha_publicacion && (
                <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-zinc-300">
                  {formatearFecha(noticia.fecha_publicacion)}
                </span>
              )}

              {noticia.autor && (
                <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-zinc-300">
                  {noticia.autor}
                </span>
              )}
            </div>

            <h1 className="mt-7 text-5xl font-black leading-tight md:text-7xl">
              {noticia.titulo}
            </h1>

            {noticia.encabezado && (
              <p className="mt-7 text-xl leading-9 text-zinc-300">
                {noticia.encabezado}
              </p>
            )}
          </div>
        </section>

        <ImagenPrincipalNoticia noticia={noticia} />

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.75fr_0.25fr]">
            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8 shadow-2xl md:p-10">
              <div className="whitespace-pre-line text-lg leading-9 text-zinc-200">
                {noticia.contenido || noticia.encabezado}
              </div>
            </div>

            <aside className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
                Información
              </p>

              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                    Categoría
                  </p>
                  <p className="mt-1 font-black text-white">
                    {noticia.categoria || "General"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                    Fecha
                  </p>
                  <p className="mt-1 font-black text-white">
                    {formatearFecha(noticia.fecha_publicacion)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                    Publicado por
                  </p>
                  <p className="mt-1 font-black text-white">
                    {noticia.autor || "SERVICAN"}
                  </p>
                </div>
              </div>

              <Link
                href="/noticias"
                className="mt-8 block rounded-full bg-yellow-500 px-5 py-3 text-center text-sm font-black text-black transition hover:bg-yellow-400"
              >
                Ver más noticias
              </Link>
            </aside>
          </div>
        </section>
      </article>
    </main>
  );
}