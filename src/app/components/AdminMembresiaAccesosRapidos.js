import Link from "next/link";

function AccesoRapido({ href, icono, titulo, descripcion, color = "yellow" }) {
  const estilos = {
    yellow:
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-100 hover:bg-yellow-500/20",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-100 hover:bg-blue-500/20",
    green:
      "border-green-500/30 bg-green-500/10 text-green-100 hover:bg-green-500/20",
    purple:
      "border-purple-500/30 bg-purple-500/10 text-purple-100 hover:bg-purple-500/20",
    neutral:
      "border-white/10 bg-white/10 text-zinc-100 hover:bg-white/20",
  };

  return (
    <Link
      href={href}
      className={`rounded-3xl border p-5 transition ${estilos[color] || estilos.yellow}`}
    >
      <p className="text-3xl">{icono}</p>

      <h3 className="mt-3 text-xl font-black">{titulo}</h3>

      <p className="mt-2 text-sm leading-6 opacity-90">{descripcion}</p>
    </Link>
  );
}

export default function AdminMembresiaAccesosRapidos() {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-zinc-950 p-4">
      <div className="mb-4 flex flex-col gap-2 px-1">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
          Accesos rápidos
        </p>

        <h2 className="text-2xl font-black text-white">
          Membresía, packs y gestión comercial
        </h2>

        <p className="max-w-4xl text-sm leading-6 text-zinc-400">
          Desde estos accesos podés administrar la membresía mensual, la galería
          privada, la sincronización de pagos y generar los packs principales de
          cursos.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <AccesoRapido
          href="/admin/membresia"
          icono="⭐"
          titulo="Membresía"
          descripcion="Ver estado general de membresías y accesos."
          color="yellow"
        />

        <AccesoRapido
          href="/admin/membresia/config"
          icono="⚙️"
          titulo="Configurar"
          descripcion="Ajustar precio, beneficios y datos de membresía."
          color="blue"
        />

        <AccesoRapido
          href="/admin/membresia/galeria"
          icono="🖼️"
          titulo="Galería"
          descripcion="Subir y ordenar fotos/videos privados."
          color="green"
        />

        <AccesoRapido
          href="/admin/membresia/sincronizar"
          icono="🔄"
          titulo="Sincronizar"
          descripcion="Revisar pagos y actualizar accesos."
          color="purple"
        />

        <AccesoRapido
          href="/admin/packs"
          icono="🎁"
          titulo="Packs"
          descripcion="Generar Pack Básico y Pack Pro."
          color="yellow"
        />
      </div>
    </section>
  );
}