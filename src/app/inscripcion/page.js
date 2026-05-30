"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Inscripcion() {
  const whatsapp = "59898188257";

  const [formulario, setFormulario] = useState({
    nombre: "",
    telefono: "",
    email: "",
    curso: "Curso Básico Integral para Guías Caninos",
    modalidad: "Consultar modalidad",
    mensaje: "",
  });

  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState("");

  const actualizarCampo = (campo, valor) => {
    setFormulario({
      ...formulario,
      [campo]: valor,
    });
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setAviso("");

    const datosParaGuardar = {
      nombre: formulario.nombre,
      telefono: formulario.telefono,
      email: formulario.email || null,
      curso: formulario.curso,
      modalidad: formulario.modalidad,
      mensaje: formulario.mensaje || null,
      estado: "interesado",
    };

    const { error } = await supabase
      .from("inscripciones")
      .insert([datosParaGuardar]);

    if (error) {
      console.error("Error al guardar inscripción:", error);
      setAviso(
        "Hubo un problema al guardar la inscripción. Revisá la conexión con Supabase."
      );
      setEnviando(false);
      return;
    }

    const mensajeWhatsApp = `
Hola SERVICAN, quiero inscribirme o consultar por un curso.

Nombre: ${formulario.nombre}
Teléfono: ${formulario.telefono}
Email: ${formulario.email || "No especificado"}
Curso de interés: ${formulario.curso}
Modalidad preferida: ${formulario.modalidad}
Mensaje adicional: ${formulario.mensaje || "Sin mensaje adicional"}
`;

    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
      mensajeWhatsApp
    )}`;

    setAviso("Inscripción guardada correctamente. Se abrirá WhatsApp.");
    setEnviando(false);

    window.open(url, "_blank");
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* MENÚ */}
      <header className="sticky top-0 z-50 border-b border-yellow-500/20 bg-black/90 px-6 py-5 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img
              src="/logo-servican.jpeg"
              alt="Logo SERVICAN"
              className="h-12 w-12 rounded-full object-contain"
            />

            <div>
              <p className="font-black tracking-[0.25em] text-yellow-500">
                SERVICAN
              </p>
              <p className="text-xs text-zinc-400">Nuestro olfato nos define</p>
            </div>
          </a>

          <a
            href="/"
            className="rounded-full border border-yellow-500 px-5 py-3 text-sm font-black text-yellow-500 hover:bg-yellow-500 hover:text-black"
          >
            Volver al inicio
          </a>
        </div>
      </header>

      {/* PORTADA */}
      <section className="relative overflow-hidden px-6 py-16 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#3f3210_0%,#111_38%,#000_80%)]" />

        <div className="relative mx-auto max-w-4xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
            Inscripción
          </p>

          <h1 className="text-5xl font-black leading-tight md:text-7xl">
            Consultá o reservá tu lugar
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            Completá tus datos. La inscripción quedará guardada en el sistema y
            también se abrirá WhatsApp con el mensaje listo para enviar.
          </p>
        </div>
      </section>

      {/* FORMULARIO */}
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2">
          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Datos del alumno
            </p>

            <h2 className="text-3xl font-black">
              Formulario de consulta e inscripción
            </h2>

            <p className="mt-4 leading-7 text-zinc-300">
              Al enviar, los datos se guardan en Supabase y luego se abre
              WhatsApp para que puedas mandar la consulta directamente.
            </p>

            {aviso && (
              <div className="mt-6 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm font-bold text-yellow-500">
                {aviso}
              </div>
            )}

            <form onSubmit={enviarFormulario} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={formulario.nombre}
                  onChange={(e) => actualizarCampo("nombre", e.target.value)}
                  placeholder="Ej: Nahuel Cabrera"
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-5 py-4 text-white outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Teléfono
                </label>
                <input
                  type="text"
                  required
                  value={formulario.telefono}
                  onChange={(e) => actualizarCampo("telefono", e.target.value)}
                  placeholder="Ej: 098 188 257"
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-5 py-4 text-white outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Email
                </label>
                <input
                  type="email"
                  value={formulario.email}
                  onChange={(e) => actualizarCampo("email", e.target.value)}
                  placeholder="Ej: alumno@email.com"
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-5 py-4 text-white outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Curso de interés
                </label>
                <select
                  value={formulario.curso}
                  onChange={(e) => actualizarCampo("curso", e.target.value)}
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-5 py-4 text-white outline-none focus:border-yellow-500"
                >
                  <option>Curso Básico Integral para Guías Caninos</option>
                  <option>Módulo 2 K9 Antinarcóticos</option>
                  <option>Quiero consultar por ambos cursos</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Modalidad preferida
                </label>
                <select
                  value={formulario.modalidad}
                  onChange={(e) => actualizarCampo("modalidad", e.target.value)}
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-5 py-4 text-white outline-none focus:border-yellow-500"
                >
                  <option>Consultar modalidad</option>
                  <option>Presencial</option>
                  <option>Online</option>
                  <option>Mixta</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Mensaje adicional
                </label>
                <textarea
                  value={formulario.mensaje}
                  onChange={(e) => actualizarCampo("mensaje", e.target.value)}
                  placeholder="Ej: Quiero saber precios, fechas, duración y materiales incluidos."
                  rows="5"
                  className="w-full resize-none rounded-2xl border border-zinc-700 bg-black px-5 py-4 text-white outline-none focus:border-yellow-500"
                />
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full rounded-full bg-yellow-500 px-8 py-4 font-black text-black hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enviando
                  ? "Guardando inscripción..."
                  : "Guardar y enviar por WhatsApp"}
              </button>
            </form>
          </div>

          {/* INFORMACIÓN */}
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-yellow-500/30 bg-gradient-to-br from-zinc-950 to-black p-8">
              <h2 className="text-3xl font-black text-yellow-500">
                Información importante
              </h2>

              <div className="mt-6 space-y-4 text-zinc-300">
                <p>
                  <span className="font-bold text-white">Cursos:</span> pagos.
                </p>
                <p>
                  <span className="font-bold text-white">Precios:</span> se
                  consultan directamente.
                </p>
                <p>
                  <span className="font-bold text-white">Modalidad:</span>{" "}
                  presencial, online o mixta según disponibilidad.
                </p>
                <p>
                  <span className="font-bold text-white">Material:</span> PDF,
                  videos y recursos de apoyo.
                </p>
                <p>
                  <span className="font-bold text-white">Cupos:</span> sujetos a
                  disponibilidad.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8">
              <h3 className="text-2xl font-black text-yellow-500">
                ¿Qué pasa después de enviar?
              </h3>

              <ol className="mt-6 space-y-4 text-zinc-300">
                <li>
                  <span className="font-black text-yellow-500">1.</span> Tus
                  datos quedan guardados en la base de datos de SERVICAN.
                </li>
                <li>
                  <span className="font-black text-yellow-500">2.</span> Se abre
                  WhatsApp con tu consulta ya escrita.
                </li>
                <li>
                  <span className="font-black text-yellow-500">3.</span> Revisás
                  el mensaje antes de enviarlo.
                </li>
                <li>
                  <span className="font-black text-yellow-500">4.</span>{" "}
                  SERVICAN responde con precios, fechas y modalidad.
                </li>
              </ol>
            </div>

            <div className="rounded-[2rem] bg-yellow-500 p-8 text-black">
              <h3 className="text-2xl font-black">
                Nuestro olfato nos define
              </h3>
              <p className="mt-3 leading-7">
                Formación pensada para alumnos que buscan avanzar con una base
                seria, clara y progresiva.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}