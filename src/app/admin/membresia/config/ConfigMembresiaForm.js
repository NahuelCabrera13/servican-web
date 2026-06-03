"use client";

import { useEffect, useState } from "react";

const estadoInicial = {
  nombre: "",
  descripcion: "",
  precio: "",
  moneda: "UYU",
  texto_boton: "",
  activo: true,
  visible_en_web: true,
  destacado: true,
};

export default function ConfigMembresiaForm() {
  const [form, setForm] = useState(estadoInicial);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function cargarProducto() {
    setCargando(true);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetch("/api/admin/membresia/producto", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo cargar el producto.");
        return;
      }

      const producto = data?.producto;

      if (!producto) {
        setError("No se encontró el producto de membresía.");
        return;
      }

      setForm({
        nombre: producto.nombre || "",
        descripcion: producto.descripcion || "",
        precio: producto.precio || "",
        moneda: producto.moneda || "UYU",
        texto_boton: producto.texto_boton || "",
        activo: Boolean(producto.activo),
        visible_en_web: Boolean(producto.visible_en_web),
        destacado: Boolean(producto.destacado),
      });
    } catch (error) {
      console.error("Error cargando producto:", error);
      setError("Error de conexión al cargar la membresía.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarProducto();
  }, []);

  function cambiarCampo(campo, valor) {
    setForm((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  async function guardarCambios(event) {
    event.preventDefault();

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetch("/api/admin/membresia/producto", {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: form.nombre,
          descripcion: form.descripcion,
          precio: Number(form.precio),
          moneda: form.moneda,
          texto_boton: form.texto_boton,
          activo: form.activo,
          visible_en_web: form.visible_en_web,
          destacado: form.destacado,
        }),
      });

      const data = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        setError(data?.error || "No se pudo guardar la configuración.");
        return;
      }

      setMensaje("Configuración de membresía guardada correctamente.");

      if (data?.producto) {
        setForm({
          nombre: data.producto.nombre || "",
          descripcion: data.producto.descripcion || "",
          precio: data.producto.precio || "",
          moneda: data.producto.moneda || "UYU",
          texto_boton: data.producto.texto_boton || "",
          activo: Boolean(data.producto.activo),
          visible_en_web: Boolean(data.producto.visible_en_web),
          destacado: Boolean(data.producto.destacado),
        });
      }
    } catch (error) {
      console.error("Error guardando producto:", error);
      setError("Error de conexión al guardar la membresía.");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6">
        <p className="text-sm font-bold text-zinc-400">
          Cargando configuración de membresía...
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={guardarCambios}
      className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6"
    >
      <div className="grid gap-5">
        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {mensaje ? (
          <div className="rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">
            {mensaje}
          </div>
        ) : null}

        <CampoTexto
          label="Nombre"
          value={form.nombre}
          onChange={(valor) => cambiarCampo("nombre", valor)}
          placeholder="Membresía mensual SERVICAN"
        />

        <CampoArea
          label="Descripción"
          value={form.descripcion}
          onChange={(valor) => cambiarCampo("descripcion", valor)}
          placeholder="Acceso mensual a contenido privado..."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <CampoTexto
            label="Precio mensual"
            type="number"
            value={form.precio}
            onChange={(valor) => cambiarCampo("precio", valor)}
            placeholder="990"
          />

          <div>
            <label className="text-sm font-bold text-zinc-300">
              Moneda
            </label>

            <select
              value={form.moneda}
              onChange={(event) => cambiarCampo("moneda", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-500"
            >
              <option value="UYU">UYU</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        <CampoTexto
          label="Texto del botón"
          value={form.texto_boton}
          onChange={(valor) => cambiarCampo("texto_boton", valor)}
          placeholder="Contratar membresía mensual"
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Checkbox
            label="Activa para comprar"
            checked={form.activo}
            onChange={(valor) => cambiarCampo("activo", valor)}
          />

          <Checkbox
            label="Visible en la web"
            checked={form.visible_en_web}
            onChange={(valor) => cambiarCampo("visible_en_web", valor)}
          />

          <Checkbox
            label="Destacada"
            checked={form.destacado}
            onChange={(valor) => cambiarCampo("destacado", valor)}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-zinc-500">
            Estos cambios se guardan en Supabase y serán usados por la API al
            crear nuevas suscripciones.
          </p>

          <button
            type="submit"
            disabled={guardando}
            className="rounded-2xl bg-yellow-500 px-6 py-3 text-sm font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {guardando ? "Guardando..." : "Guardar configuración"}
          </button>
        </div>
      </div>
    </form>
  );
}

function CampoTexto({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}) {
  return (
    <div>
      <label className="text-sm font-bold text-zinc-300">{label}</label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-yellow-500"
      />
    </div>
  );
}

function CampoArea({ label, value, onChange, placeholder = "" }) {
  return (
    <div>
      <label className="text-sm font-bold text-zinc-300">{label}</label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-yellow-500"
      />
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black px-4 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4"
      />

      <span className="text-sm font-bold text-zinc-300">{label}</span>
    </label>
  );
}