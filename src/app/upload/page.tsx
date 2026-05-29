"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import FacturaForm from "@/components/facturas/FacturaForm"
import { getSafeApiMessage } from "@/lib/client-errors"
import type { FacturaFormValues } from "@/types/factura"

export default function UploadPage() {
  const router = useRouter()

  const handleSubmit = async (values: FacturaFormValues) => {
    const res = await fetch("/api/facturas", {
      method: "POST",
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

    toast.success("Factura registrada correctamente.")
    router.push(`/invoices/${data.factura.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Subir factura
        </h1>
        <p className="mt-1 text-slate-500">
          Sube una imagen o PDF y completa los datos del comprobante.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm">
        <FacturaForm
          showFileUpload
          submitLabel="Registrar factura"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
