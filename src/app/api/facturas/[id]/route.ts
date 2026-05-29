import { NextRequest, NextResponse } from "next/server"
import { getAuthUserId, unauthorizedResponse } from "@/lib/api-auth"
import {
  extractStoragePath,
  getFacturasBucket,
  getSupabaseAdmin,
  isSupabaseConfigured,
} from "@/lib/supabase"
import {
  findFacturaForUsuario,
  facturaInclude,
  serializeFactura,
  serializeFacturaWithImage,
} from "@/lib/facturas"
import { prisma } from "@/lib/prisma"
import { TipoFactura, TipoMovimiento } from "@prisma/client"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, context: RouteContext) {
  const usuarioId = await getAuthUserId()
  if (!usuarioId) return unauthorizedResponse()

  const { id } = await context.params
  const facturaId = parseInt(id, 10)
  if (Number.isNaN(facturaId)) {
    return NextResponse.json({ message: "ID inválido." }, { status: 400 })
  }

  const factura = await findFacturaForUsuario(facturaId, usuarioId)
  if (!factura) {
    return NextResponse.json({ message: "Factura no encontrada." }, { status: 404 })
  }

  return NextResponse.json({
    factura: await serializeFacturaWithImage(factura),
  })
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const usuarioId = await getAuthUserId()
  if (!usuarioId) return unauthorizedResponse()

  const { id } = await context.params
  const facturaId = parseInt(id, 10)
  if (Number.isNaN(facturaId)) {
    return NextResponse.json({ message: "ID inválido." }, { status: 400 })
  }

  const existing = await findFacturaForUsuario(facturaId, usuarioId)
  if (!existing) {
    return NextResponse.json({ message: "Factura no encontrada." }, { status: 404 })
  }

  try {
    const body = await req.json()

    const fecha =
      typeof body.fecha === "string"
        ? new Date(body.fecha + "T12:00:00.000Z")
        : existing.fecha
    const proveedor =
      typeof body.proveedor === "string"
        ? body.proveedor.trim()
        : existing.proveedor
    const monto =
      body.monto !== undefined
        ? parseFloat(String(body.monto))
        : Number(existing.monto)

    if (!proveedor || Number.isNaN(monto) || monto <= 0) {
      return NextResponse.json(
        { message: "Proveedor y monto válido son requeridos." },
        { status: 400 }
      )
    }

    const factura = await prisma.factura.update({
      where: { id: facturaId },
      data: {
        fecha,
        proveedor,
        monto,
        categoriaGastoId: body.categoriaGastoId
          ? Number(body.categoriaGastoId)
          : existing.categoriaGastoId,
        tipoDocumentoId: body.tipoDocumentoId
          ? Number(body.tipoDocumentoId)
          : existing.tipoDocumentoId,
        tipoMovimiento: (body.tipoMovimiento ??
          existing.tipoMovimiento) as TipoMovimiento,
        tipoFactura: (body.tipoFactura ?? existing.tipoFactura) as TipoFactura,
        observaciones:
          body.observaciones !== undefined
            ? body.observaciones || null
            : existing.observaciones,
        imagen:
          body.imagen !== undefined
            ? body.imagen || null
            : existing.imagen,
        facturaFisica:
          body.facturaFisica !== undefined
            ? Boolean(body.facturaFisica)
            : existing.facturaFisica,
      },
      include: facturaInclude,
    })

    return NextResponse.json({ factura: serializeFactura(factura) })
  } catch (error) {
    console.error("Update factura error:", error)
    return NextResponse.json(
      { message: "Error al actualizar la factura." },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const usuarioId = await getAuthUserId()
  if (!usuarioId) return unauthorizedResponse()

  const { id } = await context.params
  const facturaId = parseInt(id, 10)
  if (Number.isNaN(facturaId)) {
    return NextResponse.json({ message: "ID inválido." }, { status: 400 })
  }

  const existing = await findFacturaForUsuario(facturaId, usuarioId)
  if (!existing) {
    return NextResponse.json({ message: "Factura no encontrada." }, { status: 404 })
  }

  if (existing.imagen && isSupabaseConfigured()) {
    const path = extractStoragePath(existing.imagen)
    if (path) {
      try {
        const supabase = getSupabaseAdmin()
        await supabase.storage.from(getFacturasBucket()).remove([path])
      } catch (error) {
        console.error("Storage delete error:", error)
      }
    }
  }

  await prisma.factura.delete({ where: { id: facturaId } })

  return NextResponse.json({ message: "Factura eliminada." })
}
