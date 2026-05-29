import { NextResponse } from "next/server"

/** Mensajes seguros para el cliente. Los detalles van solo al log del servidor. */
export const USER_MESSAGES = {
  unauthorized: "No autorizado.",
  notFound: "Recurso no encontrado.",
  validation: "Datos inválidos. Revise el formulario.",
  uploadFailed: "No se pudo subir el archivo. Intente nuevamente.",
  saveFailed: "No se pudo guardar. Intente nuevamente.",
  deleteFailed: "No se pudo eliminar. Intente nuevamente.",
  serviceUnavailable:
    "El servicio de archivos no está disponible. Intente más tarde.",
  internal: "Ocurrió un error. Intente nuevamente.",
} as const

export function errorResponse(
  userMessage: string,
  status: number,
  logContext?: string,
  cause?: unknown
) {
  if (logContext || cause) {
    console.error(logContext ?? userMessage, cause)
  }
  return NextResponse.json({ message: userMessage }, { status })
}
