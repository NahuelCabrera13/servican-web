import { NextResponse } from "next/server";
import { obtenerNoticiasPublicadas } from "@/lib/noticiasPublicas";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const noticias = await obtenerNoticiasPublicadas({ limite: 3 });

    return NextResponse.json({
      noticias,
    });
  } catch (error) {
    console.error("Error cargando noticias destacadas:", error);

    return NextResponse.json({
      noticias: [],
    });
  }
}