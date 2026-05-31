import { createClient } from "@supabase/supabase-js";

function crearClientePublico() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function obtenerCursosActivos() {
  const supabase = crearClientePublico();

  if (!supabase) {
    return {
      cursos: [],
      error: "Faltan variables públicas de Supabase.",
    };
  }

  const { data, error } = await supabase
    .from("cursos")
    .select("*")
    .eq("activo", true)
    .order("destacado", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return {
      cursos: [],
      error: error.message,
    };
  }

  return {
    cursos: data || [],
    error: null,
  };
}

export async function obtenerCursoPorSlug(slug) {
  const supabase = crearClientePublico();

  if (!supabase) {
    return {
      curso: null,
      error: "Faltan variables públicas de Supabase.",
    };
  }

  const { data, error } = await supabase
    .from("cursos")
    .select("*")
    .eq("slug", slug)
    .eq("activo", true)
    .single();

  if (error) {
    return {
      curso: null,
      error: error.message,
    };
  }

  return {
    curso: data,
    error: null,
  };
}