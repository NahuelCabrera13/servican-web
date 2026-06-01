"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ESTADOS = [
  "pendiente",
  "contactado",
  "interesado",
  "pagó",
  "rechazado",
];

const CURSO_INICIAL = {
  titulo: "",
  slug: "",
  descripcion: "",
  categoria: "",
  precio: "",
  duracion: "",
  modalidad: "",
  imagen_url: "",
  activo: true,
  destacado: false,
};

const PRODUCTO_INICIAL = {
  id: null,
  nombre: "",
  slug: "",
  descripcion: "",
  tipo_producto: "curso_plan",
  plan: "basico",
  curso_id: "",
  curso_ids: [],
  precio: 0,
  moneda: "UYU",
  cantidad_maxima_usuarios: 1,
  requiere_participantes: false,
  requiere_correos_registrados: true,
  es_recurrente: false,
  activo: false,
  visible_en_web: false,
  destacado: false,
  orden: 0,
  texto_boton: "Comprar",
};

const TIPOS_PRODUCTO = [
  { value: "curso_plan", label: "Plan de curso" },
  { value: "paquete", label: "Paquete" },
  { value: "membresia", label: "Membresía" },
  { value: "producto", label: "Producto general" },
];

const PLANES = [
  { value: "basico", label: "Básico" },
  { value: "extenso", label: "Extenso" },
  { value: "pro", label: "Pro" },
  { value: "plantel", label: "Plantel" },
];

