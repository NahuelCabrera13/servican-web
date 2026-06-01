"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const NIVELES_ACCESO = [
  { value: "basico", label: "Básico" },
  { value: "extenso", label: "Extenso" },
  { value: "pro", label: "Pro" },
  { value: "plantel", label: "Plantel" },
];

function estadoTexto(valor) {
  return valor ? "Activo" : "Inactivo";
}

function nombreNivel(valor) {
  const nivel = NIVELES_ACCESO.find((item) => item.value === valor);
  return nivel?.label || "Básico";
}

function obtenerEmbedYoutube(url) {
  if (!url) return "";

  try {
    const urlObj = new URL(url);

    if (urlObj.hostname.includes("youtube.com")) {
      const videoId = urlObj.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube-nocookie.com/embed/${videoId}`;
      }

      if (urlObj.pathname.startsWith("/embed/")) {
        return url.replace("youtube.com", "youtube-nocookie.com");
      }
    }

    if (urlObj.hostname.includes("youtu.be")) {
      const videoId = urlObj.pathname.replace("/", "");

      if (videoId) {
        return `https://www.youtube-nocookie.com/embed/${videoId}`;
      }
    }

    return "";
  } catch {
    return "";
  }
}

function esLinkYoutubeValido(url) {
  if (!url) return true;

  return Boolean(obtenerEmbedYoutube(url));
}

function prepararModuloParaFormulario(modulo) {
  return {
    titulo: modulo?.titulo || "",
    descripcion: modulo?.descripcion || "",
    orden: modulo?.orden || 1,
    activo: Boolean(modulo?.activo),
    nivel_minimo_acceso: modulo?.nivel_minimo_acceso || "basico",
  };
}

function prepararClaseParaFormulario(clase) {
  return {
    modulo_id: clase?.modulo_id ? String(clase.modulo_id) : "",
    titulo: clase?.titulo || "",
    descripcion: clase?.descripcion || "",
    video_url: clase?.video_url || "",
    pdf_url: clase?.pdf_url || "",
    contenido: clase?.contenido || "",
    orden: clase?.orden || 1,
    activo: Boolean(clase?.activo),
    nivel_minimo_acceso: clase?.nivel_minimo_acceso || "basico",
  };
}

