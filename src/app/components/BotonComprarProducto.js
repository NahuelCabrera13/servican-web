"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function normalizarEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function leerRespuestaSegura(respuesta) {
  const texto = await respuesta.text();

  try {
    return JSON.parse(texto);
  } catch {
    return {
      error:
        "La API de pago respondió con una página de error en vez de JSON. Revisá la terminal o los logs de Vercel.",
      detalle: texto.slice(0, 500),
    };
  }
}

export default function BotonComprarProducto({ producto }) {
  const cantidadMaximaUsuarios = Number(
    producto?.cantidad_maxima_usuarios || 1
  );

  const cantidadParticipantes = Math.max(cantidadMaximaUsuarios - 1, 0);

  const requiereParticipantes =
    Boolean(producto?.requiere_participantes) || cantidadParticipantes > 0;

  const esRecurrente = Boolean(producto?.es_recurrente);

  const [participantes, setParticipantes] = useState(
    Array.from({ length: cantidadParticipantes }, () => "")
  );

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  function actualizarParticipante(index, valor) {
    setParticipantes((actuales) =>
      actuales.map((item, itemIndex) => (itemIndex === index ? valor : item))
    );
  }

  function validarParticipantes(compradorEmail) {
    if (!requiereParticipantes) {
      return [];
    }

    const emails = participantes.map(normalizarEmail).filter(Boolean);

    if (emails.length !== cantidadParticipantes) {
      throw new Error(
        `Este plan requiere ${cantidadParticipantes} participante${
          cantidadParticipantes === 1 ? "" : "s"
        } además del comprador.`
      );
    }

    const emailsUnicos = [...new Set(emails)];

    if (emailsUnicos.length !== emails.length) {
      throw new Error("No podés repetir correos de participantes.");
    }

    if (emailsUnicos.includes(normalizarEmail(compradorEmail))) {
      throw new Error(
        "No podés colocar tu propio correo como participante. El comprador ya cuenta como usuario."
      );
    }

    return emailsUnicos;
  }

  async function comprarProducto() {
    setCargando(true);
    setError("");

    try {
      if (!producto?.id) {
        throw new Error("No se encontró el ID del producto.");
      }

      if (esRecurrente) {
        throw new Error(
          "Este producto corresponde a una membresía mensual. Esa compra se activará desde el sistema de suscripciones."
        );
      }

      const supabase = createClient();

      const {
        data: { user },
        error: errorUsuario,
      } = await supabase.auth.getUser();

      if (errorUsuario || !user) {
        const destino = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?redirect=${destino}`;
        return;
      }

      const emailsParticipantes = validarParticipantes(user.email);

      const respuesta = await fetch("/api/pagos/crear-preferencia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          productoId: producto.id,
          participantes: emailsParticipantes,
        }),
      });

      const data = await leerRespuestaSegura(respuesta);

      if (!respuesta.ok) {
        if (respuesta.status === 401) {
          const destino = encodeURIComponent(window.location.pathname);
          window.location.href = `/login?redirect=${destino}`;
          return;
        }

        if (Array.isArray(data?.emails_no_registrados)) {
          setError(
            `No se puede continuar. Estos correos no tienen cuenta registrada: ${data.emails_no_registrados.join(
              ", "
            )}`
          );
        } else {
          setError(
            data?.error ||
              `No se pudo iniciar el pago. Código: ${respuesta.status}`
          );
        }

        console.error("Error de API pago:", {
          status: respuesta.status,
          data,
        });

        setCargando(false);
        return;
      }

      const urlPago = data.init_point || data.sandbox_init_point;

      if (!urlPago) {
        console.error("Respuesta sin link de pago:", data);
        setError("Mercado Pago no devolvió un link de pago.");
        setCargando(false);
        return;
      }

      window.location.href = urlPago;
    } catch (error) {
      console.error("Error iniciando compra:", error);
      setError(error?.message || "Error al iniciar el pago.");
      setCargando(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
      {requiereParticipantes && (
        <div className="mb-5 space-y-3">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-400">
              Participantes
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Este plan incluye al comprador y {cantidadParticipantes}{" "}
              participante{cantidadParticipantes === 1 ? "" : "s"} más. Todos
              los correos deben tener cuenta registrada en SERVICAN antes de
              comprar.
            </p>
          </div>

          {participantes.map((email, index) => (
            <input
              key={index}
              type="email"
              value={email}
              onChange={(event) =>
                actualizarParticipante(index, event.target.value)
              }
              placeholder={`Correo participante ${index + 1}`}
              disabled={cargando}
              className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          ))}
        </div>
      )}

      {esRecurrente && (
        <div className="mb-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm font-bold leading-6 text-yellow-100">
          Este producto será parte de la futura membresía mensual SERVICAN. Las
          suscripciones recurrentes se activarán en un bloque separado.
        </div>
      )}

      <button
        type="button"
        onClick={comprarProducto}
        disabled={cargando || esRecurrente}
        className="w-full rounded-full bg-yellow-500 px-7 py-4 text-center font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {cargando
          ? "Preparando pago..."
          : producto?.texto_boton || "Comprar"}
      </button>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold leading-6 text-red-200">
          {error}
        </div>
      )}
    </div>
  );
}