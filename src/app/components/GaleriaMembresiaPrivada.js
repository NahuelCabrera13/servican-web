"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

function obtenerEtiquetaTipo(tipoOriginal) {
  const tipo = String(tipoOriginal || "").toLowerCase();

  if (tipo === "foto") {
    return "Foto";
  }

  if (tipo === "video") {
    return "Video";
  }

  if (tipo === "archivo") {
    return "Archivo";
  }

  return "Contenido";
}

export default function GaleriaMembresiaPrivada() {
  const [cargando, setCargando] = useState(true);
  const [reintentando, setReintentando] = useState(false);
  const [error, setError] = useState("");
  const [contenidos, setContenidos] = useState([]);
  const [requiereMembresia, setRequiereMembresia] = useState(false);

  async function cargarGaleria({ silencioso = false } = {}) {
    if (silencioso) {
      setReintentando(true);
    } else {
      setCargando(true);
    }

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

      setContenidos(Array.isArray(data?.contenidos) ? data.contenidos : []);
    } catch (error) {
      console.error("Error cargando galería:", error);
      setError("Error de conexión al cargar la galería privada.");
      setContenidos([]);
    } finally {
      setCargando(false);
      setReintentando(false);
    }
  }

  useEffect(() => {
    cargarGaleria();
  }, []);

  const resumen = useMemo(() => {
    const fotos = contenidos.filter(
      (contenido) => String(contenido.tipo || "").toLowerCase() === "foto"
    ).length;

    const videos = contenidos.filter(
      (contenido) => String(contenido.tipo || "").toLowerCase() === "video"
    ).length;

    const archivos = contenidos.filter((contenido) => {
      const tipo = String(contenido.tipo || "").toLowerCase();
      return tipo !== "foto" && tipo !== "video";
    }).length;

    return {
      fotos,
      videos,
      archivos,
      total: contenidos.length,
    };
  }, [contenidos]);

  if (cargando) {
    return <EstadoCargando />;
  }

  if (error) {
    return (
      <EstadoBloqueado
        error={error}
        requiereMembresia={requiereMembresia}
        reintentando={reintentando}
        onReintentar={() => cargarGaleria({ silencioso: true })}
      />
    );
  }

  if (contenidos.length === 0) {
    return <EstadoVacio />;
  }

  return (
    <div>
      <div className="mb-8 overflow-hidden rounded-[2rem] border border-green-500/30 bg-green-500/10">
        <div className="border-b border-green-500/20 bg-black/20 p-6 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-green-300">
            Acceso habilitado
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-green-100">
            Galería privada desbloqueada
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-green-100/80">
            Tu membresía activa te permite acceder a este contenido privado de
            SERVICAN.
          </p>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-4 sm:p-8">
          <ResumenItem titulo="Total" valor={resumen.total} />
          <ResumenItem titulo="Fotos" valor={resumen.fotos} />
          <ResumenItem titulo="Videos" valor={resumen.videos} />
          <ResumenItem titulo="Archivos" valor={resumen.archivos} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {contenidos.map((contenido) => (
          <ContenidoCard key={contenido.id} contenido={contenido} />
        ))}
      </div>
    </div>
  );
}

function EstadoCargando() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-zinc-950 p-8">
      <div className="flex items-center gap-4">
        <div className="h-4 w-4 animate-pulse rounded-full bg-yellow-500" />

        <p className="text-sm font-bold text-zinc-400">
          Cargando galería privada...
        </p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className="h-72 rounded-[2rem] bg-white/[0.04]" />
        <div className="h-72 rounded-[2rem] bg-white/[0.04]" />
        <div className="h-72 rounded-[2rem] bg-white/[0.04]" />
      </div>
    </div>
  );
}