export default function AdminPanel({ usuario, perfil }) {
  const [tabActiva, setTabActiva] = useState("resumen");

  const [inscripciones, setInscripciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [cursos, setCursos] = useState([]);
  const [formCurso, setFormCurso] = useState(CURSO_INICIAL);
  const [cursoEditandoId, setCursoEditandoId] = useState(null);
  const [busquedaCursos, setBusquedaCursos] = useState("");

  const [productos, setProductos] = useState([]);
  const [formProducto, setFormProducto] = useState(PRODUCTO_INICIAL);
  const [productoEditandoId, setProductoEditandoId] = useState(null);
  const [busquedaProductos, setBusquedaProductos] = useState("");
  const [filtroTipoProducto, setFiltroTipoProducto] = useState("todos");

  const [cargando, setCargando] = useState(true);
  const [accionandoId, setAccionandoId] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    actualizarTodo();
  }, []);

  async function obtenerTokenAdmin() {
    const supabase = createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token || "";
  }

  async function fetchAdmin(url, opciones = {}) {
    const token = await obtenerTokenAdmin();

    return fetch(url, {
      ...opciones,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(opciones.headers || {}),
      },
    });
  }

  async function actualizarTodo() {
    setCargando(true);
    setError("");
    setMensaje("");

    await cargarInscripciones();
    await cargarCursos();
    await cargarProductos();

    setCargando(false);
  }

  async function cargarInscripciones() {
    try {
      const respuesta = await fetch("/api/admin/inscripciones", {
        method: "GET",
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setInscripciones([]);
        setError(data?.error || "No se pudieron cargar las consultas.");
        return false;
      }

      setInscripciones(data.inscripciones || []);
      return true;
    } catch (error) {
      setError("Error de conexión al cargar consultas.");
      setInscripciones([]);
      return false;
    }
  }

  async function cargarCursos() {
    try {
      const respuesta = await fetch("/api/admin/cursos", {
        method: "GET",
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setCursos([]);
        setError(data?.error || "No se pudieron cargar los cursos.");
        return false;
      }

      setCursos(data.cursos || []);
      return true;
    } catch (error) {
      setError("Error de conexión al cargar cursos.");
      setCursos([]);
      return false;
    }
  }

  async function cargarProductos() {
    try {
      const respuesta = await fetchAdmin("/api/admin/productos", {
        method: "GET",
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setProductos([]);
        setError(data?.error || "No se pudieron cargar los productos.");
        return false;
      }

      setProductos(data.productos || []);
      return true;
    } catch (error) {
      setError("Error de conexión al cargar productos.");
      setProductos([]);
      return false;
    }
  }

  async function cambiarEstado(id, nuevoEstado) {
    setAccionandoId(id);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetch("/api/admin/inscripciones", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          estado: nuevoEstado,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo cambiar el estado.");
        return;
      }

      setInscripciones((actuales) =>
        actuales.map((inscripcion) =>
          inscripcion.id === id
            ? { ...inscripcion, estado: nuevoEstado }
            : inscripcion
        )
      );

      setMensaje("Estado actualizado correctamente.");
    } catch (error) {
      setError("Error de conexión al cambiar el estado.");
    } finally {
      setAccionandoId(null);
    }
  }

  async function eliminarInscripcion(id) {
    const confirmar = window.confirm(
      "¿Seguro que querés eliminar esta consulta? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    setAccionandoId(id);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetch("/api/admin/inscripciones", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo eliminar la consulta.");
        return;
      }

      setInscripciones((actuales) =>
        actuales.filter((inscripcion) => inscripcion.id !== id)
      );

      setMensaje("Consulta eliminada correctamente.");
    } catch (error) {
      setError("Error de conexión al eliminar la consulta.");
    } finally {
      setAccionandoId(null);
    }
  }

  function limpiarSlug(texto) {
    return String(texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ñ/g, "n")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function actualizarCampoCurso(campo, valor) {
    setFormCurso((actual) => {
      const actualizado = {
        ...actual,
        [campo]: valor,
      };

      if (campo === "titulo" && !cursoEditandoId) {
        actualizado.slug = limpiarSlug(valor);
      }

      return actualizado;
    });
  }

  function resetearFormularioCurso() {
    setFormCurso(CURSO_INICIAL);
    setCursoEditandoId(null);
  }

  function editarCurso(curso) {
    setCursoEditandoId(curso.id);
    setTabActiva("cursos");

    setFormCurso({
      titulo: curso.titulo || "",
      slug: curso.slug || "",
      descripcion: curso.descripcion || "",
      categoria: curso.categoria || "",
      precio: curso.precio || "",
      duracion: curso.duracion || "",
      modalidad: curso.modalidad || "",
      imagen_url: curso.imagen_url || "",
      activo: Boolean(curso.activo),
      destacado: Boolean(curso.destacado),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function guardarCurso(event) {
    event.preventDefault();

    setCargando(true);
    setError("");
    setMensaje("");

    const metodo = cursoEditandoId ? "PATCH" : "POST";
    const cuerpo = cursoEditandoId
      ? { id: cursoEditandoId, ...formCurso }
      : formCurso;

    try {
      const respuesta = await fetch("/api/admin/cursos", {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cuerpo),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo guardar el curso.");
        return;
      }

      setMensaje(
        cursoEditandoId
          ? "Curso actualizado correctamente."
          : "Curso creado correctamente."
      );

      resetearFormularioCurso();
      await cargarCursos();
    } catch (error) {
      setError("Error de conexión al guardar el curso.");
    } finally {
      setCargando(false);
    }
  }

  async function eliminarCurso(id) {
    const confirmar = window.confirm(
      "¿Seguro que querés eliminar este curso? Esta acción puede afectar productos, accesos y contenido relacionado."
    );

    if (!confirmar) return;

    setAccionandoId(id);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetch("/api/admin/cursos", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo eliminar el curso.");
        return;
      }

      setCursos((actuales) => actuales.filter((curso) => curso.id !== id));
      setMensaje("Curso eliminado correctamente.");
    } catch (error) {
      setError("Error de conexión al eliminar el curso.");
    } finally {
      setAccionandoId(null);
    }
  }

  async function generarPlanes(curso) {
    const confirmar = window.confirm(
      `¿Querés generar planes Básico, Extenso, Pro y Plantel para "${curso.titulo}"? Si ya existen, se actualizarán sin borrar precios ni activaciones importantes.`
    );

    if (!confirmar) return;

    setAccionandoId(`planes-${curso.id}`);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetchAdmin(
        `/api/admin/cursos/${curso.id}/generar-planes`,
        {
          method: "POST",
        }
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudieron generar los planes.");
        return;
      }

      setMensaje(`Planes generados para: ${curso.titulo}`);
      await cargarProductos();
      setTabActiva("productos");
    } catch (error) {
      setError("Error de conexión al generar planes.");
    } finally {
      setAccionandoId(null);
    }
  }

  function actualizarCampoProducto(campo, valor) {
    setFormProducto((actual) => {
      const actualizado = {
        ...actual,
        [campo]: valor,
      };

      if (campo === "nombre" && !productoEditandoId) {
        actualizado.slug = limpiarSlug(valor);
      }

      if (campo === "tipo_producto") {
        if (valor === "paquete") {
          actualizado.curso_id = "";
          actualizado.plan = "plantel";
          actualizado.cantidad_maxima_usuarios = 4;
          actualizado.requiere_participantes = true;
          actualizado.requiere_correos_registrados = true;
          actualizado.texto_boton = "Comprar paquete";
        }

        if (valor === "curso_plan") {
          actualizado.curso_ids = [];
          actualizado.texto_boton = "Comprar";
        }

        if (valor === "membresia") {
          actualizado.plan = "mensual";
          actualizado.es_recurrente = true;
          actualizado.cantidad_maxima_usuarios = 1;
          actualizado.requiere_participantes = false;
          actualizado.texto_boton = "Suscribirme";
        }
      }

      if (campo === "plan") {
        if (valor === "plantel") {
          actualizado.cantidad_maxima_usuarios = 4;
          actualizado.requiere_participantes = true;
          actualizado.requiere_correos_registrados = true;
        }

        if (valor !== "plantel" && actualizado.tipo_producto === "curso_plan") {
          actualizado.cantidad_maxima_usuarios = 1;
          actualizado.requiere_participantes = false;
        }
      }

      return actualizado;
    });
  }

  function alternarCursoProducto(cursoId) {
    setFormProducto((actual) => {
      const existe = actual.curso_ids.includes(cursoId);

      return {
        ...actual,
        curso_ids: existe
          ? actual.curso_ids.filter((id) => id !== cursoId)
          : [...actual.curso_ids, cursoId],
      };
    });
  }

  function resetearFormularioProducto() {
    setProductoEditandoId(null);
    setFormProducto(PRODUCTO_INICIAL);
  }

  function editarProducto(producto) {
    setProductoEditandoId(producto.id);
    setTabActiva("productos");

    const cursosAsociados = Array.isArray(producto.producto_cursos)
      ? producto.producto_cursos.map((item) => item.curso_id)
      : [];

    setFormProducto({
      id: producto.id,
      nombre: producto.nombre || "",
      slug: producto.slug || "",
      descripcion: producto.descripcion || "",
      tipo_producto: producto.tipo_producto || "curso_plan",
      plan: producto.plan || "basico",
      curso_id: producto.curso_id || "",
      curso_ids: cursosAsociados,
      precio: producto.precio || 0,
      moneda: producto.moneda || "UYU",
      cantidad_maxima_usuarios: producto.cantidad_maxima_usuarios || 1,
      requiere_participantes: Boolean(producto.requiere_participantes),
      requiere_correos_registrados:
        producto.requiere_correos_registrados === undefined
          ? true
          : Boolean(producto.requiere_correos_registrados),
      es_recurrente: Boolean(producto.es_recurrente),
      activo: Boolean(producto.activo),
      visible_en_web: Boolean(producto.visible_en_web),
      destacado: Boolean(producto.destacado),
      orden: producto.orden || 0,
      texto_boton: producto.texto_boton || "Comprar",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function guardarProducto(event) {
    event.preventDefault();

    setCargando(true);
    setError("");
    setMensaje("");

    const cursoIds =
      formProducto.tipo_producto === "paquete"
        ? formProducto.curso_ids
        : formProducto.curso_id
          ? [Number(formProducto.curso_id)]
          : [];

    const cuerpo = {
      id: productoEditandoId,
      nombre: formProducto.nombre,
      slug: formProducto.slug,
      descripcion: formProducto.descripcion,
      tipo_producto: formProducto.tipo_producto,
      plan: formProducto.plan,
      curso_id:
        formProducto.tipo_producto === "curso_plan" && formProducto.curso_id
          ? Number(formProducto.curso_id)
          : null,
      curso_ids: cursoIds,
      precio: Number(formProducto.precio || 0),
      moneda: formProducto.moneda || "UYU",
      cantidad_maxima_usuarios: Number(
        formProducto.cantidad_maxima_usuarios || 1
      ),
      requiere_participantes: Boolean(formProducto.requiere_participantes),
      requiere_correos_registrados: Boolean(
        formProducto.requiere_correos_registrados
      ),
      es_recurrente: Boolean(formProducto.es_recurrente),
      activo: Boolean(formProducto.activo),
      visible_en_web: Boolean(formProducto.visible_en_web),
      destacado: Boolean(formProducto.destacado),
      orden: Number(formProducto.orden || 0),
      texto_boton: formProducto.texto_boton || "Comprar",
      nivel_acceso: formProducto.plan || "basico",
      beneficios_pro:
        formProducto.plan === "pro" || formProducto.plan === "plantel",
    };

    const metodo = productoEditandoId ? "PATCH" : "POST";

    try {
      const respuesta = await fetchAdmin("/api/admin/productos", {
        method: metodo,
        body: JSON.stringify(cuerpo),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo guardar el producto.");
        return;
      }

      setMensaje(
        productoEditandoId
          ? "Producto actualizado correctamente."
          : "Producto creado correctamente."
      );

      resetearFormularioProducto();
      await cargarProductos();
    } catch (error) {
      setError("Error de conexión al guardar producto.");
    } finally {
      setCargando(false);
    }
  }

  async function eliminarProducto(id) {
    const confirmar = window.confirm(
      "¿Seguro que querés eliminar este producto? Si ya tuvo pagos asociados, conviene desactivarlo en vez de borrarlo."
    );

    if (!confirmar) return;

    setAccionandoId(id);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetchAdmin("/api/admin/productos", {
        method: "DELETE",
        body: JSON.stringify({
          id,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo eliminar el producto.");
        return;
      }

      setProductos((actuales) =>
        actuales.filter((producto) => producto.id !== id)
      );

      setMensaje("Producto eliminado correctamente.");
    } catch (error) {
      setError("Error de conexión al eliminar producto.");
    } finally {
      setAccionandoId(null);
    }
  }

  async function cambiarEstadoProducto(producto, campo, valor) {
    setAccionandoId(producto.id);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetchAdmin("/api/admin/productos", {
        method: "PATCH",
        body: JSON.stringify({
          id: producto.id,
          [campo]: valor,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo actualizar el producto.");
        return;
      }

      setProductos((actuales) =>
        actuales.map((item) =>
          item.id === producto.id ? { ...item, [campo]: valor } : item
        )
      );

      setMensaje("Producto actualizado correctamente.");
    } catch (error) {
      setError("Error de conexión al actualizar producto.");
    } finally {
      setAccionandoId(null);
    }
  }

  function formatearValor(valor) {
    if (valor === null || valor === undefined || valor === "") {
      return "—";
    }

    if (typeof valor === "boolean") {
      return valor ? "Sí" : "No";
    }

    if (
      typeof valor === "string" &&
      valor.includes("T") &&
      !Number.isNaN(Date.parse(valor))
    ) {
      return new Date(valor).toLocaleString("es-UY", {
        dateStyle: "short",
        timeStyle: "short",
      });
    }

    return String(valor);
  }

  function formatearPrecio(producto) {
    const precio = Number(producto.precio || 0);

    if (!precio) return "Sin precio";

    return `${producto.moneda || "UYU"} ${precio.toLocaleString("es-UY")}`;
  }

  function claseEstado(estado) {
    if (estado === "pagó") {
      return "border-green-500/30 bg-green-500/10 text-green-200";
    }

    if (estado === "contactado") {
      return "border-blue-500/30 bg-blue-500/10 text-blue-200";
    }

    if (estado === "interesado") {
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-200";
    }

    if (estado === "rechazado") {
      return "border-red-500/30 bg-red-500/10 text-red-200";
    }

    return "border-white/10 bg-white/10 text-neutral-200";
  }

  const inscripcionesFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return inscripciones.filter((inscripcion) => {
      const coincideTexto = !texto
        ? true
        : Object.values(inscripcion).some((valor) =>
            String(valor || "").toLowerCase().includes(texto)
          );

      const coincideEstado =
        filtroEstado === "todos"
          ? true
          : (inscripcion.estado || "pendiente") === filtroEstado;

      return coincideTexto && coincideEstado;
    });
  }, [busqueda, filtroEstado, inscripciones]);

  const resumenEstados = useMemo(() => {
    return ESTADOS.reduce((acc, estado) => {
      acc[estado] = inscripciones.filter(
        (inscripcion) => (inscripcion.estado || "pendiente") === estado
      ).length;

      return acc;
    }, {});
  }, [inscripciones]);

  const cursosFiltrados = useMemo(() => {
    const texto = busquedaCursos.toLowerCase().trim();

    if (!texto) return cursos;

    return cursos.filter((curso) =>
      Object.values(curso).some((valor) =>
        String(valor || "").toLowerCase().includes(texto)
      )
    );
  }, [busquedaCursos, cursos]);

  const productosFiltrados = useMemo(() => {
    const texto = busquedaProductos.toLowerCase().trim();

    return productos.filter((producto) => {
      const coincideTexto = !texto
        ? true
        : Object.values(producto).some((valor) =>
            String(valor || "").toLowerCase().includes(texto)
          );

      const coincideTipo =
        filtroTipoProducto === "todos"
          ? true
          : producto.tipo_producto === filtroTipoProducto;

      return coincideTexto && coincideTipo;
    });
  }, [productos, busquedaProductos, filtroTipoProducto]);

  const productosActivos = productos.filter(
    (producto) => producto.activo && producto.visible_en_web
  );

  const productosSinPrecio = productos.filter(
    (producto) => Number(producto.precio || 0) <= 0
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
                Panel administrador
              </p>

              <h1 className="text-3xl font-bold">SERVICAN</h1>

              <p className="mt-1 text-sm text-neutral-400">
                {usuario?.email || "Administrador"} · Rol:{" "}
                {perfil?.role || "admin"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold transition hover:bg-white/20"
            >
              Volver al inicio
            </Link>

            <Link
              href="/cursos"
              className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm font-bold text-yellow-100 transition hover:bg-yellow-500/20"
            >
              Ver cursos
            </Link>

            <Link
              href="/panel"
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold transition hover:bg-white/20"
            >
              Panel privado
            </Link>

            <button
              type="button"
              onClick={actualizarTodo}
              disabled={cargando}
              className="rounded-2xl bg-yellow-500 px-4 py-3 text-sm font-bold text-neutral-950 transition hover:bg-yellow-400 disabled:opacity-60"
            >
              {cargando ? "Actualizando..." : "Actualizar"}
            </button>

            <Link
              href="/auth/logout"
              className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100 transition hover:bg-red-500/20"
            >
              Cerrar sesión
            </Link>
          </div>
        </header>

        <nav className="mb-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setTabActiva("resumen")}
            className={`rounded-2xl px-5 py-3 text-sm font-bold transition ${
              tabActiva === "resumen"
                ? "bg-yellow-500 text-neutral-950"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            Resumen
          </button>

          <button
            type="button"
            onClick={() => setTabActiva("inscripciones")}
            className={`rounded-2xl px-5 py-3 text-sm font-bold transition ${
              tabActiva === "inscripciones"
                ? "bg-yellow-500 text-neutral-950"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            Consultas
          </button>

          <button
            type="button"
            onClick={() => setTabActiva("cursos")}
            className={`rounded-2xl px-5 py-3 text-sm font-bold transition ${
              tabActiva === "cursos"
                ? "bg-yellow-500 text-neutral-950"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            Cursos
          </button>

          <button
            type="button"
            onClick={() => setTabActiva("productos")}
            className={`rounded-2xl px-5 py-3 text-sm font-bold transition ${
              tabActiva === "productos"
                ? "bg-yellow-500 text-neutral-950"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            Productos y planes
          </button>

          <Link
            href="/admin/usuarios"
            className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-3 text-center text-sm font-bold text-yellow-100 transition hover:bg-yellow-500/20"
          >
            Usuarios y roles
          </Link>

          <Link
            href="/admin/certificados"
            className="rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-3 text-center text-sm font-bold text-green-100 transition hover:bg-green-500/20"
          >
            Certificados
          </Link>
        </nav>

        {mensaje && (
          <div className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {tabActiva === "resumen" && (
          <section className="grid gap-6 lg:grid-cols-4">
            <ResumenCard titulo="Consultas" valor={inscripciones.length} />
            <ResumenCard titulo="Cursos" valor={cursos.length} />
            <ResumenCard titulo="Productos activos" valor={productosActivos.length} />
            <ResumenCard titulo="Sin precio" valor={productosSinPrecio.length} />

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 lg:col-span-2">
              <h2 className="text-2xl font-bold">Acciones rápidas</h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setTabActiva("cursos")}
                  className="rounded-2xl bg-yellow-500 px-5 py-4 font-bold text-black transition hover:bg-yellow-400"
                >
                  Crear o editar cursos
                </button>

                <button
                  type="button"
                  onClick={() => setTabActiva("productos")}
                  className="rounded-2xl border border-yellow-500/40 bg-yellow-500/10 px-5 py-4 font-bold text-yellow-100 transition hover:bg-yellow-500/20"
                >
                  Configurar productos
                </button>

                <Link
                  href="/admin/usuarios"
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-center font-bold transition hover:bg-white/20"
                >
                  Gestionar usuarios
                </Link>

                <Link
                  href="/admin/certificados"
                  className="rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-center font-bold text-green-100 transition hover:bg-green-500/20"
                >
                  Certificados
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-6 lg:col-span-2">
              <h2 className="text-2xl font-bold text-yellow-200">
                Recordatorio de ventas
              </h2>

              <p className="mt-3 leading-7 text-yellow-100">
                Para que un producto aparezca para comprar debe tener precio
                mayor a 0, estar activo y estar visible en la web.
              </p>

              <p className="mt-3 leading-7 text-yellow-100">
                Los planes Plantel y paquetes de hasta 4 personas pedirán los
                correos de los otros 3 participantes y solo permitirán continuar
                si ya tienen cuenta registrada.
              </p>
            </div>
          </section>
        )}

        {tabActiva === "inscripciones" && (
          <>
            <section className="mb-6 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              <ResumenCard titulo="Total" valor={inscripciones.length} />
              <ResumenCard titulo="Pendientes" valor={resumenEstados.pendiente || 0} />
              <ResumenCard titulo="Contactados" valor={resumenEstados.contactado || 0} />
              <ResumenCard titulo="Interesados" valor={resumenEstados.interesado || 0} />
              <ResumenCard titulo="Pagó" valor={resumenEstados.pagó || 0} />
              <ResumenCard titulo="Rechazados" valor={resumenEstados.rechazado || 0} />
            </section>

            <section className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                <input
                  type="search"
                  value={busqueda}
                  onChange={(event) => setBusqueda(event.target.value)}
                  placeholder="Buscar por nombre, email, teléfono, curso o mensaje."
                  className="rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
                />

                <select
                  value={filtroEstado}
                  onChange={(event) => setFiltroEstado(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
                >
                  <option value="todos">Todos los estados</option>
                  {ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section className="space-y-4">
              {inscripcionesFiltradas.length === 0 && (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-neutral-300">
                  No hay consultas para mostrar.
                </div>
              )}

              {inscripcionesFiltradas.map((inscripcion) => (
                <article
                  key={inscripcion.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-bold">
                          {inscripcion.nombre || "Sin nombre"}
                        </h3>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${claseEstado(
                            inscripcion.estado || "pendiente"
                          )}`}
                        >
                          {inscripcion.estado || "pendiente"}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-neutral-300 md:grid-cols-2">
                        <p>
                          <span className="text-neutral-500">Email:</span>{" "}
                          {formatearValor(inscripcion.email)}
                        </p>

                        <p>
                          <span className="text-neutral-500">Teléfono:</span>{" "}
                          {formatearValor(inscripcion.telefono)}
                        </p>

                        <p>
                          <span className="text-neutral-500">Curso:</span>{" "}
                          {formatearValor(inscripcion.curso)}
                        </p>

                        <p>
                          <span className="text-neutral-500">Modalidad:</span>{" "}
                          {formatearValor(inscripcion.modalidad)}
                        </p>
                      </div>

                      {inscripcion.mensaje && (
                        <p className="mt-4 rounded-2xl bg-black/30 p-4 text-sm leading-6 text-neutral-300">
                          {inscripcion.mensaje}
                        </p>
                      )}
                    </div>

                    <div className="flex min-w-[240px] flex-col gap-3">
                      <select
                        value={inscripcion.estado || "pendiente"}
                        onChange={(event) =>
                          cambiarEstado(inscripcion.id, event.target.value)
                        }
                        disabled={accionandoId === inscripcion.id}
                        className="rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
                      >
                        {ESTADOS.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => eliminarInscripcion(inscripcion.id)}
                        disabled={accionandoId === inscripcion.id}
                        className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100 transition hover:bg-red-500/20 disabled:opacity-60"
                      >
                        Eliminar consulta
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}

        {tabActiva === "cursos" && (
          <section className="grid gap-8 xl:grid-cols-[420px_1fr]">
            <form
              onSubmit={guardarCurso}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <h2 className="text-2xl font-bold">
                {cursoEditandoId ? "Editar curso" : "Crear curso"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-400">
                El curso crea la información principal. Los planes de pago se
                generan o editan en Productos y planes.
              </p>

              <div className="mt-6 space-y-4">
                <CampoTexto
                  label="Título"
                  value={formCurso.titulo}
                  onChange={(valor) => actualizarCampoCurso("titulo", valor)}
                  required
                />

                <CampoTexto
                  label="Slug / URL"
                  value={formCurso.slug}
                  onChange={(valor) => actualizarCampoCurso("slug", valor)}
                  required
                />

                <CampoTextarea
                  label="Descripción"
                  value={formCurso.descripcion}
                  onChange={(valor) =>
                    actualizarCampoCurso("descripcion", valor)
                  }
                />

                <CampoTexto
                  label="Categoría"
                  value={formCurso.categoria}
                  onChange={(valor) => actualizarCampoCurso("categoria", valor)}
                />

                <CampoTexto
                  label="Precio visible del curso"
                  value={formCurso.precio}
                  onChange={(valor) => actualizarCampoCurso("precio", valor)}
                />

                <CampoTexto
                  label="Duración"
                  value={formCurso.duracion}
                  onChange={(valor) => actualizarCampoCurso("duracion", valor)}
                />

                <CampoTexto
                  label="Modalidad"
                  value={formCurso.modalidad}
                  onChange={(valor) => actualizarCampoCurso("modalidad", valor)}
                />

                <CampoTexto
                  label="URL de imagen"
                  value={formCurso.imagen_url}
                  onChange={(valor) =>
                    actualizarCampoCurso("imagen_url", valor)
                  }
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <CheckBox
                    label="Curso activo"
                    checked={formCurso.activo}
                    onChange={(valor) => actualizarCampoCurso("activo", valor)}
                  />

                  <CheckBox
                    label="Destacado"
                    checked={formCurso.destacado}
                    onChange={(valor) =>
                      actualizarCampoCurso("destacado", valor)
                    }
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={cargando}
                  className="rounded-2xl bg-yellow-500 px-5 py-3 font-bold text-neutral-950 transition hover:bg-yellow-400 disabled:opacity-60"
                >
                  {cargando
                    ? "Guardando..."
                    : cursoEditandoId
                      ? "Guardar cambios"
                      : "Crear curso"}
                </button>

                {cursoEditandoId && (
                  <button
                    type="button"
                    onClick={resetearFormularioCurso}
                    className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-bold transition hover:bg-white/20"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>
            </form>

            <div>
              <div className="mb-5 rounded-3xl border border-white/10 bg-white/5 p-5">
                <input
                  type="search"
                  value={busquedaCursos}
                  onChange={(event) => setBusquedaCursos(event.target.value)}
                  placeholder="Buscar cursos."
                  className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
                />
              </div>

              <div className="space-y-4">
                {cursosFiltrados.length === 0 && (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-neutral-300">
                    No hay cursos para mostrar.
                  </div>
                )}

                {cursosFiltrados.map((curso) => (
                  <article
                    key={curso.id}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold">{curso.titulo}</h3>

                          {curso.activo ? (
                            <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-200">
                              Activo
                            </span>
                          ) : (
                            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-200">
                              Inactivo
                            </span>
                          )}

                          {curso.destacado && (
                            <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-200">
                              Destacado
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm text-neutral-400">
                          /cursos/{curso.slug}
                        </p>

                        <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-300">
                          {curso.descripcion || "Sin descripción."}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-neutral-400">
                          <span className="rounded-full bg-black/30 px-3 py-1">
                            Precio visible: {formatearValor(curso.precio)}
                          </span>

                          <span className="rounded-full bg-black/30 px-3 py-1">
                            Duración: {formatearValor(curso.duracion)}
                          </span>

                          <span className="rounded-full bg-black/30 px-3 py-1">
                            Modalidad: {formatearValor(curso.modalidad)}
                          </span>
                        </div>
                      </div>

                      <div className="flex min-w-[230px] flex-col gap-3">
                        <Link
                          href={`/admin/cursos/${curso.slug}/contenido`}
                          className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-center text-sm font-bold text-blue-100 transition hover:bg-blue-500/20"
                        >
                          Contenido
                        </Link>

                        <button
                          type="button"
                          onClick={() => generarPlanes(curso)}
                          disabled={accionandoId === `planes-${curso.id}`}
                          className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm font-bold text-yellow-100 transition hover:bg-yellow-500/20 disabled:opacity-60"
                        >
                          {accionandoId === `planes-${curso.id}`
                            ? "Generando..."
                            : "Generar planes"}
                        </button>

                        <button
                          type="button"
                          onClick={() => editarCurso(curso)}
                          className="rounded-2xl bg-yellow-500 px-4 py-3 text-sm font-bold text-neutral-950 transition hover:bg-yellow-400"
                        >
                          Editar curso
                        </button>

                        <button
                          type="button"
                          onClick={() => eliminarCurso(curso.id)}
                          disabled={accionandoId === curso.id}
                          className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100 transition hover:bg-red-500/20 disabled:opacity-60"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {tabActiva === "productos" && (
          <section className="grid gap-8 xl:grid-cols-[430px_1fr]">
            <form
              onSubmit={guardarProducto}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <h2 className="text-2xl font-bold">
                {productoEditandoId ? "Editar producto" : "Crear producto"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-400">
                Acá se controlan los productos que se pueden vender: planes de
                curso, paquetes, membresías y futuros productos.
              </p>

              <div className="mt-6 space-y-4">
                <CampoTexto
                  label="Nombre del producto"
                  value={formProducto.nombre}
                  onChange={(valor) => actualizarCampoProducto("nombre", valor)}
                  required
                />

                <CampoTexto
                  label="Slug"
                  value={formProducto.slug}
                  onChange={(valor) => actualizarCampoProducto("slug", valor)}
                  required
                />

                <CampoTextarea
                  label="Descripción"
                  value={formProducto.descripcion}
                  onChange={(valor) =>
                    actualizarCampoProducto("descripcion", valor)
                  }
                />

                <div>
                  <label className="mb-2 block text-sm font-bold text-neutral-200">
                    Tipo de producto
                  </label>

                  <select
                    value={formProducto.tipo_producto}
                    onChange={(event) =>
                      actualizarCampoProducto(
                        "tipo_producto",
                        event.target.value
                      )
                    }
                    className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
                  >
                    {TIPOS_PRODUCTO.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formProducto.tipo_producto === "curso_plan" && (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-neutral-200">
                        Curso asociado
                      </label>

                      <select
                        value={formProducto.curso_id}
                        onChange={(event) =>
                          actualizarCampoProducto(
                            "curso_id",
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
                      >
                        <option value="">Seleccionar curso</option>
                        {cursos.map((curso) => (
                          <option key={curso.id} value={curso.id}>
                            {curso.titulo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-neutral-200">
                        Plan
                      </label>

                      <select
                        value={formProducto.plan}
                        onChange={(event) =>
                          actualizarCampoProducto("plan", event.target.value)
                        }
                        className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
                      >
                        {PLANES.map((plan) => (
                          <option key={plan.value} value={plan.value}>
                            {plan.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {formProducto.tipo_producto === "paquete" && (
                  <div>
                    <label className="mb-2 block text-sm font-bold text-neutral-200">
                      Cursos incluidos en el paquete
                    </label>

                    <div className="space-y-2 rounded-2xl border border-white/10 bg-neutral-900 p-4">
                      {cursos.map((curso) => (
                        <label
                          key={curso.id}
                          className="flex items-center gap-3 text-sm text-neutral-200"
                        >
                          <input
                            type="checkbox"
                            checked={formProducto.curso_ids.includes(curso.id)}
                            onChange={() => alternarCursoProducto(curso.id)}
                            className="h-4 w-4"
                          />

                          <span>{curso.titulo}</span>
                        </label>
                      ))}

                      {cursos.length === 0 && (
                        <p className="text-sm text-neutral-400">
                          Primero necesitás crear cursos.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <CampoNumero
                    label="Precio"
                    value={formProducto.precio}
                    onChange={(valor) =>
                      actualizarCampoProducto("precio", valor)
                    }
                  />

                  <div>
                    <label className="mb-2 block text-sm font-bold text-neutral-200">
                      Moneda
                    </label>

                    <select
                      value={formProducto.moneda}
                      onChange={(event) =>
                        actualizarCampoProducto("moneda", event.target.value)
                      }
                      className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
                    >
                      <option value="UYU">UYU</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <CampoNumero
                    label="Cantidad máxima de usuarios"
                    value={formProducto.cantidad_maxima_usuarios}
                    onChange={(valor) =>
                      actualizarCampoProducto(
                        "cantidad_maxima_usuarios",
                        valor
                      )
                    }
                  />

                  <CampoNumero
                    label="Orden"
                    value={formProducto.orden}
                    onChange={(valor) => actualizarCampoProducto("orden", valor)}
                  />
                </div>

                <CampoTexto
                  label="Texto del botón"
                  value={formProducto.texto_boton}
                  onChange={(valor) =>
                    actualizarCampoProducto("texto_boton", valor)
                  }
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <CheckBox
                    label="Activo para venta"
                    checked={formProducto.activo}
                    onChange={(valor) =>
                      actualizarCampoProducto("activo", valor)
                    }
                  />

                  <CheckBox
                    label="Visible en la web"
                    checked={formProducto.visible_en_web}
                    onChange={(valor) =>
                      actualizarCampoProducto("visible_en_web", valor)
                    }
                  />

                  <CheckBox
                    label="Destacado"
                    checked={formProducto.destacado}
                    onChange={(valor) =>
                      actualizarCampoProducto("destacado", valor)
                    }
                  />

                  <CheckBox
                    label="Pago recurrente"
                    checked={formProducto.es_recurrente}
                    onChange={(valor) =>
                      actualizarCampoProducto("es_recurrente", valor)
                    }
                  />

                  <CheckBox
                    label="Requiere participantes"
                    checked={formProducto.requiere_participantes}
                    onChange={(valor) =>
                      actualizarCampoProducto("requiere_participantes", valor)
                    }
                  />

                  <CheckBox
                    label="Correos registrados obligatorios"
                    checked={formProducto.requiere_correos_registrados}
                    onChange={(valor) =>
                      actualizarCampoProducto(
                        "requiere_correos_registrados",
                        valor
                      )
                    }
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={cargando}
                  className="rounded-2xl bg-yellow-500 px-5 py-3 font-bold text-neutral-950 transition hover:bg-yellow-400 disabled:opacity-60"
                >
                  {cargando
                    ? "Guardando..."
                    : productoEditandoId
                      ? "Guardar producto"
                      : "Crear producto"}
                </button>

                {productoEditandoId && (
                  <button
                    type="button"
                    onClick={resetearFormularioProducto}
                    className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-bold transition hover:bg-white/20"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>
            </form>

            <div>
              <div className="mb-5 rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                  <input
                    type="search"
                    value={busquedaProductos}
                    onChange={(event) =>
                      setBusquedaProductos(event.target.value)
                    }
                    placeholder="Buscar productos, planes o paquetes."
                    className="rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
                  />

                  <select
                    value={filtroTipoProducto}
                    onChange={(event) =>
                      setFiltroTipoProducto(event.target.value)
                    }
                    className="rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
                  >
                    <option value="todos">Todos</option>
                    {TIPOS_PRODUCTO.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {productosFiltrados.length === 0 && (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-neutral-300">
                    No hay productos para mostrar.
                  </div>
                )}

                {productosFiltrados.map((producto) => (
                  <article
                    key={producto.id}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-bold">
                            {producto.nombre}
                          </h3>

                          <Pill
                            color={
                              producto.activo && producto.visible_en_web
                                ? "green"
                                : "red"
                            }
                          >
                            {producto.activo && producto.visible_en_web
                              ? "Visible"
                              : "Oculto"}
                          </Pill>

                          <Pill color="yellow">
                            {producto.tipo_producto || "producto"}
                          </Pill>

                          {producto.plan && (
                            <Pill color="blue">{producto.plan}</Pill>
                          )}

                          {producto.destacado && (
                            <Pill color="yellow">Destacado</Pill>
                          )}
                        </div>

                        <p className="mt-2 text-sm text-neutral-400">
                          /producto/{producto.slug}
                        </p>

                        <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-300">
                          {producto.descripcion || "Sin descripción."}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-neutral-300">
                          <span className="rounded-full bg-black/30 px-3 py-1">
                            Precio: {formatearPrecio(producto)}
                          </span>

                          <span className="rounded-full bg-black/30 px-3 py-1">
                            Usuarios:{" "}
                            {producto.cantidad_maxima_usuarios || 1}
                          </span>

                          <span className="rounded-full bg-black/30 px-3 py-1">
                            Participantes:{" "}
                            {producto.requiere_participantes ? "Sí" : "No"}
                          </span>

                          <span className="rounded-full bg-black/30 px-3 py-1">
                            Correos registrados:{" "}
                            {producto.requiere_correos_registrados
                              ? "Sí"
                              : "No"}
                          </span>
                        </div>

                        {Array.isArray(producto.producto_cursos) &&
                          producto.producto_cursos.length > 0 && (
                            <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                              <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                                Cursos asociados
                              </p>

                              <div className="mt-2 flex flex-wrap gap-2">
                                {producto.producto_cursos.map((item) => {
                                  const curso = cursos.find(
                                    (curso) => curso.id === item.curso_id
                                  );

                                  return (
                                    <span
                                      key={item.id || item.curso_id}
                                      className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-neutral-200"
                                    >
                                      {curso?.titulo || `Curso ${item.curso_id}`} ·{" "}
                                      {item.nivel_acceso}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                      </div>

                      <div className="flex min-w-[230px] flex-col gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            cambiarEstadoProducto(
                              producto,
                              "activo",
                              !producto.activo
                            )
                          }
                          disabled={accionandoId === producto.id}
                          className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm font-bold text-yellow-100 transition hover:bg-yellow-500/20 disabled:opacity-60"
                        >
                          {producto.activo ? "Desactivar" : "Activar"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            cambiarEstadoProducto(
                              producto,
                              "visible_en_web",
                              !producto.visible_en_web
                            )
                          }
                          disabled={accionandoId === producto.id}
                          className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold transition hover:bg-white/20 disabled:opacity-60"
                        >
                          {producto.visible_en_web
                            ? "Ocultar de web"
                            : "Mostrar en web"}
                        </button>

                        <button
                          type="button"
                          onClick={() => editarProducto(producto)}
                          className="rounded-2xl bg-yellow-500 px-4 py-3 text-sm font-bold text-neutral-950 transition hover:bg-yellow-400"
                        >
                          Editar producto
                        </button>

                        <button
                          type="button"
                          onClick={() => eliminarProducto(producto.id)}
                          disabled={accionandoId === producto.id}
                          className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100 transition hover:bg-red-500/20 disabled:opacity-60"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function ResumenCard({ titulo, valor }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-neutral-400">{titulo}</p>
      <p className="mt-2 text-4xl font-bold text-yellow-400">{valor}</p>
    </div>
  );
}

function CampoTexto({ label, value, onChange, required = false }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-neutral-200">
        {label}
      </label>

      <input
        type="text"
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
      />
    </div>
  );
}

function CampoNumero({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-neutral-200">
        {label}
      </label>

      <input
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
      />
    </div>
  );
}

function CampoTextarea({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-neutral-200">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
      />
    </div>
  );
}

function CheckBox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm text-neutral-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4"
      />

      <span>{label}</span>
    </label>
  );
}

function Pill({ children, color = "neutral" }) {
  const clases = {
    green: "border-green-500/30 bg-green-500/10 text-green-200",
    red: "border-red-500/30 bg-red-500/10 text-red-200",
    yellow: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-200",
    neutral: "border-white/10 bg-white/10 text-neutral-200",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${clases[color]}`}
    >
      {children}
    </span>
  );
}