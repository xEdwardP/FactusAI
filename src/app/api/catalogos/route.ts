import { NextResponse } from "next/server"
import { getAuthUserId, unauthorizedResponse } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const usuarioId = await getAuthUserId()
  if (!usuarioId) return unauthorizedResponse()

  const [categorias, tiposDocumento] = await Promise.all([
    prisma.categoriaGasto.findMany({
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    }),
    prisma.tipoDocumento.findMany({
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    }),
  ])

  return NextResponse.json({ categorias, tiposDocumento })
}
