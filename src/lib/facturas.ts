import type { Prisma } from "@prisma/client"
import { getSignedImageUrl } from "@/lib/supabase"
import { prisma } from "@/lib/prisma"

export const facturaInclude = {
  categoriaGasto: { select: { id: true, nombre: true } },
  tipoDocumento: { select: { id: true, nombre: true } },
} satisfies Prisma.FacturaInclude

export function serializeFactura(factura: {
  id: number
  fecha: Date
  proveedor: string
  monto: Prisma.Decimal
  imagen: string | null
  facturaFisica: boolean
  tipoFactura: string
  tipoMovimiento: string
  observaciones: string | null
  createdAt: Date
  updatedAt: Date
  categoriaGastoId: number
  tipoDocumentoId: number
  categoriaGasto: { id: number; nombre: string }
  tipoDocumento: { id: number; nombre: string }
}) {
  return {
    id: factura.id,
    fecha: factura.fecha.toISOString().slice(0, 10),
    proveedor: factura.proveedor,
    monto: Number(factura.monto),
    imagen: factura.imagen,
    facturaFisica: factura.facturaFisica,
    tipoFactura: factura.tipoFactura,
    tipoMovimiento: factura.tipoMovimiento,
    observaciones: factura.observaciones,
    categoriaGastoId: factura.categoriaGastoId,
    tipoDocumentoId: factura.tipoDocumentoId,
    categoria: factura.categoriaGasto.nombre,
    tipoDocumento: factura.tipoDocumento.nombre,
    createdAt: factura.createdAt.toISOString(),
    updatedAt: factura.updatedAt.toISOString(),
  }
}

export async function serializeFacturaWithImage(factura: Parameters<typeof serializeFactura>[0]) {
  const base = serializeFactura(factura)
  const imagenUrl = await getSignedImageUrl(factura.imagen)
  return { ...base, imagenUrl }
}

export async function findFacturaForUsuario(id: number, usuarioId: number) {
  return prisma.factura.findFirst({
    where: { id, usuarioId },
    include: facturaInclude,
  })
}

export function buildMonthFilter(mes?: string | null): Prisma.FacturaWhereInput {
  if (!mes || !/^\d{4}-\d{2}$/.test(mes)) return {}

  const [year, month] = mes.split("-").map(Number)
  const start = new Date(Date.UTC(year, month - 1, 1))
  const end = new Date(Date.UTC(year, month, 1))

  return {
    fecha: {
      gte: start,
      lt: end,
    },
  }
}
