"use client";

function limpiarNombreArchivo(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/Ñ/g, "N")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 90);
}

export default function BotonImprimirCertificado({
  nombreAlumno = "Alumno-SERVICAN",
  tituloCurso = "Curso-SERVICAN",
  codigo = "certificado",
}) {
  function imprimirCertificado() {
    const tituloOriginal = document.title;

    const nombreLimpio = limpiarNombreArchivo(nombreAlumno);
    const cursoLimpio = limpiarNombreArchivo(tituloCurso);
    const codigoLimpio = limpiarNombreArchivo(codigo);

    document.title = `Certificado-SERVICAN-${nombreLimpio}-${cursoLimpio}-${codigoLimpio}`;

    window.print();

    setTimeout(() => {
      document.title = tituloOriginal;
    }, 1200);
  }

  return (
    <button
      type="button"
      onClick={imprimirCertificado}
      className="rounded-2xl bg-yellow-500 px-5 py-3 text-center text-sm font-black text-black transition hover:bg-yellow-400"
    >
      Imprimir / guardar PDF
    </button>
  );
}