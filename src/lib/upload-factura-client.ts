import { getSafeApiMessage } from "@/lib/client-errors"

export async function uploadFacturaFile(file: File): Promise<string> {
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

  if (!data.path || typeof data.path !== "string") {
    throw new Error("Ocurrió un error. Intente nuevamente.")
  }

  return data.path
}
