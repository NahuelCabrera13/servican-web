import { createClient } from "@supabase/supabase-js";

function crearClientePublico() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL.");
  }

  if (!supabaseAnonKey) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function obtenerProductosActivosPorCurso(cursoId) {
  const supabase = crearClientePublico();

  const { data, error } = await supabase
    .from("productos")
    .select(
      `
      *,
      producto_cursos (
        id,
        curso_id,
        nivel_acceso,
        beneficios_pro,
        orden
      )
    `
    )
    .eq("curso_id", cursoId)
    .eq("tipo_producto", "curso_plan")
    .eq("activo", true)
    .eq("visible_en_web", true)
    .eq("es_recurrente", false)
    .order("orden", { ascending: true })
    .order("precio", { ascending: true });

  if (error) {
    console.error("Error obteniendo productos activos del curso:", error);

    return {
      productos: [],
      error,
    };
  }

  return {
    productos: data || [],
    error: null,
  };
}