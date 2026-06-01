"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

function recortarTexto(texto, maximo = 95) {
  const limpio = String(texto || "").trim();

  if (limpio.length <= maximo) {
    return limpio;
  }

  return `${limpio.slice(0, maximo).trim()}...`;
}

export default function NoticiasFlotantes() {
  const pathname = usePathname();

  const [noticias, setNoticias] = useState([]);
  const [visible, setVisible] = useState(false);
  const [cerrada, setCerrada] = useState(false);

  useEffect(() => {
    if (pathname !== "/") {
      setVisible(false);
      setCerrada(true);
      return;
    }

    setNoticias([]);
    setVisible(false);
    setCerrada(false);

    async function cargarNoticias() {
      try {
        const respuesta = await fetch("/api/noticias/destacadas", {
          cache: "no-store",
        });

        if (!respuesta.ok) {
          return;
        }

        const data = await respuesta.json();
        const noticiasRecibidas = data?.noticias || [];

        if (noticiasRecibidas.length > 0) {
          setNoticias(noticiasRecibidas);

          setTimeout(() => {
            setVisible(true);
          }, 900);
        }
      } catch (error) {
        console.error("No se pudieron cargar noticias flotantes:", error);
      }
    }

    cargarNoticias();
  }, [pathname]);

  function cerrar() {
    setVisible(false);

    setTimeout(() => {
      setCerrada(true);
    }, 500);
  }

  if (pathname !== "/" || cerrada || noticias.length === 0) {
    return null;
  }

  const noticiaPrincipal = noticias[0];

  return (
    <div
      className={`fixed bottom-5 right-5 z-[90] w-[calc(100vw-2.5rem)] max-w-md transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="overflow-hidden rounded-[2rem] border border-yellow-500/40 bg-black shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between border-b border-yellow-500/20 bg-yellow-500 px-5 py-3 text-black">
          <p className="text-sm font-black uppercase tracking-[0.25em]">
            Noticias SERVICAN
          </p>

          <button
            type="button"
            onClick={cerrar}
            className="rounded-full bg-black px-3 py-1 text-sm font-black text-yellow-400 transition hover:bg-zinc-900"
            aria-label="Cerrar noticias"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-[0.85fr_1.15fr] gap-0">
          <div className="flex min-h-40 items-center justify-center bg-zinc-950">
            {noticiaPrincipal.imagen_url ? (
              <img
                src={noticiaPrincipal.imagen_url}
                alt={noticiaPrincipal.titulo}
                className="h-full max-h-48 w-full object-contain"
              />
            ) : (
              <img
                src="/logo-servican.jpeg"
                alt="Logo SERVICAN"
                className="h-24 w-24 rounded-full object-contain"
              />
            )}
          </div>

          <div className="p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
              {noticiaPrincipal.categoria || "Novedad"}
            </p>

            <h3 className="mt-2 text-lg font-black leading-tight text-white">
              {noticiaPrincipal.titulo}
            </h3>

            <p className="mt-3 text-sm leading-6 text-zinc-300">
              {recortarTexto(
                noticiaPrincipal.encabezado || noticiaPrincipal.contenido
              )}
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <Link
                href={`/noticias/${noticiaPrincipal.slug}`}
                className="rounded-full bg-yellow-500 px-4 py-2 text-center text-sm font-black text-black transition hover:bg-yellow-400"
              >
                Leer noticia
              </Link>

              <Link
                href="/noticias"
                className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-center text-sm font-black text-yellow-200 transition hover:bg-yellow-500 hover:text-black"
              >
                Ver todas
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}