"use client";

import { useState } from "react";

export default function SincronizarMembresiaClient() {
  const [id, setId] = useState("");
  const [preapprovalId, setPreapprovalId] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState(null);

  async function sincronizar(event) {
    event.preventDefault();

    setCargando(true);
    setError("");
    setResultado(null);

    try {
      const respuesta = await fetch("/api/admin/membresia/sincronizar", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id.trim(),
          preapproval_id: preapprovalId.trim(),
        }),
      });

      const data = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo sincronizar la membresía.");
        return;
      }

      setResultado(data);
    } catch (error) {
      console.error("Error sincronizando:", error);
      setError("Error de conexión al sincronizar la membresía.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <form
      onSubmit={sincronizar}
      className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6"
    >
      <div className="grid gap-5">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-500">
            Sincronización manual
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Consultar Mercado Pago y actualizar estado
          </h2>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Podés completar solo uno de los dos campos. Lo más fácil es copiar
            el ID de la membresía desde la página de membresías.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {resultado ? (
          <ResultadoSincronizacion resultado={resultado} />
        ) : null}

        <div>
          <label className="text-sm font-bold text-zinc-300">
            ID de membresía en SERVICAN
          </label>

          <input
            type="text"
            value={id}
            onChange={(event) => setId(event.target.value)}
            placeholder="Ejemplo: 0756e49f-b44b-4962-9115-a6b02cadfcdb"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-yellow-500"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-zinc-300">
            Preapproval ID de Mercado Pago
          </label>

          <input
            type="text"
            value={preapprovalId}
            onChange={(event) => setPreapprovalId(event.target.value)}
            placeholder="Ejemplo: 8ded3b4d39784d6e9d4a94ce2bb65eeb"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-yellow-500"
          />
        </div>

        <button
          type="submit"
          disabled={cargando || (!id.trim() && !preapprovalId.trim())}
          className="rounded-2xl bg-yellow-500 px-6 py-3 text-sm font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cargando ? "Sincronizando..." : "Sincronizar membresía"}
        </button>
      </div>
    </form>
  );
}

function ResultadoSincronizacion({ resultado }) {
  const membresia = resultado?.membresia;
  const mercadoPago = resultado?.mercadopago;

  return (
    <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-5">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-green-300">
        Sincronización completada
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Dato titulo="Estado SERVICAN" valor={membresia?.estado || "—"} />
        <Dato
          titulo="Estado Mercado Pago"
          valor={mercadoPago?.status || membresia?.mercadopago_status || "—"}
        />
        <Dato
          titulo="Preapproval"
          valor={mercadoPago?.preapproval_id || membresia?.mercadopago_preapproval_id || "—"}
        />
        <Dato titulo="ID membresía" valor={membresia?.id || "—"} />
      </div>

      {membresia?.estado === "activa" ? (
        <p className="mt-4 rounded-2xl border border-green-500/30 bg-black/30 p-3 text-sm text-green-100">
          La membresía quedó activa. El usuario ya debería poder entrar a la
          galería privada y recibir beneficios de membresía.
        </p>
      ) : (
        <p className="mt-4 rounded-2xl border border-yellow-500/30 bg-black/30 p-3 text-sm text-yellow-100">
          La membresía no quedó activa. Mercado Pago todavía no devolvió estado
          autorizado/aprobado para esta suscripción.
        </p>
      )}
    </div>
  );
}

function Dato({ titulo, valor }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
        {titulo}
      </p>

      <p className="mt-2 break-all text-sm font-bold text-white">
        {valor}
      </p>
    </div>
  );
}