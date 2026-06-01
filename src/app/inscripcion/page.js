"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import HeaderAcceso from "../components/HeaderAcceso";
import { createClient } from "@/lib/supabase/client";

function InscripcionContenido() {
  const whatsapp = "59898188257";
  const searchParams = useSearchParams();

  const cursoDesdeUrl = searchParams.get("curso");
  const mensajeDesdeUrl = searchParams.get("mensaje");

  const [formulario, setFormulario] = useState({
    nombre: "",
    telefono: "",
    email: "",
    tipoConsulta: "Consulta general",
    curso: "Consulta general",
    modalidad: "Consultar modalidad",
    mensaje: "",
  });

  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (cursoDesdeUrl || mensajeDesdeUrl) {
      setFormulario((formularioActual) => ({
        ...formularioActual,
        tipoConsulta: cursoDesdeUrl ? "Inscripción o consulta por curso" : formularioActual.tipoConsulta,
        curso: cursoDesdeUrl || formularioActual.curso,
        mensaje: mensajeDesdeUrl || formularioActual.mensaje,
      }));
    }
  }, [cursoDesdeUrl, mensajeDesdeUrl]);

  const actualizarCampo = (campo, valor) => {
    setFormulario((formularioActual) => ({
      ...formularioActual,
      [campo]: valor,
    }));
  };

  const limpiarTexto = (valor) => String(valor || "").trim();

  const enviarFormulario = async (e) => {
    e.preventDefault();

    setEnviando(true);
    setAviso("");
    setError("");

    const nombreLimpio = limpiarTexto(formulario.nombre);
    const telefonoLimpio = limpiarTexto(formulario.telefono);
    const emailLimpio = limpiarTexto(formulario.email).toLowerCase();
    const mensajeLimpio = limpiarTexto(formulario.mensaje);

    if (!nombreLimpio) {
      setError("Ingresá tu nombre completo.");
      setEnviando(false);
      return;
    }

    if (!telefonoLimpio) {
      setError("Ingresá tu teléfono para que SERVICAN pueda responderte.");
      setEnviando(false);
      return;
    }

    const mensajeCompleto = `
Tipo de consulta: ${formulario.tipoConsulta}
Mensaje adicional: ${mensajeLimpio || "Sin mensaje adicional"}
`;

    const datosParaGuardar = {
      nombre: nombreLimpio,
      telefono: telefonoLimpio,
      email: emailLimpio || null,
      curso: formulario.curso,
      modalidad: formulario.modalidad,
      mensaje: mensajeCompleto,
      estado: "interesado",
    };

    const supabase = createClient();

    const { error: errorSupabase } = await supabase
      .from("inscripciones")
      .insert([datosParaGuardar]);

    if (errorSupabase) {
      console.error("Error al guardar inscripción:", errorSupabase);
      setError(
        "Hubo un problema al guardar la consulta. Revisá la conexión con Supabase o la tabla inscripciones."
      );
      setEnviando(false);
      return;
    }

    const mensajeWhatsApp = `
Hola SERVICAN, quiero hacer una consulta.

Nombre: ${nombreLimpio}
Teléfono: ${telefonoLimpio}
Email: ${emailLimpio || "No especificado"}
Tipo de consulta: ${formulario.tipoConsulta}
Curso o tema de interés: ${formulario.curso}
Modalidad preferida: ${formulario.modalidad}
Mensaje adicional: ${mensajeLimpio || "Sin mensaje adicional"}
`;

    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
      mensajeWhatsApp
    )}`;

    setAviso("Consulta guardada correctamente. Se abrirá WhatsApp.");
    setEnviando(false);

    window.open(url, "_blank");
  };

  const opcionesConsulta = [
    "Consulta general",
    "Inscripción o consulta por curso",
    "Entrenamiento canino",
    "Servicio para empresa o institución",
    "Detección K9",
    "Asesoramiento",
    "Otra consulta",
  ];

  const opcionesInteres = [
    "Consulta general",
    "Guía Canino desde Cero",
    "K9 Antinarcóticos",
    "Adiestramiento y manejo",
    "Detección K9",
    "Servicio para empresa o institución",
    "Quiero consultar por varios cursos",
    "Otra consulta",
  ];

  const pasos = [
    {
      numero: "01",
      titulo: "Completás tus datos",
      texto: "Ingresás nombre, teléfono, email y el tipo de consulta que querés hacer.",
    },
    {
      numero: "02",
      titulo: "Se guarda en SERVICAN",
      texto: "La consulta queda registrada en la base de datos para poder hacer seguimiento.",
    },
    {
      numero: "03",
      titulo: "Se abre WhatsApp",
      texto: "El mensaje queda armado automáticamente para que puedas revisarlo y enviarlo.",
    },
    {
      numero: "04",
      titulo: "Recibís respuesta",
      texto: "SERVICAN responde con precios, fechas, cupos, modalidad o próximos pasos.",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-yellow-500/20 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Image
              src="/logo-servican.jpeg"
              alt="Logo SERVICAN"
              width={56}
              height={56}
              priority
              className="h-14 w-14 rounded-full object-contain"
            />

            <div>
              <p className="text-xl font-black tracking-[0.25em] text-yellow-500">
                SERVICAN
              </p>
              <p className="text-xs text-zinc-400">
                Nuestro olfato nos define
              </p>
            </div>
          </Link>

          <nav className="hidden gap-6 text-sm font-semibold text-zinc-300 lg:flex">
            <Link href="/" className="hover:text-yellow-500">
              Inicio
            </Link>

            <Link href="/cursos" className="hover:text-yellow-500">
              Cursos
            </Link>

            <Link href="/#servicios" className="hover:text-yellow-500">
              Servicios
            </Link>

            <Link href="/verificar-certificado" className="hover:text-yellow-500">
              Verificar certificado
            </Link>

            <Link href="/#contacto" className="hover:text-yellow-500">
              Contacto
            </Link>
          </nav>

          <HeaderAcceso />
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-zinc-900 px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#3f3210_0%,#111_36%,#000_80%)]" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black to-transparent" />

        <div className="relative mx-auto grid max-w-[1450px] gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Consulta SERVICAN
            </p>

            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              Consultá, reservá o solicitá información
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
              Completá tus datos para consultar por cursos, entrenamiento,
              servicios, detección K9, asesoramiento o propuestas para empresas
              e instituciones.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black text-yellow-500">Cursos</p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  Formación y programas privados
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black text-yellow-500">K9</p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  Detección y trabajo canino
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black text-yellow-500">Empresas</p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  Servicios e instituciones
                </p>
              </div>
            </div>

            {cursoDesdeUrl && (
              <div className="mt-8 max-w-2xl rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-5">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-500">
                  Curso seleccionado
                </p>

                <p className="mt-2 text-2xl font-black text-white">
                  {cursoDesdeUrl}
                </p>

                <p className="mt-2 text-sm leading-6 text-yellow-100">
                  El formulario ya fue preparado con este curso para que puedas
                  consultar más rápido.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-yellow-500/25 bg-black/60 p-6 shadow-2xl backdrop-blur-md md:p-8">
            <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-zinc-800 bg-zinc-950">
              <Image
                src="/fotos/galeria-trabajo-operativo-labrador.webp"
                alt="Trabajo canino SERVICAN"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-400">
                  Respuesta directa
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  Consulta guardada + WhatsApp
                </h2>
              </div>
            </div>

            <div className="rounded-3xl border border-yellow-500/25 bg-yellow-500/10 p-5">
              <h3 className="text-xl font-black text-yellow-400">
                Importante sobre cursos
              </h3>

              <p className="mt-3 leading-7 text-yellow-100">
                Crear una cuenta de alumno no habilita automáticamente cursos
                pagos. SERVICAN confirma la inscripción o el pago y luego activa
                el acceso desde el panel de administración.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1450px] gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 shadow-2xl sm:p-8">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Datos del interesado
            </p>

            <h2 className="text-3xl font-black md:text-4xl">
              Formulario de consulta e inscripción
            </h2>

            <p className="mt-4 leading-7 text-zinc-300">
              Al enviar, los datos quedan guardados en el sistema de SERVICAN y
              luego se abre WhatsApp con el mensaje listo para revisar y enviar.
            </p>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold leading-6 text-red-200">
                {error}
              </div>
            )}

            {aviso && (
              <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-sm font-bold leading-6 text-green-200">
                {aviso}
              </div>
            )}

            <form onSubmit={enviarFormulario} className="mt-8 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-300">
                    Nombre completo *
                  </label>

                  <input
                    type="text"
                    required
                    value={formulario.nombre}
                    onChange={(e) => actualizarCampo("nombre", e.target.value)}
                    placeholder="Ej: Nahuel Cabrera"
                    className="w-full rounded-2xl border border-zinc-700 bg-black px-5 py-4 text-white outline-none transition focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-300">
                    Teléfono *
                  </label>

                  <input
                    type="text"
                    required
                    value={formulario.telefono}
                    onChange={(e) =>
                      actualizarCampo("telefono", e.target.value)
                    }
                    placeholder="Ej: 098 188 257"
                    className="w-full rounded-2xl border border-zinc-700 bg-black px-5 py-4 text-white outline-none transition focus:border-yellow-500"
                  />
                </div>
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
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-5 py-4 text-white outline-none transition focus:border-yellow-500"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-300">
                    Tipo de consulta
                  </label>

                  <select
                    value={formulario.tipoConsulta}
                    onChange={(e) =>
                      actualizarCampo("tipoConsulta", e.target.value)
                    }
                    className="w-full rounded-2xl border border-zinc-700 bg-black px-5 py-4 text-white outline-none transition focus:border-yellow-500"
                  >
                    {opcionesConsulta.map((opcion) => (
                      <option key={opcion}>{opcion}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-300">
                    Curso o tema de interés
                  </label>

                  {cursoDesdeUrl ? (
                    <input
                      type="text"
                      value={formulario.curso}
                      onChange={(e) =>
                        actualizarCampo("curso", e.target.value)
                      }
                      className="w-full rounded-2xl border border-yellow-500/40 bg-yellow-500/10 px-5 py-4 font-bold text-yellow-100 outline-none transition focus:border-yellow-500"
                    />
                  ) : (
                    <select
                      value={formulario.curso}
                      onChange={(e) =>
                        actualizarCampo("curso", e.target.value)
                      }
                      className="w-full rounded-2xl border border-zinc-700 bg-black px-5 py-4 text-white outline-none transition focus:border-yellow-500"
                    >
                      {opcionesInteres.map((opcion) => (
                        <option key={opcion}>{opcion}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Modalidad preferida
                </label>

                <select
                  value={formulario.modalidad}
                  onChange={(e) => actualizarCampo("modalidad", e.target.value)}
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-5 py-4 text-white outline-none transition focus:border-yellow-500"
                >
                  <option>Consultar modalidad</option>
                  <option>Presencial</option>
                  <option>Online</option>
                  <option>Mixta</option>
                  <option>Servicio para empresa o institución</option>
                  <option>No estoy seguro</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Mensaje adicional
                </label>

                <textarea
                  value={formulario.mensaje}
                  onChange={(e) => actualizarCampo("mensaje", e.target.value)}
                  placeholder="Ej: Quiero saber precios, fechas, duración, requisitos, cupos o cómo funciona el servicio."
                  rows="6"
                  className="w-full resize-none rounded-2xl border border-zinc-700 bg-black px-5 py-4 text-white outline-none transition focus:border-yellow-500"
                />
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full rounded-full bg-yellow-500 px-8 py-4 font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enviando
                  ? "Guardando consulta..."
                  : "Guardar consulta y abrir WhatsApp"}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-yellow-500/30 bg-gradient-to-br from-zinc-950 to-black p-8">
              <h2 className="text-3xl font-black text-yellow-500">
                ¿Para qué podés consultar?
              </h2>

              <div className="mt-6 space-y-4 text-zinc-300">
                <p>
                  <span className="font-bold text-white">Cursos:</span>{" "}
                  programas de formación, modalidad, precios, fechas y cupos.
                </p>

                <p>
                  <span className="font-bold text-white">
                    Entrenamiento:
                  </span>{" "}
                  consultas sobre manejo, obediencia, vínculo y conducta.
                </p>

                <p>
                  <span className="font-bold text-white">K9:</span> orientación
                  sobre detección, trabajo olfativo y especialización canina.
                </p>

                <p>
                  <span className="font-bold text-white">Empresas:</span>{" "}
                  solicitudes para servicios, instituciones, equipos o trabajos
                  específicos.
                </p>

                <p>
                  <span className="font-bold text-white">
                    Asesoramiento:
                  </span>{" "}
                  dudas generales antes de elegir un curso o servicio.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8">
              <h3 className="text-2xl font-black text-yellow-500">
                ¿Qué pasa después de enviar?
              </h3>

              <ol className="mt-6 space-y-4 text-zinc-300">
                {pasos.map((paso) => (
                  <li key={paso.numero} className="leading-7">
                    <span className="font-black text-yellow-500">
                      {paso.numero}.
                    </span>{" "}
                    <span className="font-bold text-white">{paso.titulo}:</span>{" "}
                    {paso.texto}
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-[2rem] bg-yellow-500 p-8 text-black">
              <h3 className="text-2xl font-black">
                Nuestro olfato nos define
              </h3>

              <p className="mt-3 leading-7">
                Formación y trabajo canino con una base seria, clara y
                progresiva. SERVICAN responde la consulta y te orienta según tu
                objetivo.
              </p>

              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                  "Hola SERVICAN, quiero hacer una consulta."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block rounded-full bg-black px-7 py-4 font-black text-white transition hover:bg-zinc-800"
              >
                WhatsApp directo
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-900 bg-zinc-950 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1450px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
              Acceso privado
            </p>

            <h2 className="text-4xl font-black md:text-5xl">
              Registro, cursos y habilitación
            </h2>

            <p className="mt-4 leading-8 text-zinc-300">
              La consulta no crea automáticamente una inscripción confirmada. Si
              corresponde a un curso pago o privado, SERVICAN confirma primero
              los datos y luego habilita el acceso del alumno desde el panel.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-zinc-800 bg-black p-7">
              <p className="text-4xl">👤</p>
              <h3 className="mt-4 text-xl font-black text-yellow-500">
                Cuenta de alumno
              </h3>
              <p className="mt-3 leading-7 text-zinc-300">
                El alumno puede crear su cuenta, pero eso no activa cursos
                automáticamente.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black p-7">
              <p className="text-4xl">🛡️</p>
              <h3 className="mt-4 text-xl font-black text-yellow-500">
                Confirmación manual
              </h3>
              <p className="mt-3 leading-7 text-zinc-300">
                SERVICAN confirma inscripción, pago, cupo o condición antes de
                habilitar el acceso.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black p-7">
              <p className="text-4xl">🔐</p>
              <h3 className="mt-4 text-xl font-black text-yellow-500">
                Panel privado
              </h3>
              <p className="mt-3 leading-7 text-zinc-300">
                Una vez habilitado, el alumno puede ver cursos, clases,
                materiales y certificados desde su panel.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-900 px-6 py-10 text-center">
        <p className="text-xl font-black tracking-[0.25em] text-yellow-500">
          SERVICAN
        </p>

        <p className="mt-2 text-zinc-500">Nuestro olfato nos define</p>

        <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm font-semibold text-zinc-400">
          <Link href="/" className="hover:text-yellow-500">
            Inicio
          </Link>

          <Link href="/cursos" className="hover:text-yellow-500">
            Cursos
          </Link>

          <Link href="/verificar-certificado" className="hover:text-yellow-500">
            Verificar certificado
          </Link>

          <Link href="/login" className="hover:text-yellow-500">
            Iniciar sesión
          </Link>
        </div>

        <p className="mt-4 text-sm text-zinc-600">
          © 2026 SERVICAN. Todos los derechos reservados.
        </p>
      </footer>
    </main>
  );
}

function CargandoInscripcion() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-[2rem] border border-yellow-500/30 bg-zinc-950 p-8 text-center">
          <Image
            src="/logo-servican.jpeg"
            alt="Logo SERVICAN"
            width={80}
            height={80}
            priority
            className="mx-auto h-20 w-20 rounded-full object-contain"
          />

          <p className="mt-5 text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
            SERVICAN
          </p>

          <h1 className="mt-3 text-3xl font-black">Cargando formulario...</h1>
        </div>
      </section>
    </main>
  );
}

export default function Inscripcion() {
  return (
    <Suspense fallback={<CargandoInscripcion />}>
      <InscripcionContenido />
    </Suspense>
  );
}