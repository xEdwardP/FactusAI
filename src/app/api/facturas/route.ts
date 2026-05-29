import { NextRequest, NextResponse } from "next/server"
import { TipoFactura, TipoMovimiento } from "@prisma/client"
import { getAuthUserId, unauthorizedResponse } from "@/lib/api-auth"
import { getOrCreateEmpresaForUsuario } from "@/lib/empresa"
import {
  buildMonthFilter,
  facturaInclude,
  serializeFactura,
} from "@/lib/facturas"
import { prisma } from "@/lib/prisma"

function parseFacturaBody(body: Record<string, unknown>) {
  const fecha = typeof body.fecha === "string" ? body.fecha : ""
  const proveedor = typeof body.proveedor === "string" ? body.proveedor.trim() : ""
  const montoRaw = body.monto
  const categoriaGastoId = Number(body.categoriaGastoId)
  const tipoDocumentoId = Number(body.tipoDocumentoId)
  const tipoMovimiento = body.tipoMovimiento as TipoMovimiento
  const tipoFactura = body.tipoFactura as TipoFactura
  const imagen =
    typeof body.imagen === "string" && body.imagen.length > 0
      ? body.imagen
      : null
  const observaciones =
    typeof body.observaciones === "string" && body.observaciones.trim()
      ? body.observaciones.trim()
      : null

  const monto =
    typeof montoRaw === "number"
      ? montoRaw
      : parseFloat(String(montoRaw ?? ""))

  if (!fecha || !proveedor || Number.isNaN(monto) || monto <= 0) {
    return { error: "Fecha, proveedor y monto válido son requeridos." }
  }

  if (!categoriaGastoId || !tipoDocumentoId) {
    return { error: "Categoría y tipo de documento son requeridos." }
  }

  if (!["Ingreso", "Gasto"].includes(tipoMovimiento)) {
    return { error: "Tipo de movimiento inválido." }
  }

  if (!["Credito", "Contado"].includes(tipoFactura)) {
    return { error: "Tipo de pago inválido." }
  }

  return {
    data: {
      fecha: new Date(fecha + "T12:00:00.000Z"),
      proveedor,
      monto,
      categoriaGastoId,
      tipoDocumentoId,
      tipoMovimiento,
      tipoFactura,
      imagen,
      observaciones,
      facturaFisica: Boolean(body.facturaFisica),
    },
  }
}

export async function GET(req: NextRequest) {
  const usuarioId = await getAuthUserId()
  if (!usuarioId) return unauthorizedResponse()

  const { searchParams } = new URL(req.url)
  const mes = searchParams.get("mes")
  const categoriaId = searchParams.get("categoriaId")

  const where = {
    usuarioId,
    ...buildMonthFilter(mes),
    ...(categoriaId
      ? { categoriaGastoId: parseInt(categoriaId, 10) || undefined }
      : {}),
  }

  const facturas = await prisma.factura.findMany({
    where,
    include: facturaInclude,
    orderBy: [{ fecha: "desc" }, { id: "desc" }],
  })

  return NextResponse.json({
    facturas: facturas.map(serializeFactura),
  })
}

export async function POST(req: NextRequest) {
  const usuarioId = await getAuthUserId()
  if (!usuarioId) return unauthorizedResponse()

  try {
    const body = await req.json()
    const parsed = parseFacturaBody(body)

    if ("error" in parsed) {
      return NextResponse.json({ message: parsed.error }, { status: 400 })
    }

    const empresaId = await getOrCreateEmpresaForUsuario(usuarioId)

    const factura = await prisma.factura.create({
      data: {
        ...parsed.data,
        usuarioId,
        empresaId,
      },
      include: facturaInclude,
    })

    return NextResponse.json(
      { factura: serializeFactura(factura) },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create factura error:", error)
    return NextResponse.json(
      { message: "Error al registrar la factura." },
      { status: 500 }
    )
  }
}
