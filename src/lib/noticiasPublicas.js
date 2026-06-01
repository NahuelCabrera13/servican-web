import { createAdminClient } from "@/lib/supabase/admin";

export async function obtenerNoticiasPublicadas({ limite = 6 } = {}) {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("noticias")
      .select("*")
      .eq("publicada", true)
      .order("destacada", { ascending: false })
      .order("orden", { ascending: true })
      .order("fecha_publicacion", { ascending: false })
      .limit(limite);

    if (error) {
      console.error("Error obteniendo noticias publicadas:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error inesperado obteniendo noticias:", {
      message: error?.message,
    });

    return [];
  }
}

export async function obtenerNoticiaPorSlug(slug) {
  if (!slug) return null;

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("noticias")
      .select("*")
      .eq("slug", slug)
      .eq("publicada", true)
      .single();

    if (error) {
      console.error("Error obteniendo noticia:", {
        message: error.message,
        code: error.code,
      });

      return null;
    }

    return data;
  } catch (error) {
    console.error("Error inesperado obteniendo noticia:", {
      message: error?.message,
    });

    return null;
  }
}