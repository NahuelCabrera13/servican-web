import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function cerrarSesion(request) {
  try {
    const supabase = await createClient();

    await supabase.auth.signOut();
  } catch (error) {
    console.error("Error cerrando sesión:", error);
  }

  return NextResponse.redirect(new URL("/", request.url), {
    status: 303,
  });
}

export async function POST(request) {
  return cerrarSesion(request);
}

export async function GET(request) {
  return cerrarSesion(request);
}