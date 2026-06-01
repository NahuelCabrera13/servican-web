"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const NOTICIA_INICIAL = {
  titulo: "",
  slug: "",
  encabezado: "",
  contenido: "",
  imagen_url: "",
  categoria: "General",
  autor: "SERVICAN",
  publicada: false,
  destacada: false,
  orden: 0,
  fecha_publicacion: "",
};

function limpiarSlug(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fechaParaInput(fecha) {
  if (!fecha) return "";

  try {
    return new Date(fecha).toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

export default function NoticiasAdminClient() {
  const [noticias, setNoticias] = useState([]);
  const [formulario, setFormulario] = useState(NOTICIA_INICIAL);
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    cargarNoticias();
  }, []);

  async function obtenerToken() {
    const supabase = createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token || null;
  }

  async function fetchAdmin(url, opciones = {}) {
    const token = await obtenerToken();

    if (!token) {
      throw new Error("No hay sesión activa.");
    }

    return fetch(url, {
      ...opciones,
      headers: {
        ...(opciones.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async function cargarNoticias() {
    setCargando(true);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetchAdmin("/api/admin/noticias");
      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudieron cargar las noticias.");
        setNoticias([]);
        return;
      }

      setNoticias(data.noticias || []);
    } catch (error) {
      setError(error?.message || "Error de conexión cargando noticias.");
      setNoticias([]);
    } finally {
      setCargando(false);
    }
  }

  function actualizarCampo(campo, valor) {
    setFormulario((actual) => {
      const actualizado = {
        ...actual,
        [campo]: valor,
      };

      if (campo === "titulo" && !editandoId) {
        actualizado.slug = limpiarSlug(valor);
      }

      return actualizado;
    });
  }

  function resetearFormulario() {
    setFormulario(NOTICIA_INICIAL);
    setEditandoId(null);
  }

  function editarNoticia(noticia) {
    setEditandoId(noticia.id);

    setFormulario({
      titulo: noticia.titulo || "",
      slug: noticia.slug || "",
      encabezado: noticia.encabezado || "",
      contenido: noticia.contenido || "",
      imagen_url: noticia.imagen_url || "",
      categoria: noticia.categoria || "General",
      autor: noticia.autor || "SERVICAN",
      publicada: Boolean(noticia.publicada),
      destacada: Boolean(noticia.destacada),
      orden: Number(noticia.orden || 0),
      fecha_publicacion: fechaParaInput(noticia.fecha_publicacion),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function subirImagen(event) {
    const archivo = event.target.files?.[0];

    if (!archivo) return;

    setSubiendoImagen(true);
    setError("");
    setMensaje("");

    try {
      const formData = new FormData();
      formData.append("archivo", archivo);

      const respuesta = await fetchAdmin("/api/admin/noticias/upload", {
        method: "POST",
        body: formData,
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo subir la imagen.");
        return;
      }

      actualizarCampo("imagen_url", data.url);
      setMensaje("Imagen subida correctamente.");
    } catch (error) {
      setError(error?.message || "Error subiendo imagen.");
    } finally {
      setSubiendoImagen(false);
      event.target.value = "";
    }
  }

  async function guardarNoticia(event) {
    event.preventDefault();

    setCargando(true);
    setError("");
    setMensaje("");

    try {
      const metodo = editandoId ? "PATCH" : "POST";

      const respuesta = await fetchAdmin("/api/admin/noticias", {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editandoId,
          ...formulario,
          slug: limpiarSlug(formulario.slug || formulario.titulo),
          fecha_publicacion:
            formulario.fecha_publicacion || new Date().toISOString(),
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo guardar la noticia.");
        return;
      }

      setMensaje(
        editandoId
          ? "Noticia actualizada correctamente."
          : "Noticia creada correctamente."
      );

      resetearFormulario();
      await cargarNoticias();
    } catch (error) {
      setError(error?.message || "Error guardando noticia.");
    } finally {
      setCargando(false);
    }
  }

  async function eliminarNoticia(id) {
    const confirmar = window.confirm(
      "¿Seguro que querés eliminar esta noticia? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    setCargando(true);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetchAdmin("/api/admin/noticias", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo eliminar la noticia.");
        return;
      }

      setMensaje("Noticia eliminada correctamente.");
      await cargarNoticias();
    } catch (error) {
      setError(error?.message || "Error eliminando noticia.");
    } finally {
      setCargando(false);
    }
  }

  async function cambiarPublicacion(noticia, publicada) {
    setCargando(true);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetchAdmin("/api/admin/noticias", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...noticia,
          publicada,
          fecha_publicacion:
            noticia.fecha_publicacion || new Date().toISOString(),
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo cambiar el estado.");
        return;
      }

      setMensaje(publicada ? "Noticia publicada." : "Noticia ocultada.");
      await cargarNoticias();
    } catch (error) {
      setError(error?.message || "Error cambiando estado.");
    } finally {
      setCargando(false);
    }
  }

  const noticiasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return noticias;

    return noticias.filter((noticia) =>
      Object.values(noticia).some((valor) =>
        String(valor || "").toLowerCase().includes(texto)
      )
    );
  }, [busqueda, noticias]);

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-[2rem] border border-yellow-500/20 bg-zinc-950 p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
                Panel admin
              </p>

              <h1 className="mt-2 text-4xl font-black">
                Noticias SERVICAN
              </h1>

              <p className="mt-3 max-w-3xl leading-7 text-zinc-400">
                Creá noticias con título, encabezado, foto, contenido, categoría
                y estado publicado/oculto. Las noticias publicadas aparecen en
                la página principal.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin"
                className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/20"
              >
                Volver al admin
              </Link>

              <Link
                href="/"
                className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-3 text-center text-sm font-bold text-yellow-200 transition hover:bg-yellow-500/20"
              >
                Ver inicio
              </Link>

              <button
                type="button"
                onClick={cargarNoticias}
                className="rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-black text-black transition hover:bg-yellow-400"
              >
                Actualizar
              </button>
            </div>
          </div>
        </header>

        {mensaje && (
          <div className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-green-200">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <form
            onSubmit={guardarNoticia}
            className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6"
          >
            <h2 className="text-3xl font-black">
              {editandoId ? "Editar noticia" : "Crear noticia"}
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Título
                </label>
                <input
                  value={formulario.titulo}
                  onChange={(event) =>
                    actualizarCampo("titulo", event.target.value)
                  }
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
                  placeholder="Ej: Nueva jornada de entrenamiento SERVICAN"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Slug URL
                </label>
                <input
                  value={formulario.slug}
                  onChange={(event) =>
                    actualizarCampo("slug", limpiarSlug(event.target.value))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
                  placeholder="nueva-jornada-de-entrenamiento"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Encabezado
                </label>
                <textarea
                  value={formulario.encabezado}
                  onChange={(event) =>
                    actualizarCampo("encabezado", event.target.value)
                  }
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
                  placeholder="Resumen corto que se ve en la página principal."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Contenido completo
                </label>
                <textarea
                  value={formulario.contenido}
                  onChange={(event) =>
                    actualizarCampo("contenido", event.target.value)
                  }
                  rows={8}
                  className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
                  placeholder="Desarrollá la noticia completa..."
                />
              </div>

              <div className="rounded-3xl border border-white/10 bg-black p-5">
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Foto de la noticia
                </label>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={subirImagen}
                  disabled={subiendoImagen}
                  className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-zinc-300"
                />

                {subiendoImagen && (
                  <p className="mt-3 text-sm text-yellow-300">
                    Subiendo imagen...
                  </p>
                )}

                <input
                  value={formulario.imagen_url}
                  onChange={(event) =>
                    actualizarCampo("imagen_url", event.target.value)
                  }
                  className="mt-4 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-yellow-500"
                  placeholder="URL de imagen"
                />

                {formulario.imagen_url && (
                  <img
                    src={formulario.imagen_url}
                    alt="Vista previa noticia"
                    className="mt-4 max-h-72 w-full rounded-2xl object-contain bg-black"
                  />
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-300">
                    Categoría
                  </label>
                  <input
                    value={formulario.categoria}
                    onChange={(event) =>
                      actualizarCampo("categoria", event.target.value)
                    }
                    className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
                    placeholder="General, Curso, Jornada, K9..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-300">
                    Autor
                  </label>
                  <input
                    value={formulario.autor}
                    onChange={(event) =>
                      actualizarCampo("autor", event.target.value)
                    }
                    className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
                    placeholder="SERVICAN"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-300">
                    Orden
                  </label>
                  <input
                    type="number"
                    value={formulario.orden}
                    onChange={(event) =>
                      actualizarCampo("orden", event.target.value)
                    }
                    className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-300">
                    Fecha publicación
                  </label>
                  <input
                    type="datetime-local"
                    value={formulario.fecha_publicacion}
                    onChange={(event) =>
                      actualizarCampo("fecha_publicacion", event.target.value)
                    }
                    className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black p-4">
                  <input
                    type="checkbox"
                    checked={formulario.publicada}
                    onChange={(event) =>
                      actualizarCampo("publicada", event.target.checked)
                    }
                    className="h-5 w-5"
                  />
                  <span className="font-bold">Publicada en la web</span>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black p-4">
                  <input
                    type="checkbox"
                    checked={formulario.destacada}
                    onChange={(event) =>
                      actualizarCampo("destacada", event.target.checked)
                    }
                    className="h-5 w-5"
                  />
                  <span className="font-bold">Noticia destacada</span>
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={cargando}
                  className="rounded-full bg-yellow-500 px-8 py-4 font-black text-black transition hover:bg-yellow-400 disabled:opacity-50"
                >
                  {cargando
                    ? "Guardando..."
                    : editandoId
                    ? "Guardar cambios"
                    : "Crear noticia"}
                </button>

                {editandoId && (
                  <button
                    type="button"
                    onClick={resetearFormulario}
                    className="rounded-full border border-white/10 bg-white/10 px-8 py-4 font-black transition hover:bg-white/20"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>
            </div>
          </form>

          <section className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-black">Noticias cargadas</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Total: {noticias.length}
                </p>
              </div>

              <input
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
                placeholder="Buscar noticia..."
              />
            </div>

            <div className="space-y-4">
              {noticiasFiltradas.length === 0 && (
                <div className="rounded-3xl border border-white/10 bg-black p-6 text-zinc-400">
                  No hay noticias para mostrar.
                </div>
              )}

              {noticiasFiltradas.map((noticia) => (
                <article
                  key={noticia.id}
                  className="rounded-3xl border border-white/10 bg-black p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-4">
                      <div className="h-24 w-32 shrink-0 overflow-hidden rounded-2xl bg-zinc-900">
                        {noticia.imagen_url ? (
                          <img
                            src={noticia.imagen_url}
                            alt={noticia.titulo}
                            className="h-full w-full object-contain bg-black"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                            Sin foto
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${
                              noticia.publicada
                                ? "border-green-500/30 bg-green-500/10 text-green-200"
                                : "border-zinc-500/30 bg-zinc-500/10 text-zinc-300"
                            }`}
                          >
                            {noticia.publicada ? "Publicada" : "Oculta"}
                          </span>

                          {noticia.destacada && (
                            <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-yellow-200">
                              Destacada
                            </span>
                          )}
                        </div>

                        <h3 className="mt-3 text-xl font-black">
                          {noticia.titulo}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-zinc-400">
                          {noticia.encabezado || "Sin encabezado"}
                        </p>

                        <p className="mt-2 text-xs text-zinc-600">
                          /noticias/{noticia.slug}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => editarNoticia(noticia)}
                        className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-200 hover:bg-yellow-500/20"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          cambiarPublicacion(noticia, !noticia.publicada)
                        }
                        className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-200 hover:bg-blue-500/20"
                      >
                        {noticia.publicada ? "Ocultar" : "Publicar"}
                      </button>

                      <button
                        type="button"
                        onClick={() => eliminarNoticia(noticia.id)}
                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200 hover:bg-red-500/20"
                      >
                        Eliminar
                      </button>

                      {noticia.publicada && (
                        <Link
                          href={`/noticias/${noticia.slug}`}
                          target="_blank"
                          className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-center text-sm font-bold hover:bg-white/20"
                        >
                          Ver
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}