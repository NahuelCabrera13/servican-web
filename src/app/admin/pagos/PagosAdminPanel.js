"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const ESTADOS_PAGO = {
  approved: {
    nombre: "Aprobado",
    clases: "border-green-500/30 bg-green-500/10 text-green-200",
  },
  pending: {
    nombre: "Pendiente",
    clases: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
  },
  in_process: {
    nombre: "En proceso",
    clases: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
  },
  rejected: {
    nombre: "Rechazado",
    clases: "border-red-500/30 bg-red-500/10 text-red-200",
  },
  cancelled: {
    nombre: "Cancelado",
    clases: "border-red-500/30 bg-red-500/10 text-red-200",
  },
  refunded: {
    nombre: "Devuelto",
    clases: "border-red-500/30 bg-red-500/10 text-red-200",
  },
  charged_back: {
    nombre: "Contracargo",
    clases: "border-red-500/30 bg-red-500/10 text-red-200",
  },
  pendiente: {
    nombre: "Pendiente",
    clases: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
  },
};

const PLANES = {
  basico: "Básico",
  extenso: "Extenso",
  pro: "Pro",
  plantel: "Plantel",
};

function rellenarDosDigitos(numero) {
  return String(numero).padStart(2, "0");
}

function formatearFecha(fecha) {
  if (!fecha) return "—";

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const dia = rellenarDosDigitos(date.getDate());
  const mes = rellenarDosDigitos(date.getMonth() + 1);
  const anio = date.getFullYear();
  const hora = rellenarDosDigitos(date.getHours());
  const minutos = rellenarDosDigitos(date.getMinutes());

  return `${dia}/${mes}/${anio} ${hora}:${minutos}`;
}

function formatearMoneda(monto, moneda) {
  const numero = Number(monto || 0);

  if (!numero) return "—";

  return `${moneda || "UYU"} ${Math.round(numero).toLocaleString("es-UY")}`;
}

function normalizarTexto(texto) {
  return String(texto || "").trim().toLowerCase();
}

function obtenerEstadoPago(estado) {
  const clave = normalizarTexto(estado);

  return (
    ESTADOS_PAGO[clave] || {
      nombre: estado || "Desconocido",
      clases: "border-white/10 bg-white/10 text-zinc-200",
    }
  );
}

function obtenerNombreProducto(pago) {
  return (
    pago?.productos?.nombre ||
    pago?.detalle?.producto?.nombre ||
    pago?.tipo_producto ||
    "Producto SERVICAN"
  );
}

function obtenerNombreCurso(pago) {
  return (
    pago?.cursos?.titulo ||
    pago?.detalle?.producto?.cursos?.titulo ||
    pago?.detalle?.producto?.titulo ||
    "—"
  );
}

function obtenerParticipantes(pago) {
  const participantes = pago?.participantes;

  if (Array.isArray(participantes)) {
    return participantes;
  }

  return [];
}

function pagoTieneAcceso(pago, accesos) {
  if (!pago?.id) return false;

  return accesos.some((acceso) => acceso.pago_id === pago.id);
}

function obtenerAccesosPago(pago, accesos) {
  if (!pago?.id) return [];

  return accesos.filter((acceso) => acceso.pago_id === pago.id);
}

