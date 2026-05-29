export type FacturaDTO = {
  id: number
  fecha: string
  proveedor: string
  monto: number
  imagen: string | null
  facturaFisica: boolean
  tipoFactura: "Credito" | "Contado"
  tipoMovimiento: "Ingreso" | "Gasto"
  observaciones: string | null
  categoriaGastoId: number
  tipoDocumentoId: number
  categoria: string
  tipoDocumento: string
  imagenUrl?: string | null
  createdAt: string
  updatedAt: string
}

export type Catalogos = {
  categorias: { id: number; nombre: string }[]
  tiposDocumento: { id: number; nombre: string }[]
}

export type FacturaFormValues = {
  fecha: string
  proveedor: string
  monto: string
  categoriaGastoId: string
  tipoMovimiento: "Ingreso" | "Gasto"
  tipoFactura: "Credito" | "Contado"
  tipoDocumentoId: string
  observaciones: string
  imagen: string | null
}