function EstadoBloqueado({
  error,
  requiereMembresia,
  reintentando,
  onReintentar,
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-yellow-500/30 bg-yellow-500/10">
      <div className="border-b border-yellow-500/20 bg-black/20 p-6 sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-300">
          Acceso restringido
        </p>

        <h2 className="mt-3 text-3xl font-black tracking-tight text-yellow-100">
          Galería privada bloqueada
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-yellow-100/80">
          {error}
        </p>
      </div>

      <div className="p-6 sm:p-8">
        <div className="grid gap-4 md:grid-cols-3">
          <MiniInfo
            titulo="Contenido privado"
            texto="Solo se muestra a miembros activos."
          />

          <MiniInfo
            titulo="Verificación automática"
            texto="La API revisa el estado antes de mostrar la galería."
          />

          <MiniInfo
            titulo="Acceso seguro"
            texto="Si no hay membresía activa, el contenido queda bloqueado."
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onReintentar}
            disabled={reintentando}
            className="rounded-2xl bg-yellow-500 px-6 py-3 text-center text-sm font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {reintentando ? "Verificando..." : "Verificar nuevamente"}
          </button>

          <Link
            href="/panel/membresia"
            className="rounded-2xl border border-yellow-500/40 bg-black/30 px-6 py-3 text-center text-sm font-black text-yellow-100 transition hover:bg-yellow-500 hover:text-black"
          >
            Ver mi membresía
          </Link>

          {requiereMembresia ? (
            <Link
              href="/cursos#membresia"
              className="rounded-2xl border border-white/10 bg-white/10 px-6 py-3 text-center text-sm font-black text-white transition hover:bg-white hover:text-black"
            >
              Contratar membresía
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EstadoVacio() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950">
      <div className="border-b border-white/10 bg-black/20 p-6 sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-500">
          Galería privada
        </p>

        <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
          Todavía no hay contenido cargado
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          Tu membresía activa ya puede acceder a esta sección. Cuando SERVICAN
          cargue fotos, videos o archivos exclusivos, aparecerán acá.
        </p>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-3 sm:p-8">
        <MiniInfo
          titulo="Fotos"
          texto="Imágenes privadas cargadas desde el administrador."
        />

        <MiniInfo
          titulo="Videos"
          texto="Videos exclusivos para alumnos con membresía activa."
        />

        <MiniInfo
          titulo="Archivos"
          texto="Material adicional disponible cuando se cargue contenido."
        />
      </div>
    </div>
  );
}

function ContenidoCard({ contenido }) {
  const tipo = String(contenido.tipo || "foto").toLowerCase();
  const etiquetaTipo = obtenerEtiquetaTipo(tipo);
  const esImagen = tipo === "foto";
  const esVideo = tipo === "video";
  const youtubeEmbedUrl = esVideo ? obtenerYoutubeEmbedUrl(contenido.url) : "";
  const videoDirecto = esVideo && esArchivoVideoDirecto(contenido.url);

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 shadow-xl shadow-black/20">
      <div className="relative aspect-video bg-black">
        {esImagen ? (
          <img
            src={contenido.url}
            alt={contenido.titulo || "Contenido privado SERVICAN"}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : youtubeEmbedUrl ? (
          <iframe
            src={youtubeEmbedUrl}
            title={contenido.titulo || "Video privado SERVICAN"}
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
            alt={contenido.titulo || "Contenido privado SERVICAN"}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-6 text-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
                {etiquetaTipo}
              </p>

              {esVideo ? (
                <p className="mt-3 text-xs leading-5 text-zinc-500">
                  No se pudo cargar el video embebido. Podés abrirlo desde el
                  botón inferior.
                </p>
              ) : (
                <p className="mt-3 text-xs leading-5 text-zinc-500">
                  Este contenido no tiene vista previa disponible.
                </p>
              )}
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
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-500">
            {etiquetaTipo}
          </p>

          {contenido.destacado ? (
            <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-[11px] font-black uppercase text-yellow-300">
              Premium
            </span>
          ) : null}
        </div>

        <h3 className="mt-2 text-xl font-black text-white">
          {contenido.titulo || "Contenido privado"}
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

function ResumenItem({ titulo, valor }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-green-200/70">
        {titulo}
      </p>

      <p className="mt-2 text-2xl font-black text-white">{valor}</p>
    </div>
  );
}

function MiniInfo({ titulo, texto }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-sm font-black text-yellow-400">{titulo}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{texto}</p>
    </div>
  );
}