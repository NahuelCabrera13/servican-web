"use client";

import { useEffect, useMemo, useState } from "react";

const estadoInicial = {
  id: "",
  titulo: "",
  descripcion: "",
  tipo: "foto",
  url: "",
  portada_url: "",
  activo: true,
  destacado: false,
  orden: 0,
};

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

export default function AdminGaleriaMembresiaClient() {
  const [contenidos, setContenidos] = useState([]);
  const [form, setForm] = useState(estadoInicial);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const editando = Boolean(form.id);

  const resumen = useMemo(() => {
    const activos = contenidos.filter((item) => item.activo).length;
    const destacados = contenidos.filter((item) => item.destacado).length;

    return {
      total: contenidos.length,
      activos,
      destacados,
    };
  }, [contenidos]);

  async function cargarContenidos() {
    setCargando(true);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetch("/api/admin/membresia/contenidos", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        setError(data?.error || "No se pudieron cargar los contenidos.");
        setContenidos([]);
        return;
      }

      setContenidos(data?.contenidos || []);
    } catch (error) {
      console.error("Error cargando contenidos:", error);
      setError("Error de conexión al cargar contenidos.");
      setContenidos([]);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarContenidos();
  }, []);

  function cambiarCampo(campo, valor) {
    setForm((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  function limpiarFormulario() {
    setForm(estadoInicial);
    setError("");
    setMensaje("");
  }

  function editarContenido(contenido) {
    setForm({
      id: contenido.id || "",
      titulo: contenido.titulo || "",
      descripcion: contenido.descripcion || "",
      tipo: contenido.tipo || "foto",
      url: contenido.url || "",
      portada_url: contenido.portada_url || "",
      activo: Boolean(contenido.activo),
      destacado: Boolean(contenido.destacado),
      orden: contenido.orden || 0,
    });

    setMensaje("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function subirFoto(event) {
    const archivo = event.target.files?.[0];

    if (!archivo) {
      return;
    }

    setSubiendoFoto(true);
    setError("");
    setMensaje("");

    try {
      const formData = new FormData();
      formData.append("archivo", archivo);

      const respuesta = await fetch("/api/admin/membresia/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo subir la foto.");
        return;
      }

      setForm((actual) => ({
        ...actual,
        tipo: "foto",
        url: data?.path || data?.url || "",
      }));

      setMensaje("Foto subida correctamente. Ahora podés guardar el contenido.");
    } catch (error) {
      console.error("Error subiendo foto:", error);
      setError("Error de conexión al subir la foto.");
    } finally {
      setSubiendoFoto(false);
      event.target.value = "";
    }
  }

  async function guardarContenido(event) {
    event.preventDefault();

    setGuardando(true);
    setError("");
    setMensaje("");

    const metodo = editando ? "PATCH" : "POST";

    try {
      const respuesta = await fetch("/api/admin/membresia/contenidos", {
        method: metodo,
        credentials: "include",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: form.id,
          titulo: form.titulo,
          descripcion: form.descripcion,
          tipo: form.tipo,
          url: form.url,
          portada_url: form.portada_url,
          activo: form.activo,
          destacado: form.destacado,
          orden: Number(form.orden),
        }),
      });

      const data = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo guardar el contenido.");
        return;
      }

      setMensaje(
        editando
          ? "Contenido actualizado correctamente."
          : "Contenido creado correctamente."
      );

      setForm(estadoInicial);
      await cargarContenidos();
    } catch (error) {
      console.error("Error guardando contenido:", error);
      setError("Error de conexión al guardar el contenido.");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarContenido(contenido) {
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar "${contenido.titulo}"?`
    );

    if (!confirmar) {
      return;
    }

    setError("");
    setMensaje("");

    try {
      const respuesta = await fetch(
        `/api/admin/membresia/contenidos?id=${encodeURIComponent(
          contenido.id
        )}`,
        {
          method: "DELETE",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo eliminar el contenido.");
        return;
      }

      setMensaje("Contenido eliminado correctamente.");

      if (form.id === contenido.id) {
        setForm(estadoInicial);
      }

      await cargarContenidos();
    } catch (error) {
      console.error("Error eliminando contenido:", error);
      setError("Error de conexión al eliminar el contenido.");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
      <aside className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <ResumenCard titulo="Total" valor={resumen.total} />
          <ResumenCard titulo="Activos" valor={resumen.activos} />
          <ResumenCard titulo="Destacados" valor={resumen.destacados} />
        </div>

        <form
          onSubmit={guardarContenido}
          className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6"
        >
          <div className="mb-5">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-500">
              {editando ? "Editar contenido" : "Nuevo contenido"}
            </p>

            <h2 className="mt-2 text-2xl font-black">
              {editando ? "Modificar publicación" : "Agregar a galería"}
            </h2>
          </div>

          <div className="grid gap-4">
            {error ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {mensaje ? (
              <div className="rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">
                {mensaje}
              </div>
            ) : null}

            <CampoTexto
              label="Título"
              value={form.titulo}
              onChange={(valor) => cambiarCampo("titulo", valor)}
              placeholder="Entrenamiento de detección"
            />

            <CampoArea
              label="Descripción"
              value={form.descripcion}
              onChange={(valor) => cambiarCampo("descripcion", valor)}
              placeholder="Descripción breve del contenido..."
            />

            <div>
              <label className="text-sm font-bold text-zinc-300">Tipo</label>

              <select
                value={form.tipo}
                onChange={(event) => cambiarCampo("tipo", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-500"
              >
                <option value="foto">Foto</option>
                <option value="video">Video de YouTube</option>
                <option value="archivo">Archivo</option>
                <option value="texto">Texto</option>
              </select>
            </div>

            {form.tipo === "foto" ? (
              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                <label className="text-sm font-bold text-yellow-100">
                  Subir foto desde archivos
                </label>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={subirFoto}
                  disabled={subiendoFoto}
                  className="mt-3 block w-full cursor-pointer rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-zinc-300 file:mr-4 file:rounded-xl file:border-0 file:bg-yellow-500 file:px-4 file:py-2 file:text-sm file:font-black file:text-black"
                />

                <p className="mt-3 text-xs leading-5 text-yellow-100/70">
                  Las fotos se guardan en Supabase Storage privado. El alumno
                  solo las ve si tiene membresía activa.
                </p>

                {form.url ? (
                  <p className="mt-3 break-all rounded-xl border border-white/10 bg-black p-3 text-xs text-zinc-300">
                    Ruta guardada: {form.url}
                  </p>
                ) : null}
              </div>
            ) : null}

            {form.tipo === "video" ? (
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                <p className="text-sm font-bold text-blue-100">
                  Video por URL de YouTube
                </p>

                <p className="mt-2 text-xs leading-5 text-blue-100/70">
                  Pegá un enlace directo a un video. Ejemplos:
                  https://www.youtube.com/watch?v=ID o https://youtu.be/ID
                </p>
              </div>
            ) : null}

            {form.tipo !== "foto" ? (
              <CampoTexto
                label={
                  form.tipo === "video"
                    ? "URL de YouTube"
                    : "URL del contenido"
                }
                value={form.url}
                onChange={(valor) => cambiarCampo("url", valor)}
                placeholder={
                  form.tipo === "video"
                    ? "https://www.youtube.com/watch?v=..."
                    : "https://... o /archivo.pdf"
                }
              />
            ) : null}

            <CampoTexto
              label="URL de portada"
              value={form.portada_url}
              onChange={(valor) => cambiarCampo("portada_url", valor)}
              placeholder="Opcional para videos o archivos"
            />

            <CampoTexto
              label="Orden"
              type="number"
              value={form.orden}
              onChange={(valor) => cambiarCampo("orden", valor)}
              placeholder="0"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Checkbox
                label="Activo"
                checked={form.activo}
                onChange={(valor) => cambiarCampo("activo", valor)}
              />

              <Checkbox
                label="Destacado"
                checked={form.destacado}
                onChange={(valor) => cambiarCampo("destacado", valor)}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={guardando || subiendoFoto}
                className="rounded-2xl bg-yellow-500 px-6 py-3 text-sm font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {guardando
                  ? "Guardando..."
                  : subiendoFoto
                    ? "Subiendo foto..."
                    : editando
                      ? "Guardar cambios"
                      : "Crear contenido"}
              </button>

              {editando ? (
                <button
                  type="button"
                  onClick={limpiarFormulario}
                  className="rounded-2xl border border-white/10 bg-white/10 px-6 py-3 text-sm font-black text-white transition hover:bg-white hover:text-black"
                >
                  Cancelar edición
                </button>
              ) : null}
            </div>
          </div>
        </form>
      </aside>

      <section className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-500">
              Contenidos
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Galería privada cargada
            </h2>
          </div>

          <button
            type="button"
            onClick={cargarContenidos}
            className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white hover:text-black"
          >
            Recargar
          </button>
        </div>

        {cargando ? (
          <p className="rounded-2xl border border-white/10 bg-black p-5 text-sm text-zinc-400">
            Cargando contenidos...
          </p>
        ) : contenidos.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black p-8 text-center">
            <h3 className="text-2xl font-black">
              Todavía no hay contenido
            </h3>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-400">
              Agregá el primer contenido exclusivo. Cuando el alumno tenga
              membresía activa, lo verá en su galería privada.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {contenidos.map((contenido) => (
              <ContenidoAdminCard
                key={contenido.id}
                contenido={contenido}
                onEditar={() => editarContenido(contenido)}
                onEliminar={() => eliminarContenido(contenido)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ResumenCard({ titulo, valor }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-zinc-950 p-5">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
        {titulo}
      </p>
      <p className="mt-2 text-3xl font-black text-yellow-500">{valor}</p>
    </div>
  );
}

function ContenidoAdminCard({ contenido, onEditar, onEliminar }) {
  const tipo = String(contenido.tipo || "foto").toLowerCase();
  const esImagen = tipo === "foto";
  const esVideo = tipo === "video";
  const youtubeEmbedUrl = esVideo ? obtenerYoutubeEmbedUrl(contenido.url) : "";
  const imagenPreview = contenido.preview_url || contenido.url;
  const portadaPreview = contenido.portada_preview_url || contenido.portada_url;

  return (
    <article className="overflow-hidden rounded-[1.7rem] border border-white/10 bg-black">
      <div className="relative aspect-video bg-zinc-950">
        {esImagen ? (
          <img
            src={imagenPreview}
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
        ) : portadaPreview ? (
          <img
            src={portadaPreview}
            alt={contenido.titulo}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-zinc-500">
              {tipo}
            </p>
          </div>
        )}

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${
              contenido.activo
                ? "border-green-500/30 bg-green-500/10 text-green-200"
                : "border-red-500/30 bg-red-500/10 text-red-200"
            }`}
          >
            {contenido.activo ? "Activo" : "Inactivo"}
          </span>

          {contenido.destacado ? (
            <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-black uppercase text-yellow-200">
              Destacado
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-5">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-500">
          {tipo} · Orden {contenido.orden || 0}
        </p>

        <h3 className="mt-2 text-xl font-black text-white">
          {contenido.titulo}
        </h3>

        {contenido.descripcion ? (
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {contenido.descripcion}
          </p>
        ) : null}

        <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-950 p-3">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
            URL / Ruta
          </p>
          <p className="mt-1 break-all text-xs text-zinc-300">
            {contenido.url}
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onEditar}
            className="rounded-2xl border border-yellow-500 px-5 py-3 text-sm font-black text-yellow-500 transition hover:bg-yellow-500 hover:text-black"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={onEliminar}
            className="rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-3 text-sm font-black text-red-200 transition hover:bg-red-500 hover:text-white"
          >
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}

function CampoTexto({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}) {
  return (
    <div>
      <label className="text-sm font-bold text-zinc-300">{label}</label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-yellow-500"
      />
    </div>
  );
}

function CampoArea({ label, value, onChange, placeholder = "" }) {
  return (
    <div>
      <label className="text-sm font-bold text-zinc-300">{label}</label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-yellow-500"
      />
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black px-4 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4"
      />

      <span className="text-sm font-bold text-zinc-300">{label}</span>
    </label>
  );
}