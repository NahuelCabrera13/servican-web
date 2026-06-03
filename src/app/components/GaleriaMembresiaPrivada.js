"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function obtenerYoutubeEmbedUrl(urlOriginal) {
  const urlTexto = String(urlOriginal || "").trim();

  if (!urlTexto) {
    return "";
  }

  try {
    const url = new URL(urlTexto);

    if (url.hostname.includes("youtube.com")) {
      const videoId = url.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (url.pathname.startsWith("/shorts/")) {
        const shortsId = url.pathname.split("/shorts/")[1]?.split("/")[0];

        if (shortsId) {
          return `https://www.youtube.com/embed/${shortsId}`;
        }
      }

      if (url.pathname.startsWith("/embed/")) {
        return urlTexto;
      }
    }

    if (url.hostname.includes("youtu.be")) {
      const videoId = url.pathname.replace("/", "").split("?")[0];

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return "";
  } catch {
    return "";
  }
}

function esArchivoVideoDirecto(url) {
  const texto = String(url || "").toLowerCase();

  return (
    texto.endsWith(".mp4") ||
    texto.endsWith(".webm") ||
    texto.endsWith(".ogg") ||
    texto.includes(".mp4?") ||
    texto.includes(".webm?") ||
    texto.includes(".ogg?")
  );
}

export default function GaleriaMembresiaPrivada() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [contenidos, setContenidos] = useState([]);
  const [requiereMembresia, setRequiereMembresia] = useState(false);

  async function cargarGaleria() {
    setCargando(true);
    setError("");
    setRequiereMembresia(false);

    try {
      const respuesta = await fetch("/api/membresia/contenidos", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo cargar la galería privada.");
        setRequiereMembresia(Boolean(data?.requiere_membresia_activa));
        setContenidos([]);
        return;
      }

      setContenidos(data?.contenidos || []);
    } catch (error) {
      console.error("Error cargando galería:", error);
      setError("Error de conexión al cargar la galería privada.");
      setContenidos([]);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarGaleria();
  }, []);

  if (cargando) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-zinc-950 p-8">
        <p className="text-sm font-bold text-zinc-400">
          Cargando galería privada...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-yellow-500/30 bg-yellow-500/10 p-8">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-300">
          Acceso restringido
        </p>

        <h2 className="mt-3 text-3xl font-black text-yellow-100">
          Galería privada bloqueada
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-yellow-100/80">
          {error}
        </p>

        {requiereMembresia ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/panel/membresia"
              className="rounded-2xl bg-yellow-500 px-6 py-3 text-center text-sm font-black text-black transition hover:bg-yellow-400"
            >
              Ver mi membresía
            </Link>

            <Link
              href="/cursos#membresia"
              className="rounded-2xl border border-yellow-500/40 bg-black/30 px-6 py-3 text-center text-sm font-black text-yellow-100 transition hover:bg-yellow-500 hover:text-black"
            >
              Contratar membresía
            </Link>
          </div>
        ) : null}
      </div>
    );
  }

  if (contenidos.length === 0) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-zinc-950 p-8">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-500">
          Galería privada
        </p>

        <h2 className="mt-3 text-3xl font-black text-white">
          Todavía no hay contenido cargado
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          Tu membresía activa ya puede acceder a esta sección. Cuando SERVICAN
          cargue fotos, videos o archivos exclusivos, aparecerán acá.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 rounded-[2rem] border border-green-500/30 bg-green-500/10 p-6">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-green-300">
          Acceso habilitado
        </p>

        <h2 className="mt-3 text-3xl font-black text-green-100">
          Galería privada desbloqueada
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-green-100/80">
          Tu membresía activa te permite acceder a este contenido privado de
          SERVICAN.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {contenidos.map((contenido) => (
          <ContenidoCard key={contenido.id} contenido={contenido} />
        ))}
      </div>
    </div>
  );
}

function ContenidoCard({ contenido }) {
  const tipo = String(contenido.tipo || "foto").toLowerCase();
  const esImagen = tipo === "foto";
  const esVideo = tipo === "video";
  const youtubeEmbedUrl = esVideo
    ? obtenerYoutubeEmbedUrl(contenido.url)
    : "";
  const videoDirecto = esVideo && esArchivoVideoDirecto(contenido.url);

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950">
      <div className="relative aspect-video bg-black">
        {esImagen ? (
          <img
            src={contenido.url}
            alt={contenido.titulo}
            className="h-full w-full object-cover"
          />
        ) : youtubeEmbedUrl ? (
          <iframe
            src={youtubeEmbedUrl}
            title={contenido.titulo}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : videoDirecto ? (
          <video
            src={contenido.url}
            poster={contenido.portada_url || undefined}
            controls
            className="h-full w-full bg-black object-cover"
          />
        ) : contenido.portada_url ? (
          <img
            src={contenido.portada_url}
            alt={contenido.titulo}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-6 text-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
                {tipo}
              </p>

              {esVideo ? (
                <p className="mt-3 text-xs leading-5 text-zinc-500">
                  No se pudo cargar el video. Usá una URL válida de YouTube,
                  por ejemplo: https://www.youtube.com/watch?v=ID
                </p>
              ) : null}
            </div>
          </div>
        )}

        {contenido.destacado ? (
          <div className="absolute left-4 top-4 rounded-full bg-yellow-500 px-3 py-1 text-xs font-black uppercase text-black">
            Destacado
          </div>
        ) : null}
      </div>

      <div className="p-5">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-500">
          {tipo}
        </p>

        <h3 className="mt-2 text-xl font-black text-white">
          {contenido.titulo}
        </h3>

        {contenido.descripcion ? (
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {contenido.descripcion}
          </p>
        ) : null}

        {esVideo && !youtubeEmbedUrl && !videoDirecto ? (
          <a
            href={contenido.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex rounded-2xl border border-yellow-500 px-5 py-3 text-sm font-black text-yellow-500 transition hover:bg-yellow-500 hover:text-black"
          >
            Abrir video
          </a>
        ) : null}

        {!esImagen && !esVideo ? (
          <a
            href={contenido.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex rounded-2xl border border-yellow-500 px-5 py-3 text-sm font-black text-yellow-500 transition hover:bg-yellow-500 hover:text-black"
          >
            Abrir contenido
          </a>
        ) : null}
      </div>
    </article>
  );
}