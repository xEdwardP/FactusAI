"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { getSafeApiMessage } from "@/lib/client-errors"
import type { Catalogos, FacturaFormValues } from "@/types/factura"

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-brand/15 focus:border-brand/60 transition-all"

const defaultValues: FacturaFormValues = {
  fecha: new Date().toISOString().slice(0, 10),
  proveedor: "",
  monto: "",
  categoriaGastoId: "",
  tipoMovimiento: "Gasto",
  tipoFactura: "Contado",
  tipoDocumentoId: "",
  observaciones: "",
  imagen: null,
}

type Props = {
  initialValues?: Partial<FacturaFormValues>
  onSubmit: (values: FacturaFormValues) => Promise<void>
  submitLabel?: string
  showFileUpload?: boolean
}

export default function FacturaForm({
  initialValues,
  onSubmit,
  submitLabel = "Guardar factura",
  showFileUpload = false,
}: Props) {
  const [values, setValues] = useState<FacturaFormValues>({
    ...defaultValues,
    ...initialValues,
  })
  const [catalogos, setCatalogos] = useState<Catalogos | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/catalogos")
      .then((r) => r.json())
      .then((data: Catalogos) => {
        setCatalogos(data)
        setValues((prev) => ({
          ...prev,
          categoriaGastoId:
            prev.categoriaGastoId ||
            String(data.categorias[0]?.id ?? ""),
          tipoDocumentoId:
            prev.tipoDocumentoId ||
            String(
              data.tiposDocumento.find((t) => t.nombre === "Factura")?.id ??
                data.tiposDocumento[0]?.id ??
                ""
            ),
        }))
      })
      .catch(() => setError("No se pudieron cargar los catálogos."))
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/facturas/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(getSafeApiMessage(res.status, data.message))
      }

      setValues((prev) => ({ ...prev, imagen: data.path }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir.")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await onSubmit(values)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.")
    } finally {
      setLoading(false)
    }
  }

  if (!catalogos) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500">
        <Loader2 className="animate-spin mr-2" size={20} />
        Cargando formulario…
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {showFileUpload && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Archivo (imagen o PDF)
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand file:text-white file:font-medium hover:file:bg-brand-light"
          />
          {uploading && (
            <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
              <Loader2 size={14} className="animate-spin" />
              Subiendo archivo…
            </p>
          )}
          {values.imagen && !uploading && (
            <p className="mt-2 text-xs text-emerald-600">
              Archivo subido correctamente.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Fecha
          </label>
          <input
            type="date"
            required
            value={values.fecha}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, fecha: e.target.value }))
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Monto (S/)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={values.monto}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, monto: e.target.value }))
            }
            placeholder="0.00"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Proveedor
        </label>
        <input
          type="text"
          required
          maxLength={150}
          value={values.proveedor}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, proveedor: e.target.value }))
          }
          placeholder="Nombre del proveedor o comercio"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Categoría
          </label>
          <select
            required
            value={values.categoriaGastoId}
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                categoriaGastoId: e.target.value,
              }))
            }
            className={inputClass}
          >
            <option value="">Seleccionar…</option>
            {catalogos.categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Tipo de documento
          </label>
          <select
            required
            value={values.tipoDocumentoId}
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                tipoDocumentoId: e.target.value,
              }))
            }
            className={inputClass}
          >
            <option value="">Seleccionar…</option>
            {catalogos.tiposDocumento.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Tipo (movimiento)
          </label>
          <select
            value={values.tipoMovimiento}
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                tipoMovimiento: e.target.value as "Ingreso" | "Gasto",
              }))
            }
            className={inputClass}
          >
            <option value="Gasto">Gasto</option>
            <option value="Ingreso">Ingreso</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Tipo de pago
          </label>
          <select
            value={values.tipoFactura}
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                tipoFactura: e.target.value as "Credito" | "Contado",
              }))
            }
            className={inputClass}
          >
            <option value="Contado">Contado</option>
            <option value="Credito">Crédito</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Observaciones (opcional)
        </label>
        <textarea
          rows={3}
          value={values.observaciones}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, observaciones: e.target.value }))
          }
          className={inputClass}
          placeholder="Notas adicionales…"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || uploading}
        className="w-full bg-brand hover:bg-brand-light text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-lg shadow-brand/20 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Guardando…
          </span>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  )
}
