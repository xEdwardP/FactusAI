import { getSafeApiMessage } from "@/lib/client-errors"
import type { FacturaExtracted } from "@/types/factura"

export async function extractFacturaFromFile(
  file: File
): Promise<FacturaExtracted> {
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch("/api/facturas/extract", {
    method: "POST",
    body: formData,
  })
  const data = await res.json()

  if (!res.ok) {
    throw new Error(getSafeApiMessage(res.status, data.message))
  }

  return {
    fecha: data.fecha,
    proveedor: data.proveedor,
    monto: data.monto,
    categoriaSugerida: data.categoriaSugerida,
    categoriaGastoId: data.categoriaGastoId,
  }
}