export default function ContenidoCursoPanel({ slug }) {
  const [curso, setCurso] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoId, setSubiendoId] = useState(null);
  const [aviso, setAviso] = useState("");
  const [error, setError] = useState("");

  const [moduloEditandoId, setModuloEditandoId] = useState(null);
  const [claseEditandoId, setClaseEditandoId] = useState(null);

  const [formModulo, setFormModulo] = useState({
    titulo: "",
    descripcion: "",
    orden: 1,
    activo: true,
    nivel_minimo_acceso: "basico",
  });

  const [formClase, setFormClase] = useState({
    modulo_id: "",
    titulo: "",
    descripcion: "",
    video_url: "",
    pdf_url: "",
    contenido: "",
    orden: 1,
    activo: true,
    nivel_minimo_acceso: "basico",
  });

  const [formEditarModulo, setFormEditarModulo] = useState({
    titulo: "",
    descripcion: "",
    orden: 1,
    activo: true,
    nivel_minimo_acceso: "basico",
  });

  const [formEditarClase, setFormEditarClase] = useState({
    modulo_id: "",
    titulo: "",
    descripcion: "",
    video_url: "",
    pdf_url: "",
    contenido: "",
    orden: 1,
    activo: true,
    nivel_minimo_acceso: "basico",
  });

  const videoPreview = useMemo(() => {
    return obtenerEmbedYoutube(formClase.video_url);
  }, [formClase.video_url]);

  const videoPreviewEdicion = useMemo(() => {
    return obtenerEmbedYoutube(formEditarClase.video_url);
  }, [formEditarClase.video_url]);

  const totalClases = useMemo(() => {
    return modulos.reduce((total, modulo) => {
      return total + (modulo.clases?.length || 0);
    }, 0);
  }, [modulos]);

  async function cargarContenido() {
    setCargando(true);
    setError("");
    setAviso("");

    const respuesta = await fetch(`/api/admin/curso-contenido?slug=${slug}`);
    const data = await respuesta.json();

    if (!respuesta.ok) {
      setError(data.error || "No se pudo cargar el contenido.");
      setCargando(false);
      return;
    }

    setCurso(data.curso);
    setModulos(data.modulos || []);

    if (data.modulos?.length > 0 && !formClase.modulo_id) {
      setFormClase((actual) => ({
        ...actual,
        modulo_id: String(data.modulos[0].id),
      }));
    }

    setCargando(false);
  }

  useEffect(() => {
    cargarContenido();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  function actualizarModulo(campo, valor) {
    setFormModulo({
      ...formModulo,
      [campo]: valor,
    });
  }

  function actualizarClase(campo, valor) {
    setFormClase({
      ...formClase,
      [campo]: valor,
    });
  }

  function actualizarEditarModulo(campo, valor) {
    setFormEditarModulo({
      ...formEditarModulo,
      [campo]: valor,
    });
  }

  function actualizarEditarClase(campo, valor) {
    setFormEditarClase({
      ...formEditarClase,
      [campo]: valor,
    });
  }

  async function crearModulo(event) {
    event.preventDefault();
    setGuardando(true);
    setAviso("");
    setError("");

    const respuesta = await fetch("/api/admin/curso-contenido", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tipo: "modulo",
        modulo: {
          ...formModulo,
          curso_id: curso.id,
        },
      }),
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      setError(data.error || "No se pudo crear el módulo.");
      setGuardando(false);
      return;
    }

    setFormModulo({
      titulo: "",
      descripcion: "",
      orden: modulos.length + 2,
      activo: true,
      nivel_minimo_acceso: "basico",
    });

    setAviso("Módulo creado correctamente.");
    setGuardando(false);
    await cargarContenido();
  }

  async function crearClase(event) {
    event.preventDefault();
    setGuardando(true);
    setAviso("");
    setError("");

    if (!esLinkYoutubeValido(formClase.video_url)) {
      setError(
        "El link de video debe ser de YouTube. Usá un enlace como https://www.youtube.com/watch?v=... o https://youtu.be/..."
      );
      setGuardando(false);
      return;
    }

    const respuesta = await fetch("/api/admin/curso-contenido", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tipo: "clase",
        clase: {
          ...formClase,
          modulo_id: Number(formClase.modulo_id),
        },
      }),
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      setError(data.error || "No se pudo crear la clase.");
      setGuardando(false);
      return;
    }

    setFormClase({
      ...formClase,
      titulo: "",
      descripcion: "",
      video_url: "",
      pdf_url: "",
      contenido: "",
      orden: Number(formClase.orden || 1) + 1,
      activo: true,
    });

    setAviso("Clase creada correctamente.");
    setGuardando(false);
    await cargarContenido();
  }

  function iniciarEdicionModulo(modulo) {
    setModuloEditandoId(modulo.id);
    setClaseEditandoId(null);
    setFormEditarModulo(prepararModuloParaFormulario(modulo));
    setAviso("");
    setError("");
  }

  function cancelarEdicionModulo() {
    setModuloEditandoId(null);
    setFormEditarModulo({
      titulo: "",
      descripcion: "",
      orden: 1,
      activo: true,
      nivel_minimo_acceso: "basico",
    });
  }

  function iniciarEdicionClase(clase) {
    setClaseEditandoId(clase.id);
    setModuloEditandoId(null);
    setFormEditarClase(prepararClaseParaFormulario(clase));
    setAviso("");
    setError("");
  }

  function cancelarEdicionClase() {
    setClaseEditandoId(null);
    setFormEditarClase({
      modulo_id: "",
      titulo: "",
      descripcion: "",
      video_url: "",
      pdf_url: "",
      contenido: "",
      orden: 1,
      activo: true,
      nivel_minimo_acceso: "basico",
    });
  }

  async function guardarModuloEditado(event, moduloId) {
    event.preventDefault();
    setGuardando(true);
    setAviso("");
    setError("");

    const respuesta = await fetch("/api/admin/curso-contenido", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tipo: "modulo",
        id: moduloId,
        modulo: formEditarModulo,
      }),
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      setError(data.error || "No se pudo editar el módulo.");
      setGuardando(false);
      return;
    }

    setAviso("Módulo editado correctamente.");
    setGuardando(false);
    cancelarEdicionModulo();
    await cargarContenido();
  }

  async function guardarClaseEditada(event, claseId) {
    event.preventDefault();
    setGuardando(true);
    setAviso("");
    setError("");

    if (!esLinkYoutubeValido(formEditarClase.video_url)) {
      setError(
        "El link de video debe ser de YouTube. Usá un enlace como https://www.youtube.com/watch?v=... o https://youtu.be/..."
      );
      setGuardando(false);
      return;
    }

    const respuesta = await fetch("/api/admin/curso-contenido", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tipo: "clase",
        id: claseId,
        clase: {
          ...formEditarClase,
          modulo_id: Number(formEditarClase.modulo_id),
        },
      }),
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      setError(data.error || "No se pudo editar la clase.");
      setGuardando(false);
      return;
    }

    setAviso("Clase editada correctamente.");
    setGuardando(false);
    cancelarEdicionClase();
    await cargarContenido();
  }

  async function subirMaterial(clase, archivo) {
    if (!archivo) return;

    setSubiendoId(clase.id);
    setAviso("");
    setError("");

    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("clase_id", String(clase.id));
    formData.append("slug", slug);

    try {
      const respuesta = await fetch("/api/admin/materiales/upload", {
        method: "POST",
        body: formData,
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data.error || "No se pudo subir el material.");
        setSubiendoId(null);
        return;
      }

      setAviso("Material subido y asociado a la clase correctamente.");
      await cargarContenido();
    } catch {
      setError("Error de conexión al subir el material.");
    } finally {
      setSubiendoId(null);
    }
  }

  async function cambiarEstadoModulo(modulo) {
    setGuardando(true);
    setError("");
    setAviso("");

    const respuesta = await fetch("/api/admin/curso-contenido", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tipo: "modulo",
        id: modulo.id,
        modulo: {
          ...modulo,
          activo: !modulo.activo,
        },
      }),
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      setError(data.error || "No se pudo actualizar el módulo.");
      setGuardando(false);
      return;
    }

    setAviso("Módulo actualizado.");
    setGuardando(false);
    await cargarContenido();
  }

  async function cambiarEstadoClase(clase) {
    setGuardando(true);
    setError("");
    setAviso("");

    const respuesta = await fetch("/api/admin/curso-contenido", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tipo: "clase",
        id: clase.id,
        clase: {
          ...clase,
          activo: !clase.activo,
        },
      }),
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      setError(data.error || "No se pudo actualizar la clase.");
      setGuardando(false);
      return;
    }

    setAviso("Clase actualizada.");
    setGuardando(false);
    await cargarContenido();
  }

  async function eliminarModulo(modulo) {
    const confirmar = window.confirm(
      `¿Eliminar el módulo "${modulo.titulo}"? También se eliminarán sus clases.`
    );

    if (!confirmar) return;

    setGuardando(true);
    setError("");
    setAviso("");

    const respuesta = await fetch("/api/admin/curso-contenido", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tipo: "modulo",
        id: modulo.id,
      }),
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      setError(data.error || "No se pudo eliminar el módulo.");
      setGuardando(false);
      return;
    }

    setAviso("Módulo eliminado.");
    setGuardando(false);
    await cargarContenido();
  }

  async function eliminarClase(clase) {
    const confirmar = window.confirm(`¿Eliminar la clase "${clase.titulo}"?`);

    if (!confirmar) return;

    setGuardando(true);
    setError("");
    setAviso("");

    const respuesta = await fetch("/api/admin/curso-contenido", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tipo: "clase",
        id: clase.id,
      }),
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      setError(data.error || "No se pudo eliminar la clase.");
      setGuardando(false);
      return;
    }

    setAviso("Clase eliminada.");
    setGuardando(false);
    await cargarContenido();
  }

  if (cargando) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white">
        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            Cargando contenido del curso...
          </div>
        </section>
      </main>
    );
  }

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
                SERVICAN ADMIN
              </p>

              <h1 className="text-3xl font-bold">Contenido del curso</h1>

              <p className="mt-1 text-sm text-neutral-300">{curso?.titulo}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Volver al admin
            </Link>

            <Link
              href={`/panel/cursos/${slug}`}
              className="rounded-2xl bg-yellow-500 px-5 py-3 text-center text-sm font-bold text-neutral-950 transition hover:bg-yellow-400"
            >
              Ver aula
            </Link>
          </div>
        </header>

        {(aviso || error) && (
          <div
            className={`mb-6 rounded-2xl border p-4 text-sm font-bold ${
              error
                ? "border-red-500/30 bg-red-500/10 text-red-200"
                : "border-yellow-500/30 bg-yellow-500/10 text-yellow-200"
            }`}
          >
            {error || aviso}
          </div>
        )}

        <section className="mb-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
              Curso
            </p>
            <h2 className="mt-3 text-2xl font-bold">{curso?.titulo}</h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
              Módulos
            </p>
            <h2 className="mt-3 text-2xl font-bold">{modulos.length}</h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
              Clases
            </p>
            <h2 className="mt-3 text-2xl font-bold">{totalClases}</h2>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-8">
            <form
              onSubmit={crearModulo}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                Nuevo módulo
              </p>

              <h2 className="mt-3 text-2xl font-bold">Crear módulo</h2>

              <div className="mt-6 space-y-4">
                <input
                  type="text"
                  required
                  value={formModulo.titulo}
                  onChange={(event) =>
                    actualizarModulo("titulo", event.target.value)
                  }
                  placeholder="Título del módulo"
                  className="w-full rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 outline-none focus:border-yellow-500"
                />

                <textarea
                  value={formModulo.descripcion}
                  onChange={(event) =>
                    actualizarModulo("descripcion", event.target.value)
                  }
                  placeholder="Descripción del módulo"
                  rows="3"
                  className="w-full resize-none rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 outline-none focus:border-yellow-500"
                />

                <select
                  value={formModulo.nivel_minimo_acceso}
                  onChange={(event) =>
                    actualizarModulo("nivel_minimo_acceso", event.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 outline-none focus:border-yellow-500"
                >
                  {NIVELES_ACCESO.map((nivel) => (
                    <option key={nivel.value} value={nivel.value}>
                      Plan mínimo: {nivel.label}
                    </option>
                  ))}
                </select>

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="number"
                    min="1"
                    value={formModulo.orden}
                    onChange={(event) =>
                      actualizarModulo("orden", event.target.value)
                    }
                    className="w-full rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 outline-none focus:border-yellow-500"
                  />

                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={formModulo.activo}
                      onChange={(event) =>
                        actualizarModulo("activo", event.target.checked)
                      }
                    />
                    Activo
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={guardando}
                  className="w-full rounded-2xl bg-yellow-500 px-5 py-3 font-bold text-neutral-950 transition hover:bg-yellow-400 disabled:opacity-60"
                >
                  Crear módulo
                </button>
              </div>
            </form>

            <form
              onSubmit={crearClase}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                Nueva clase
              </p>

              <h2 className="mt-3 text-2xl font-bold">Crear clase</h2>

              <div className="mt-6 space-y-4">
                <select
                  required
                  value={formClase.modulo_id}
                  onChange={(event) =>
                    actualizarClase("modulo_id", event.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 outline-none focus:border-yellow-500"
                >
                  <option value="">Seleccionar módulo</option>
                  {modulos.map((modulo) => (
                    <option key={modulo.id} value={modulo.id}>
                      {modulo.titulo}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  required
                  value={formClase.titulo}
                  onChange={(event) =>
                    actualizarClase("titulo", event.target.value)
                  }
                  placeholder="Título de la clase"
                  className="w-full rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 outline-none focus:border-yellow-500"
                />

                <textarea
                  value={formClase.descripcion}
                  onChange={(event) =>
                    actualizarClase("descripcion", event.target.value)
                  }
                  placeholder="Descripción de la clase"
                  rows="3"
                  className="w-full resize-none rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 outline-none focus:border-yellow-500"
                />

                <select
                  value={formClase.nivel_minimo_acceso}
                  onChange={(event) =>
                    actualizarClase("nivel_minimo_acceso", event.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 outline-none focus:border-yellow-500"
                >
                  {NIVELES_ACCESO.map((nivel) => (
                    <option key={nivel.value} value={nivel.value}>
                      Plan mínimo: {nivel.label}
                    </option>
                  ))}
                </select>

                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.25em] text-blue-200">
                    Video de YouTube no listado
                  </label>

                  <input
                    type="url"
                    value={formClase.video_url}
                    onChange={(event) =>
                      actualizarClase("video_url", event.target.value)
                    }
                    placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/..."
                    className="w-full rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 outline-none focus:border-blue-400"
                  />

                  <p className="mt-3 text-xs leading-5 text-blue-100">
                    Subí los videos pesados a YouTube como “No listado” y pegá
                    acá el enlace. No subas videos a Supabase ni a Vercel.
                  </p>

                  {formClase.video_url && !videoPreview && (
                    <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-bold text-red-200">
                      Ese enlace no parece ser un video válido de YouTube.
                    </p>
                  )}

                  {videoPreview && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black">
                      <iframe
                        src={videoPreview}
                        title="Vista previa del video"
                        className="aspect-video w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  value={formClase.pdf_url}
                  onChange={(event) =>
                    actualizarClase("pdf_url", event.target.value)
                  }
                  placeholder="Link externo o ruta del material"
                  className="w-full rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 outline-none focus:border-yellow-500"
                />

                <p className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-xs leading-5 text-yellow-100">
                  Para subir materiales desde tu computadora, primero creá la
                  clase. Después, en la lista de clases, usá el botón “Subir
                  material”. Permitido: PDF, imágenes, Word o Excel. Los videos
                  van por YouTube no listado.
                </p>

                <textarea
                  value={formClase.contenido}
                  onChange={(event) =>
                    actualizarClase("contenido", event.target.value)
                  }
                  placeholder="Contenido escrito de la clase"
                  rows="6"
                  className="w-full resize-none rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 outline-none focus:border-yellow-500"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="number"
                    min="1"
                    value={formClase.orden}
                    onChange={(event) =>
                      actualizarClase("orden", event.target.value)
                    }
                    className="w-full rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 outline-none focus:border-yellow-500"
                  />

                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={formClase.activo}
                      onChange={(event) =>
                        actualizarClase("activo", event.target.checked)
                      }
                    />
                    Activa
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={guardando || modulos.length === 0}
                  className="w-full rounded-2xl bg-yellow-500 px-5 py-3 font-bold text-neutral-950 transition hover:bg-yellow-400 disabled:opacity-60"
                >
                  Crear clase
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
              Contenido actual
            </p>

            <h2 className="mt-3 text-2xl font-bold">Módulos y clases</h2>

            <div className="mt-6 space-y-5">
              {modulos.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-neutral-950 p-5 text-neutral-400">
                  Este curso todavía no tiene módulos.
                </div>
              )}

              {modulos.map((modulo) => (
                <article
                  key={modulo.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-neutral-950"
                >
                  <div className="border-b border-white/10 p-5">
                    {moduloEditandoId === modulo.id ? (
                      <form
                        onSubmit={(event) =>
                          guardarModuloEditado(event, modulo.id)
                        }
                        className="space-y-4"
                      >
                        <p className="text-sm font-bold uppercase tracking-[0.25em] text-yellow-400">
                          Editando módulo
                        </p>

                        <input
                          type="text"
                          required
                          value={formEditarModulo.titulo}
                          onChange={(event) =>
                            actualizarEditarModulo(
                              "titulo",
                              event.target.value
                            )
                          }
                          className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-yellow-500"
                        />

                        <textarea
                          value={formEditarModulo.descripcion}
                          onChange={(event) =>
                            actualizarEditarModulo(
                              "descripcion",
                              event.target.value
                            )
                          }
                          rows="3"
                          className="w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-yellow-500"
                        />

                        <select
                          value={formEditarModulo.nivel_minimo_acceso}
                          onChange={(event) =>
                            actualizarEditarModulo(
                              "nivel_minimo_acceso",
                              event.target.value
                            )
                          }
                          className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-yellow-500"
                        >
                          {NIVELES_ACCESO.map((nivel) => (
                            <option key={nivel.value} value={nivel.value}>
                              Plan mínimo: {nivel.label}
                            </option>
                          ))}
                        </select>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <input
                            type="number"
                            min="1"
                            value={formEditarModulo.orden}
                            onChange={(event) =>
                              actualizarEditarModulo(
                                "orden",
                                event.target.value
                              )
                            }
                            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-yellow-500"
                          />

                          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black px-4 py-3">
                            <input
                              type="checkbox"
                              checked={formEditarModulo.activo}
                              onChange={(event) =>
                                actualizarEditarModulo(
                                  "activo",
                                  event.target.checked
                                )
                              }
                            />
                            Activo
                          </label>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="submit"
                            disabled={guardando}
                            className="rounded-xl bg-yellow-500 px-4 py-2 text-xs font-bold text-black transition hover:bg-yellow-400 disabled:opacity-60"
                          >
                            Guardar módulo
                          </button>

                          <button
                            type="button"
                            onClick={cancelarEdicionModulo}
                            disabled={guardando}
                            className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold transition hover:bg-white/20"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="mb-2 flex flex-wrap gap-2">
                            <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-yellow-300">
                              Módulo {modulo.orden}
                            </span>

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                                modulo.activo
                                  ? "border-green-500/30 bg-green-500/10 text-green-300"
                                  : "border-red-500/30 bg-red-500/10 text-red-300"
                              }`}
                            >
                              {estadoTexto(modulo.activo)}
                            </span>

                            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-300">
                              Plan {nombreNivel(modulo.nivel_minimo_acceso)}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold">
                            {modulo.titulo}
                          </h3>

                          {modulo.descripcion && (
                            <p className="mt-2 text-sm leading-6 text-neutral-400">
                              {modulo.descripcion}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => iniciarEdicionModulo(modulo)}
                            disabled={guardando}
                            className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-200 transition hover:bg-blue-500/20"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => cambiarEstadoModulo(modulo)}
                            disabled={guardando}
                            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold transition hover:bg-white/20"
                          >
                            {modulo.activo ? "Desactivar" : "Activar"}
                          </button>

                          <button
                            type="button"
                            onClick={() => eliminarModulo(modulo)}
                            disabled={guardando}
                            className="rounded-xl bg-red-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-400"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="divide-y divide-white/10">
                    {modulo.clases?.length === 0 && (
                      <div className="p-5 text-sm text-neutral-500">
                        Este módulo todavía no tiene clases.
                      </div>
                    )}

                    {modulo.clases?.map((clase) => {
                      const videoEmbed = obtenerEmbedYoutube(clase.video_url);

                      return (
                        <div key={clase.id} className="p-5">
                          {claseEditandoId === clase.id ? (
                            <form
                              onSubmit={(event) =>
                                guardarClaseEditada(event, clase.id)
                              }
                              className="space-y-4"
                            >
                              <p className="text-sm font-bold uppercase tracking-[0.25em] text-yellow-400">
                                Editando clase
                              </p>

                              <select
                                required
                                value={formEditarClase.modulo_id}
                                onChange={(event) =>
                                  actualizarEditarClase(
                                    "modulo_id",
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-yellow-500"
                              >
                                {modulos.map((moduloOpcion) => (
                                  <option
                                    key={moduloOpcion.id}
                                    value={moduloOpcion.id}
                                  >
                                    {moduloOpcion.titulo}
                                  </option>
                                ))}
                              </select>

                              <input
                                type="text"
                                required
                                value={formEditarClase.titulo}
                                onChange={(event) =>
                                  actualizarEditarClase(
                                    "titulo",
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-yellow-500"
                              />

                              <textarea
                                value={formEditarClase.descripcion}
                                onChange={(event) =>
                                  actualizarEditarClase(
                                    "descripcion",
                                    event.target.value
                                  )
                                }
                                rows="3"
                                className="w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-yellow-500"
                              />

                              <select
                                value={formEditarClase.nivel_minimo_acceso}
                                onChange={(event) =>
                                  actualizarEditarClase(
                                    "nivel_minimo_acceso",
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-yellow-500"
                              >
                                {NIVELES_ACCESO.map((nivel) => (
                                  <option key={nivel.value} value={nivel.value}>
                                    Plan mínimo: {nivel.label}
                                  </option>
                                ))}
                              </select>

                              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                                <label className="mb-2 block text-xs font-black uppercase tracking-[0.25em] text-blue-200">
                                  Video de YouTube no listado
                                </label>

                                <input
                                  type="url"
                                  value={formEditarClase.video_url}
                                  onChange={(event) =>
                                    actualizarEditarClase(
                                      "video_url",
                                      event.target.value
                                    )
                                  }
                                  placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/..."
                                  className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-blue-400"
                                />

                                {formEditarClase.video_url &&
                                  !videoPreviewEdicion && (
                                    <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-bold text-red-200">
                                      Ese enlace no parece ser un video válido
                                      de YouTube.
                                    </p>
                                  )}

                                {videoPreviewEdicion && (
                                  <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black">
                                    <iframe
                                      src={videoPreviewEdicion}
                                      title="Vista previa del video"
                                      className="aspect-video w-full"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                      allowFullScreen
                                    />
                                  </div>
                                )}
                              </div>

                              <input
                                type="text"
                                value={formEditarClase.pdf_url}
                                onChange={(event) =>
                                  actualizarEditarClase(
                                    "pdf_url",
                                    event.target.value
                                  )
                                }
                                placeholder="Link externo o ruta del material"
                                className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-yellow-500"
                              />

                              <textarea
                                value={formEditarClase.contenido}
                                onChange={(event) =>
                                  actualizarEditarClase(
                                    "contenido",
                                    event.target.value
                                  )
                                }
                                placeholder="Contenido escrito de la clase"
                                rows="6"
                                className="w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-yellow-500"
                              />

                              <div className="grid gap-4 sm:grid-cols-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={formEditarClase.orden}
                                  onChange={(event) =>
                                    actualizarEditarClase(
                                      "orden",
                                      event.target.value
                                    )
                                  }
                                  className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-yellow-500"
                                />

                                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black px-4 py-3">
                                  <input
                                    type="checkbox"
                                    checked={formEditarClase.activo}
                                    onChange={(event) =>
                                      actualizarEditarClase(
                                        "activo",
                                        event.target.checked
                                      )
                                    }
                                  />
                                  Activa
                                </label>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="submit"
                                  disabled={guardando}
                                  className="rounded-xl bg-yellow-500 px-4 py-2 text-xs font-bold text-black transition hover:bg-yellow-400 disabled:opacity-60"
                                >
                                  Guardar clase
                                </button>

                                <button
                                  type="button"
                                  onClick={cancelarEdicionClase}
                                  disabled={guardando}
                                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold transition hover:bg-white/20"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                              <div className="flex-1">
                                <div className="mb-2 flex flex-wrap gap-2">
                                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-neutral-300">
                                    Clase {clase.orden}
                                  </span>

                                  <span
                                    className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                                      clase.activo
                                        ? "border-green-500/30 bg-green-500/10 text-green-300"
                                        : "border-red-500/30 bg-red-500/10 text-red-300"
                                    }`}
                                  >
                                    {estadoTexto(clase.activo)}
                                  </span>

                                  <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-300">
                                    Plan{" "}
                                    {nombreNivel(clase.nivel_minimo_acceso)}
                                  </span>
                                </div>

                                <h4 className="text-lg font-bold">
                                  {clase.titulo}
                                </h4>

                                {clase.descripcion && (
                                  <p className="mt-2 text-sm leading-6 text-neutral-400">
                                    {clase.descripcion}
                                  </p>
                                )}

                                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                  {clase.video_url && (
                                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-300">
                                      Video YouTube
                                    </span>
                                  )}

                                  {clase.pdf_url && (
                                    <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-yellow-300">
                                      Material
                                    </span>
                                  )}

                                  {clase.contenido && (
                                    <span className="rounded-full bg-green-500/10 px-3 py-1 text-green-300">
                                      Texto
                                    </span>
                                  )}
                                </div>

                                {clase.video_url && (
                                  <p className="mt-3 break-words rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-100">
                                    Video: {clase.video_url}
                                  </p>
                                )}

                                {videoEmbed && (
                                  <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black">
                                    <iframe
                                      src={videoEmbed}
                                      title={clase.titulo}
                                      className="aspect-video w-full"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                      allowFullScreen
                                    />
                                  </div>
                                )}

                                {clase.pdf_url && (
                                  <p className="mt-3 break-words rounded-2xl border border-white/10 bg-black/40 p-3 text-xs text-neutral-400">
                                    Material: {clase.pdf_url}
                                  </p>
                                )}

                                <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4">
                                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-neutral-400">
                                    Subir material para esta clase
                                  </label>

                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
                                    disabled={subiendoId === clase.id}
                                    onChange={(event) => {
                                      const archivo = event.target.files?.[0];
                                      subirMaterial(clase, archivo);
                                      event.target.value = "";
                                    }}
                                    className="w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-xs text-neutral-300"
                                  />

                                  <p className="mt-2 text-xs leading-5 text-neutral-500">
                                    Permitido: PDF, imagen, Word o Excel.
                                    Máximo 25 MB. Los videos pesados van en
                                    YouTube como no listados.
                                  </p>

                                  {subiendoId === clase.id && (
                                    <p className="mt-2 text-xs font-bold text-yellow-300">
                                      Subiendo material...
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {clase.pdf_url && (
                                  <a
                                    href={`/api/panel/materiales?clase_id=${clase.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs font-bold text-yellow-200 transition hover:bg-yellow-500/20"
                                  >
                                    Abrir material
                                  </a>
                                )}

                                <button
                                  type="button"
                                  onClick={() => iniciarEdicionClase(clase)}
                                  disabled={guardando}
                                  className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-200 transition hover:bg-blue-500/20"
                                >
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  onClick={() => cambiarEstadoClase(clase)}
                                  disabled={guardando}
                                  className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold transition hover:bg-white/20"
                                >
                                  {clase.activo ? "Desactivar" : "Activar"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => eliminarClase(clase)}
                                  disabled={guardando}
                                  className="rounded-xl bg-red-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-400"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}