"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function formatearPrecio(producto) {
  const precio = Number(producto?.precio || 0);

  if (!precio) {
    return "Consultar";
  }

  try {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: producto?.moneda || "USD",
      maximumFractionDigits: precio < 100 ? 2 : 0,
    }).format(precio);
  } catch {
    return `${producto?.moneda || "USD"} ${precio}`;
  }
}

function Badge({ children, color = "yellow" }) {
  const colores = {
    yellow: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    green: "border-green-500/30 bg-green-500/10 text-green-200",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-200",
    red: "border-red-500/30 bg-red-500/10 text-red-200",
    neutral: "border-white/10 bg-white/10 text-zinc-200",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${colores[color]}`}
    >
      {children}
    </span>
  );
}

export default function AdminGenerarPacksClient() {
  const [packs, setPacks] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

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

  async function cargarPacks() {
    setCargando(true);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetchAdmin("/api/admin/packs/generar", {
        method: "GET",
        cache: "no-store",
      });

      const data = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        setPacks([]);
        setError(data?.error || "No se pudieron cargar los packs.");
        return;
      }

      setPacks(data?.packs || []);
    } catch (error) {
      console.error("Error cargando packs:", error);
      setError("Error de conexión al cargar los packs.");
      setPacks([]);
    } finally {
      setCargando(false);
    }
  }

  async function generarPacks() {
    const confirmar = window.confirm(
      "¿Querés generar o actualizar el Pack Básico y Pack Pro con los precios y beneficios definidos?"
    );

    if (!confirmar) {
      return;
    }

    setGenerando(true);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetchAdmin("/api/admin/packs/generar", {
        method: "POST",
        cache: "no-store",
      });

      const data = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        setError(data?.error || "No se pudieron generar los packs.");
        return;
      }

      setMensaje(data?.mensaje || "Packs generados correctamente.");
      setPacks(data?.packs || []);
    } catch (error) {
      console.error("Error generando packs:", error);
      setError("Error de conexión al generar packs.");
    } finally {
      setGenerando(false);
    }
  }

  useEffect(() => {
    cargarPacks();
  }, []);

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-yellow-500/30 bg-yellow-500/10 p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-300">
              Generador automático
            </p>

            <h2 className="mt-3 text-3xl font-black text-yellow-100">
              Pack Básico y Pack Pro
            </h2>

            <p className="mt-4 max-w-3xl leading-7 text-yellow-100">
              Este botón crea o actualiza los dos packs principales: Pack Básico
              2 cursos y Pack Pro 2 cursos. También asocia ambos cursos a cada
              pack para que el acceso se pueda habilitar correctamente después
              del pago.
            </p>
          </div>

          <button
            type="button"
            onClick={generarPacks}
            disabled={generando}
            className="rounded-2xl bg-yellow-500 px-6 py-4 text-center font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generando ? "Generando packs..." : "Generar Packs Básico y Pro"}
          </button>
        </div>
      </div>

      {mensaje ? (
        <div className="rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-sm font-bold text-green-200">
          {mensaje}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-200">
          {error}
        </div>
      ) : null}

      <div className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
              Packs actuales
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Productos generados
            </h2>
          </div>

          <button
            type="button"
            onClick={cargarPacks}
            disabled={cargando}
            className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold transition hover:bg-white/20 disabled:opacity-60"
          >
            {cargando ? "Actualizando..." : "Actualizar lista"}
          </button>
        </div>

        {cargando ? (
          <div className="rounded-3xl border border-white/10 bg-black p-8 text-center text-zinc-400">
            Cargando packs...
          </div>
        ) : null}

        {!cargando && packs.length === 0 ? (
          <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-8">
            <h3 className="text-2xl font-black text-yellow-100">
              Todavía no hay packs generados
            </h3>

            <p className="mt-3 leading-7 text-yellow-100">
              Tocá el botón “Generar Packs Básico y Pro” para crearlos.
            </p>
          </div>
        ) : null}

        {!cargando && packs.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {packs.map((pack) => (
              <article
                key={pack.id}
                className={`rounded-[1.5rem] border p-5 ${
                  pack.destacado
                    ? "border-yellow-500/40 bg-yellow-500/10"
                    : "border-white/10 bg-black"
                }`}
              >
                <div className="flex flex-wrap gap-2">
                  <Badge color={pack.destacado ? "yellow" : "blue"}>
                    Pack
                  </Badge>

                  <Badge color="neutral">
                    {pack.plan === "pro" ? "Pro" : "Básico"}
                  </Badge>

                  {pack.activo && pack.visible_en_web ? (
                    <Badge color="green">Visible</Badge>
                  ) : (
                    <Badge color="red">Oculto</Badge>
                  )}

                  {pack.destacado ? (
                    <Badge color="yellow">Recomendado</Badge>
                  ) : null}
                </div>

                <h3 className="mt-4 text-2xl font-black">{pack.nombre}</h3>

                <p className="mt-3 min-h-20 text-sm leading-6 text-zinc-300">
                  {pack.descripcion || "Pack de cursos SERVICAN."}
                </p>

                <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-950 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
                    Precio
                  </p>

                  <p className="mt-2 break-words text-4xl font-black leading-tight text-yellow-500">
                    {formatearPrecio(pack)}
                  </p>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-950 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
                    Cursos asociados
                  </p>

                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    {Array.isArray(pack.producto_cursos) &&
                    pack.producto_cursos.length > 0
                      ? `${pack.producto_cursos.length} curso(s) asociado(s)`
                      : "Sin cursos asociados"}
                  </p>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`/packs/${pack.slug}`}
                    className="rounded-full bg-yellow-500 px-5 py-3 text-center text-sm font-black text-black transition hover:bg-yellow-400"
                  >
                    Ver página del pack
                  </Link>

                  <Link
                    href="/admin"
                    className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/20"
                  >
                    Volver al admin
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}