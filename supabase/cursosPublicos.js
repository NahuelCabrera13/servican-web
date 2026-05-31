import { createClient } from "@supabase/supabase-js";

export async function obtenerCursosActivos() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      cursos: [],
      error: "Faltan variables públicas de Supabase.",
    };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

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