/** Convierte respuestas de API en mensajes seguros para la UI. */
export function getSafeApiMessage(
  status: number,
  apiMessage?: string
): string {
  if (status === 401) return "Sesión expirada. Inicie sesión nuevamente."
  if (status === 503) {
    return "El servicio no está disponible. Intente más tarde."
  }
  if (status >= 500) {
    return "Ocurrió un error. Intente nuevamente."
  }
  // 4xx de validación: el mensaje del API suele ser seguro para el usuario
  if (status >= 400 && apiMessage) return apiMessage
  return "Ocurrió un error. Intente nuevamente."
}