function EstadoBadge({ estado }) {
  const estadoPago = obtenerEstadoPago(estado);

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${estadoPago.clases}`}
    >
      {estadoPago.nombre}
    </span>
  );
}

function AccesoBadge({ pago, accesos }) {
  const aprobado = normalizarTexto(pago?.estado) === "approved";
  const tieneAcceso = pagoTieneAcceso(pago, accesos);

  if (!aprobado) {
    return (
      <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-zinc-300">
        No aplica
      </span>
    );
  }

  if (tieneAcceso) {
    return (
      <span className="inline-flex rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-green-200">
        Acceso habilitado
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-red-200">
      Revisar acceso
    </span>
  );
}

export default function PagosAdminPanel({
  pagosIniciales = [],
  accesosIniciales = [],
  errorInicial = "",
}) {
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [pagoAbiertoId, setPagoAbiertoId] = useState(null);

  const resumen = useMemo(() => {
    const total = pagosIniciales.length;

    const aprobados = pagosIniciales.filter(
      (pago) => normalizarTexto(pago.estado) === "approved"
    ).length;

    const pendientes = pagosIniciales.filter((pago) =>
      ["pending", "in_process", "pendiente"].includes(
        normalizarTexto(pago.estado)
      )
    ).length;

    const rechazados = pagosIniciales.filter((pago) =>
      ["rejected", "cancelled", "refunded", "charged_back"].includes(
        normalizarTexto(pago.estado)
      )
    ).length;

    const montoAprobado = pagosIniciales
      .filter((pago) => normalizarTexto(pago.estado) === "approved")
      .reduce((totalMonto, pago) => totalMonto + Number(pago.monto || 0), 0);

    const aprobadosSinAcceso = pagosIniciales.filter(
      (pago) =>
        normalizarTexto(pago.estado) === "approved" &&
        !pagoTieneAcceso(pago, accesosIniciales)
    ).length;

    return {
      total,
      aprobados,
      pendientes,
      rechazados,
      montoAprobado,
      aprobadosSinAcceso,
    };
  }, [pagosIniciales, accesosIniciales]);

  const pagosFiltrados = useMemo(() => {
    const texto = normalizarTexto(busqueda);

    return pagosIniciales.filter((pago) => {
      const coincideBusqueda =
        !texto ||
        normalizarTexto(pago.email).includes(texto) ||
        normalizarTexto(obtenerNombreProducto(pago)).includes(texto) ||
        normalizarTexto(obtenerNombreCurso(pago)).includes(texto) ||
        normalizarTexto(pago.mercadopago_payment_id).includes(texto) ||
        normalizarTexto(pago.mercadopago_preference_id).includes(texto);

      const estado = normalizarTexto(pago.estado);

      const coincideEstado =
        estadoFiltro === "todos" ||
        (estadoFiltro === "aprobados" && estado === "approved") ||
        (estadoFiltro === "pendientes" &&
          ["pending", "in_process", "pendiente"].includes(estado)) ||
        (estadoFiltro === "rechazados" &&
          ["rejected", "cancelled", "refunded", "charged_back"].includes(
            estado
          )) ||
        (estadoFiltro === "sin_acceso" &&
          estado === "approved" &&
          !pagoTieneAcceso(pago, accesosIniciales));

      return coincideBusqueda && coincideEstado;
    });
  }, [pagosIniciales, accesosIniciales, busqueda, estadoFiltro]);

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-yellow-500/20 bg-black/95">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
          <Link href="/admin" className="flex items-center gap-4">
            <img
              src="/logo-servican.jpeg"
              alt="Logo SERVICAN"
              className="h-16 w-16 rounded-full object-contain"
            />

            <div>
              <p className="text-xl font-black tracking-[0.25em] text-yellow-500">
                SERVICAN
              </p>
              <p className="text-sm text-zinc-400">Administración de pagos</p>
            </div>
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/20"
            >
              Volver al admin
            </Link>

            <Link
              href="/admin/usuarios"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/20"
            >
              Usuarios
            </Link>

            <Link
              href="/admin/certificados"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/20"
            >
              Certificados
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-zinc-900 bg-gradient-to-br from-zinc-950 via-black to-zinc-950 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-500">
            Ventas y accesos
          </p>

          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            Historial de pagos
          </h1>

          <p className="mt-5 max-w-3xl leading-8 text-zinc-300">
            Desde acá podés revisar pagos de Mercado Pago, productos vendidos,
            participantes, estados y si el curso quedó habilitado
            automáticamente.
          </p>

          {errorInicial && (
            <div className="mt-6 rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
              <p className="font-black">Error cargando pagos</p>
              <p className="mt-2 text-sm">{errorInicial}</p>
            </div>
          )}

          <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-400">Total pagos</p>
              <p className="mt-2 text-4xl font-black text-yellow-500">
                {resumen.total}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-400">Aprobados</p>
              <p className="mt-2 text-4xl font-black text-green-400">
                {resumen.aprobados}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-400">Pendientes</p>
              <p className="mt-2 text-4xl font-black text-yellow-400">
                {resumen.pendientes}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-400">Rechazados</p>
              <p className="mt-2 text-4xl font-black text-red-400">
                {resumen.rechazados}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-400">Aprobado $</p>
              <p className="mt-2 text-3xl font-black text-green-400">
                {formatearMoneda(resumen.montoAprobado, "UYU")}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-400">Revisar</p>
              <p className="mt-2 text-4xl font-black text-red-400">
                {resumen.aprobadosSinAcceso}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-8 grid gap-4 rounded-[2rem] border border-white/10 bg-zinc-950 p-5 lg:grid-cols-[1fr_auto]">
            <input
              type="text"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por email, producto, curso, payment ID o preference ID..."
              className="rounded-2xl border border-white/10 bg-black px-5 py-4 text-sm text-white outline-none transition focus:border-yellow-400"
            />

            <select
              value={estadoFiltro}
              onChange={(event) => setEstadoFiltro(event.target.value)}
              className="rounded-2xl border border-white/10 bg-black px-5 py-4 text-sm text-white outline-none transition focus:border-yellow-400"
            >
              <option value="todos">Todos los estados</option>
              <option value="aprobados">Aprobados</option>
              <option value="pendientes">Pendientes</option>
              <option value="rechazados">Rechazados / cancelados</option>
              <option value="sin_acceso">Aprobados sin acceso</option>
            </select>
          </div>

          {pagosFiltrados.length === 0 && (
            <div className="rounded-[2rem] border border-white/10 bg-zinc-950 p-10 text-center">
              <h2 className="text-3xl font-black">
                No hay pagos para mostrar
              </h2>

              <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-400">
                Cuando se creen pagos o cambies los filtros, aparecerán en esta
                sección.
              </p>
            </div>
          )}

          <div className="space-y-5">
            {pagosFiltrados.map((pago) => {
              const abierto = pagoAbiertoId === pago.id;
              const participantes = obtenerParticipantes(pago);
              const accesosPago = obtenerAccesosPago(pago, accesosIniciales);
              const producto = obtenerNombreProducto(pago);
              const curso = obtenerNombreCurso(pago);
              const plan =
                PLANES[pago?.productos?.plan] ||
                PLANES[pago?.detalle?.producto?.plan] ||
                pago?.productos?.plan ||
                pago?.detalle?.producto?.plan ||
                "—";

              return (
                <article
                  key={pago.id}
                  className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setPagoAbiertoId((actual) =>
                        actual === pago.id ? null : pago.id
                      )
                    }
                    className="w-full p-5 text-left transition hover:bg-white/[0.03]"
                  >
                    <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr_auto] xl:items-center">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <EstadoBadge estado={pago.estado} />
                          <AccesoBadge pago={pago} accesos={accesosIniciales} />

                          {participantes.length > 0 && (
                            <span className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-blue-200">
                              {participantes.length} participante
                              {participantes.length === 1 ? "" : "s"}
                            </span>
                          )}
                        </div>

                        <h2 className="mt-4 text-2xl font-black">
                          {producto}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-zinc-400">
                          Comprador:{" "}
                          <span className="font-bold text-zinc-200">
                            {pago.email || "—"}
                          </span>
                        </p>

                        <p className="mt-1 text-sm leading-6 text-zinc-500">
                          Fecha: {formatearFecha(pago.created_at)}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                            Monto
                          </p>
                          <p className="mt-1 text-xl font-black text-yellow-400">
                            {formatearMoneda(pago.monto, pago.moneda)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                            Curso
                          </p>
                          <p className="mt-1 text-sm font-bold text-zinc-200">
                            {curso}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                            Plan
                          </p>
                          <p className="mt-1 text-sm font-bold text-zinc-200">
                            {plan}
                          </p>
                        </div>
                      </div>

                      <div className="text-sm font-bold text-zinc-400">
                        {abierto ? "Cerrar detalle" : "Ver detalle"}
                      </div>
                    </div>
                  </button>

                  {abierto && (
                    <div className="border-t border-white/10 bg-black p-5">
                      <div className="grid gap-5 lg:grid-cols-2">
                        <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
                          <h3 className="text-xl font-black">
                            Datos del pago
                          </h3>

                          <div className="mt-5 space-y-3 text-sm">
                            <p>
                              <span className="font-bold text-zinc-500">
                                ID interno:
                              </span>{" "}
                              {pago.id}
                            </p>

                            <p>
                              <span className="font-bold text-zinc-500">
                                Mercado Pago payment ID:
                              </span>{" "}
                              {pago.mercadopago_payment_id || "—"}
                            </p>

                            <p>
                              <span className="font-bold text-zinc-500">
                                Mercado Pago preference ID:
                              </span>{" "}
                              {pago.mercadopago_preference_id || "—"}
                            </p>

                            <p>
                              <span className="font-bold text-zinc-500">
                                Estado:
                              </span>{" "}
                              {pago.estado || "—"}
                            </p>

                            <p>
                              <span className="font-bold text-zinc-500">
                                Tipo producto:
                              </span>{" "}
                              {pago.tipo_producto || "—"}
                            </p>

                            <p>
                              <span className="font-bold text-zinc-500">
                                Actualizado:
                              </span>{" "}
                              {formatearFecha(pago.updated_at)}
                            </p>
                          </div>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
                          <h3 className="text-xl font-black">
                            Accesos generados
                          </h3>

                          {accesosPago.length === 0 && (
                            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm leading-6 text-red-200">
                              No se encontraron accesos vinculados a este pago.
                              Si el pago está aprobado, conviene revisar el
                              webhook o la tabla alumno_cursos.
                            </div>
                          )}

                          {accesosPago.length > 0 && (
                            <div className="mt-5 space-y-3">
                              {accesosPago.map((acceso) => (
                                <div
                                  key={acceso.id}
                                  className="rounded-2xl border border-white/10 bg-black p-4 text-sm"
                                >
                                  <p>
                                    <span className="font-bold text-zinc-500">
                                      Usuario:
                                    </span>{" "}
                                    {acceso.user_id}
                                  </p>

                                  <p className="mt-2">
                                    <span className="font-bold text-zinc-500">
                                      Curso:
                                    </span>{" "}
                                    {acceso.curso_id}
                                  </p>

                                  <p className="mt-2">
                                    <span className="font-bold text-zinc-500">
                                      Estado:
                                    </span>{" "}
                                    {acceso.estado || "—"}
                                  </p>

                                  <p className="mt-2">
                                    <span className="font-bold text-zinc-500">
                                      Nivel:
                                    </span>{" "}
                                    {PLANES[acceso.nivel_acceso] ||
                                      acceso.nivel_acceso ||
                                      "Básico"}
                                  </p>

                                  <p className="mt-2">
                                    <span className="font-bold text-zinc-500">
                                      Acceso grupal:
                                    </span>{" "}
                                    {acceso.acceso_grupal ? "Sí" : "No"}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </section>
                      </div>

                      {participantes.length > 0 && (
                        <section className="mt-5 rounded-3xl border border-white/10 bg-zinc-950 p-5">
                          <h3 className="text-xl font-black">
                            Participantes del plan
                          </h3>

                          <div className="mt-5 grid gap-3 md:grid-cols-2">
                            {participantes.map((participante, index) => (
                              <div
                                key={`${participante.email}-${index}`}
                                className="rounded-2xl border border-white/10 bg-black p-4 text-sm"
                              >
                                <p className="font-bold">
                                  {participante.email || "Sin email"}
                                </p>

                                <p className="mt-2 text-zinc-500">
                                  User ID: {participante.user_id || "—"}
                                </p>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      <section className="mt-5 rounded-3xl border border-white/10 bg-zinc-950 p-5">
                        <h3 className="text-xl font-black">
                          Información técnica
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-zinc-400">
                          Este bloque sirve para revisar problemas de Mercado
                          Pago, metadata, webhook o desbloqueo automático.
                        </p>

                        <pre className="mt-5 max-h-96 overflow-auto rounded-2xl border border-white/10 bg-black p-4 text-xs leading-6 text-zinc-300">
                          {JSON.stringify(
                            {
                              pago,
                              accesos: accesosPago,
                            },
                            null,
                            2
                          )}
                        </pre>
                      </section>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}