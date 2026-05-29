export type DashboardSummary = {
  totalFacturas: number
  facturasMes: number
  montoMesGastos: number
  ultimas: {
    id: number
    proveedor: string
    monto: number
    fecha: string
  }[]
}
