import { createAdminClient } from "@/lib/supabase/admin";

const ORDEN_PLANES = {
  basico: 1,
  extenso: 2,
  pro: 3,
  plantel: 4,
};

function normalizar(valor) {
  return String(valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function ordenarProductos(productos) {
  return [...(productos || [])].sort((a, b) => {
    const planA = normalizar(a.plan);
    const planB = normalizar(b.plan);

    const ordenA = Number(a.orden || ORDEN_PLANES[planA] || 99);
    const ordenB = Number(b.orden || ORDEN_PLANES[planB] || 99);

    if (ordenA !== ordenB) {
      return ordenA - ordenB;
    }

    return String(a.nombre || "").localeCompare(String(b.nombre || ""));
  });
}

function quitarDuplicados(productos) {
  const mapa = new Map();

  for (const producto of productos || []) {
    if (!producto?.id) continue;
    mapa.set(String(producto.id), producto);
  }

  return [...mapa.values()];
}

function normalizarCurso(cursoParametro) {
  if (!cursoParametro) {
    return null;
  }

  if (cursoParametro?.id) {
    return cursoParametro;
  }

  if (cursoParametro?.curso?.id) {
    return cursoParametro.curso;
  }

  return null;
}

function productoPerteneceAlCurso(producto, curso) {
  if (!producto || !curso?.id) {
    return false;
  }

  const cursoId = String(curso.id);

  if (String(producto.curso_id || "") === cursoId) {
    return true;
  }

  const relaciones = producto.producto_cursos || [];

  return relaciones.some((relacion) => {
    return String(relacion?.curso_id || "") === cursoId;
  });
}

export async function obtenerProductosActivosPorCurso(cursoParametro) {
  const curso = normalizarCurso(cursoParametro);

  if (!curso?.id) {
    console.error("No se recibió curso válido para buscar productos:", {
      cursoParametro,
    });

    return [];
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("productos")
      .select(
        `
        *,
        producto_cursos (
          curso_id,
          nivel_acceso,
          beneficios_pro,
          orden
        )
      `
      )
      .eq("activo", true)
      .eq("visible_en_web", true)
      .neq("tipo_producto", "paquete");

    if (error) {
      console.error("Error obteniendo productos activos:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      return [];
    }

    const productos = quitarDuplicados(data || []);
    const productosDelCurso = productos.filter((producto) =>
      productoPerteneceAlCurso(producto, curso)
    );

    console.log("DEBUG productos públicos:", {
      curso: {
        id: curso.id,
        titulo: curso.titulo,
        slug: curso.slug,
      },
      productosVisiblesTotales: productos.length,
      productosDelCurso: productosDelCurso.length,
    });

    return ordenarProductos(productosDelCurso);
  } catch (error) {
    console.error("Error inesperado obteniendo productos activos:", {
      message: error?.message,
    });

    return [];
  }
}

export async function obtenerProductosActivos() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("productos")
      .select(
        `
        *,
        producto_cursos (
          curso_id,
          nivel_acceso,
          beneficios_pro,
          orden
        )
      `
      )
      .eq("activo", true)
      .eq("visible_en_web", true)
      .neq("tipo_producto", "paquete");

    if (error) {
      console.error("Error obteniendo productos activos:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      return [];
    }

    return ordenarProductos(quitarDuplicados(data || []));
  } catch (error) {
    console.error("Error inesperado obteniendo productos activos:", {
      message: error?.message,
    });

    return [];
  }
}