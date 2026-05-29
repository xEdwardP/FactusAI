import { NextResponse } from "next/server"
import { getAuthUserId, unauthorizedResponse } from "@/lib/api-auth"
import { buildMonthFilter } from "@/lib/facturas"
import { prisma } from "@/lib/prisma"

function currentMonthKey() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}

export async function GET() {
  const usuarioId = await getAuthUserId()
  if (!usuarioId) return unauthorizedResponse()

  const mes = currentMonthKey()
  const monthFilter = buildMonthFilter(mes)

  const [totalFacturas, facturasMes, gastosMes, ultimas] = await Promise.all([
    prisma.factura.count({ where: { usuarioId } }),
    prisma.factura.count({ where: { usuarioId, ...monthFilter } }),
    prisma.factura.aggregate({
      where: { usuarioId, ...monthFilter, tipoMovimiento: "Gasto" },
      _sum: { monto: true },
    }),
    prisma.factura.findMany({
      where: { usuarioId },
      select: {
        id: true,
        proveedor: true,
        monto: true,
        fecha: true,
      },
      orderBy: [{ fecha: "desc" }, { id: "desc" }],
      take: 3,
    }),
  ])

  return NextResponse.json({
    totalFacturas,
    facturasMes,
    montoMesGastos: Number(gastosMes._sum.monto ?? 0),
    ultimas: ultimas.map((f) => ({
      id: f.id,
      proveedor: f.proveedor,
      monto: Number(f.monto),
      fecha: f.fecha.toISOString().slice(0, 10),
    })),
  })
}
