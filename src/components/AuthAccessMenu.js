"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderAcceso from "@/app/components/HeaderAcceso";

export default function AuthAccessMenu() {
  const pathname = usePathname();

  const mostrarBarra =
    pathname.startsWith("/noticias") || pathname.startsWith("/cursos");

  if (!mostrarBarra) {
    return null;
  }

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-yellow-500/20 bg-black/95 text-white shadow-2xl backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src="/logo-servican.jpeg"
            alt="Logo SERVICAN"
            width={52}
            height={52}
            priority
            className="h-12 w-12 rounded-full object-contain"
          />

          <div>
            <p className="text-lg font-black tracking-[0.22em] text-yellow-500">
              SERVICAN
            </p>
            <p className="hidden text-xs text-zinc-400 sm:block">
              Nuestro olfato nos define
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-zinc-300 lg:flex">
          <Link href="/" className="transition hover:text-yellow-500">
            Inicio
          </Link>

          <Link
            href="/cursos"
            className={`transition ${
              pathname.startsWith("/cursos")
                ? "text-yellow-500"
                : "hover:text-yellow-500"
            }`}
          >
            Cursos
          </Link>

          <Link
            href="/noticias"
            className={`transition ${
              pathname.startsWith("/noticias")
                ? "text-yellow-500"
                : "hover:text-yellow-500"
            }`}
          >
            Noticias
          </Link>

          <Link
            href="/verificar-certificado"
            className="transition hover:text-yellow-500"
          >
            Certificados
          </Link>

          <Link href="/inscripcion" className="transition hover:text-yellow-500">
            Contacto
          </Link>
        </nav>

        <HeaderAcceso />
      </div>

      <div className="border-t border-white/10 px-4 py-3 lg:hidden">
        <div className="mx-auto flex max-w-[1600px] gap-2 overflow-x-auto text-sm font-bold text-zinc-300">
          <Link
            href="/"
            className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:text-yellow-500"
          >
            Inicio
          </Link>

          <Link
            href="/cursos"
            className={`shrink-0 rounded-full border px-4 py-2 ${
              pathname.startsWith("/cursos")
                ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                : "border-white/10 bg-white/5 hover:text-yellow-500"
            }`}
          >
            Cursos
          </Link>

          <Link
            href="/noticias"
            className={`shrink-0 rounded-full border px-4 py-2 ${
              pathname.startsWith("/noticias")
                ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                : "border-white/10 bg-white/5 hover:text-yellow-500"
            }`}
          >
            Noticias
          </Link>

          <Link
            href="/verificar-certificado"
            className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:text-yellow-500"
          >
            Certificados
          </Link>

          <Link
            href="/inscripcion"
            className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:text-yellow-500"
          >
            Contacto
          </Link>
        </div>
      </div>
    </header>
  );
}