import { createAdminClient } from "@/lib/supabase/admin";

function ordenarPaquetes(paquetes) {
  return [...(paquetes || [])].sort((a, b) => {
    const ordenA = Number(a.orden || 99);
    const ordenB = Number(b.orden || 99);

    if (ordenA !== ordenB) {
      return ordenA - ordenB;
    }

    return String(a.nombre || "").localeCompare(String(b.nombre || ""));
  });
}

export async function obtenerPaquetesActivos() {
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
          orden,
          cursos (
            id,
            titulo,
            slug,
            descripcion,
            categoria,
            duracion,
            modalidad,
            imagen_url
          )
        )
      `
      )
      .eq("tipo_producto", "paquete")
      .eq("activo", true)
      .eq("visible_en_web", true);

    if (error) {
      console.error("Error obteniendo paquetes activos:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      return [];
    }

    return ordenarPaquetes(data || []);
  } catch (error) {
    console.error("Error inesperado obteniendo paquetes activos:", {
      message: error?.message,
    });

    return [];
  }
}

export async function obtenerTodosLosPaquetesVisibles() {
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
          orden,
          cursos (
            id,
            titulo,
            slug,
            descripcion,
            categoria,
            duracion,
            modalidad,
            imagen_url
          )
        )
      `
      )
      .eq("tipo_producto", "paquete")
      .eq("visible_en_web", true);

    if (error) {
      console.error("Error obteniendo paquetes visibles:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      return [];
    }

    return ordenarPaquetes(data || []);
  } catch (error) {
    console.error("Error inesperado obteniendo paquetes visibles:", {
      message: error?.message,
    });

    return [];
  }
}