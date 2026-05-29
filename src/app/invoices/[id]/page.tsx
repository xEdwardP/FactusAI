"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ExternalLink, Loader2, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import FacturaForm from "@/components/facturas/FacturaForm"
import { getSafeApiMessage } from "@/lib/client-errors"
import type { FacturaDTO, FacturaFormValues } from "@/types/factura"

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [factura, setFactura] = useState<FacturaDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/facturas/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("No encontrada")
        return r.json()
      })
      .then((data) => setFactura(data.factura))
      .catch(() => {
        toast.error("Factura no encontrada.")
        router.push("/invoices")
      })
      .finally(() => setLoading(false))
  }, [id, router])

  const handleUpdate = async (values: FacturaFormValues) => {
    const res = await fetch(`/api/facturas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fecha: values.fecha,
        proveedor: values.proveedor,
        monto: parseFloat(values.monto),
        categoriaGastoId: Number(values.categoriaGastoId),
        tipoDocumentoId: Number(values.tipoDocumentoId),
        tipoMovimiento: values.tipoMovimiento,
        tipoFactura: values.tipoFactura,
        observaciones: values.observaciones || null,
        imagen: values.imagen,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(getSafeApiMessage(res.status, data.message))
    }

    setFactura(data.factura)
    setEditing(false)
    toast.success("Factura actualizada.")
  }

  const handleDelete = async () => {
    if (!confirm("¿Eliminar esta factura? Esta acción no se puede deshacer.")) {
      return
    }

    setDeleting(true)
    const res = await fetch(`/api/facturas/${id}`, { method: "DELETE" })
    setDeleting(false)

    if (!res.ok) {
      const data = await res.json()
      toast.error(getSafeApiMessage(res.status, data.message))
      return
    }

    toast.success("Factura eliminada.")
    router.push("/invoices")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <Loader2 className="animate-spin mr-2" size={20} />
        Cargando…
      </div>
    )
  }

  if (!factura) return null

  const formInitial: FacturaFormValues = {
    fecha: factura.fecha,
    proveedor: factura.proveedor,
    monto: String(factura.monto),
    categoriaGastoId: String(factura.categoriaGastoId),
    tipoDocumentoId: String(factura.tipoDocumentoId),
    tipoMovimiento: factura.tipoMovimiento,
    tipoFactura: factura.tipoFactura,
    observaciones: factura.observaciones ?? "",
    imagen: factura.imagen,
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4"
      >
        <ArrowLeft size={16} />
        Volver al listado
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            {editing ? "Editar factura" : factura.proveedor}
          </h1>
          {!editing && (
            <p className="mt-1 text-slate-500">
              {factura.fecha} · {factura.categoria} · {factura.tipoDocumento}
            </p>
          )}
        </div>
        {!editing && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Pencil size={16} />
              Editar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              <Trash2 size={16} />
              {deleting ? "Eliminando…" : "Eliminar"}
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm">
          <FacturaForm
            initialValues={formInitial}
            showFileUpload
            submitLabel="Guardar cambios"
            onSubmit={handleUpdate}
          />
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="mt-4 w-full py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            Cancelar edición
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Monto</p>
              <p className="text-xl font-semibold text-slate-900">
                S/ {factura.monto.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Tipo</p>
              <p className="font-medium text-slate-900">
                {factura.tipoMovimiento} · {factura.tipoFactura}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Categoría</p>
              <p className="font-medium text-slate-900">{factura.categoria}</p>
            </div>
            <div>
              <p className="text-slate-500">Documento</p>
              <p className="font-medium text-slate-900">
                {factura.tipoDocumento}
              </p>
            </div>
            {factura.observaciones && (
              <div className="col-span-2">
                <p className="text-slate-500">Observaciones</p>
                <p className="text-slate-800">{factura.observaciones}</p>
              </div>
            )}
          </div>

          {(factura.imagenUrl ?? factura.imagen) && (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-900">Comprobante</h2>
                <a
                  href={factura.imagenUrl ?? factura.imagen ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-brand hover:text-brand-light"
                >
                  Abrir
                  <ExternalLink size={14} />
                </a>
              </div>
              {(factura.imagen ?? "").toLowerCase().includes(".pdf") ? (
                <iframe
                  src={factura.imagenUrl ?? factura.imagen ?? ""}
                  title="Comprobante PDF"
                  className="w-full h-96 rounded-lg border border-slate-200"
                />
              ) : (
                <img
                  src={factura.imagenUrl ?? factura.imagen ?? ""}
                  alt="Comprobante"
                  className="max-h-96 w-full object-contain rounded-lg border border-slate-200 bg-slate-50"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
