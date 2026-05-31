"use client";

export default function BotonImprimirCertificado() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-2xl bg-yellow-500 px-6 py-3 text-sm font-bold text-neutral-950 transition hover:bg-yellow-400 print:hidden"
    >
      Imprimir / Guardar como PDF
    </button>
  );
}