"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { extractFacturaFromFile } from "@/lib/extract-factura-client"
import { uploadFacturaFile } from "@/lib/upload-factura-client"
import type {
  Catalogos,
  FacturaExtracted,
  FacturaFormValues,
} from "@/types/factura"

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
  enableAiExtract?: boolean
}

export default function FacturaForm({
  initialValues,
  onSubmit,
  submitLabel = "Guardar factura",
  showFileUpload = false,
  enableAiExtract = false,
}: Props) {
  const [values, setValues] = useState<FacturaFormValues>({
    ...defaultValues,
    ...initialValues,
  })
  const [catalogos, setCatalogos] = useState<Catalogos | null>(null)
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [extracted, setExtracted] = useState<FacturaExtracted | null>(null)
  const [error, setError] = useState<string | null>(null)
  const extractRequestId = useRef(0)

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

  useEffect(() => {
    if (
      enableAiExtract &&
      catalogos &&
      pendingFile &&
      !extracted &&
      !extracting &&
      !error
    ) {
      void runExtraction(pendingFile)
    }
    // Solo reintentar cuando cargan catálogos con archivo pendiente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogos])

  const applyExtracted = (data: FacturaExtracted) => {
    setExtracted(data)
    setValues((prev) => ({
      ...prev,
      fecha: data.fecha,
      proveedor: data.proveedor,
      monto: String(data.monto),
      categoriaGastoId:
        data.categoriaGastoId != null
          ? String(data.categoriaGastoId)
          : prev.categoriaGastoId,
    }))
  }

  const runExtraction = async (file: File) => {
    const requestId = ++extractRequestId.current
    setExtracting(true)
    setExtracted(null)
    setError(null)

    try {
      const data = await extractFacturaFromFile(file)
      if (requestId !== extractRequestId.current) return
      applyExtracted(data)
    } catch (err) {
      if (requestId !== extractRequestId.current) return
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron leer los datos del comprobante."
      )
    } finally {
      if (requestId === extractRequestId.current) {
        setExtracting(false)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setPendingFile(file ?? null)
    setExtracted(null)
    setError(null)

    if (file && enableAiExtract && catalogos) {
      void runExtraction(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let imagen = values.imagen
      if (pendingFile) {
        imagen = await uploadFacturaFile(pendingFile)
      }

      await onSubmit({ ...values, imagen })
      setPendingFile(null)
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
            disabled={loading}
            className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand file:text-white file:font-medium hover:file:bg-brand-light"
          />
          {pendingFile && (
            <p className="mt-2 text-xs text-slate-600">
              {pendingFile.name}
              {extracting
                ? " — analizando con IA…"
                : " — se subirá al guardar"}
            </p>
          )}
          {extracting && (
            <p className="mt-2 flex items-center gap-2 text-sm text-brand">
              <Loader2 size={14} className="animate-spin" />
              Leyendo comprobante con Gemini…
            </p>
          )}
          {!pendingFile && values.imagen && (
            <p className="mt-2 text-xs text-slate-500">
              Comprobante actual guardado
            </p>
          )}
        </div>
      )}

      {extracted && !extracting && (
        <div
          className="rounded-xl border border-brand/25 bg-brand/5 px-4 py-3"
          role="status"
        >
          <div className="flex items-start gap-2">
            <Sparkles
              size={18}
              className="text-brand shrink-0 mt-0.5"
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">
                Datos reconocidos — confirme o corrija
              </p>
              <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-700">
                <div>
                  <dt className="text-xs text-slate-500">Fecha</dt>
                  <dd>{extracted.fecha}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Monto</dt>
                  <dd>S/ {extracted.monto.toFixed(2)}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-slate-500">Proveedor</dt>
                  <dd className="truncate">{extracted.proveedor}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-slate-500">Categoría sugerida</dt>
                  <dd>{extracted.categoriaSugerida}</dd>
                </div>
              </dl>
              <p className="mt-2 text-xs text-slate-500">
                Los campos del formulario ya están completados. Ajústelos si
                hace falta antes de registrar.
              </p>
            </div>
          </div>
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
        disabled={loading || extracting}
        className="w-full bg-brand hover:bg-brand-light text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-lg shadow-brand/20 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            {pendingFile ? "Subiendo y guardando…" : "Guardando…"}
          </span>
        ) : extracting ? (
          "Espere el análisis con IA…"
        ) : (
          submitLabel
        )}
      </button>
      {extracting && (
        <p className="text-center text-xs text-slate-500 -mt-3">
          El botón se habilitará al terminar el reconocimiento.
        </p>
      )}
    </form>
  )
}
