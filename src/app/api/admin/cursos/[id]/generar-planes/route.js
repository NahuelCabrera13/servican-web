import { NextResponse } from "next/server";
import { verificarAdmin } from "@/lib/admin/verificarAdmin";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  const verificacion = await verificarAdmin(request);

  if (!verificacion.ok) {
    return NextResponse.json(
      { error: verificacion.error },
      { status: verificacion.status }
    );
  }

  const { supabase } = verificacion;

  try {
    const { id } = await params;
    const cursoId = Number(id);

    if (!cursoId || Number.isNaN(cursoId)) {
      return NextResponse.json(
        { error: "ID de curso inválido." },
        { status: 400 }
      );
    }

    const { data: curso, error: errorCurso } = await supabase
      .from("cursos")
      .select("*")
      .eq("id", cursoId)
      .maybeSingle();

    if (errorCurso || !curso) {
      return NextResponse.json(
        { error: "Curso no encontrado." },
        { status: 404 }
      );
    }

    const { error: errorFuncion } = await supabase.rpc(
      "generar_planes_para_curso",
      {
        p_curso_id: cursoId,
      }
    );

    if (errorFuncion) {
      console.error("Error generando planes:", errorFuncion);

      return NextResponse.json(
        { error: "No se pudieron generar los planes del curso." },
        { status: 500 }
      );
    }

    const { data: productos, error: errorProductos } = await supabase
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
      .order("orden", { ascending: true })
      .order("created_at", { ascending: true });

    if (errorProductos) {
      console.error("Error cargando productos generados:", errorProductos);

      return NextResponse.json(
        {
          ok: true,
          curso,
          productos: [],
          advertencia:
            "Los planes se generaron, pero no se pudieron volver a cargar.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      ok: true,
      curso,
      productos: productos || [],
    });
  } catch (error) {
    console.error("Error interno generando planes:", error);

    return NextResponse.json(
      { error: "Error interno generando planes del curso." },
      { status: 500 }
    );
  }
}