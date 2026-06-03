import { NextRequest, NextResponse } from "next/server"
import { getAuthUserId, unauthorizedResponse } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const usuarioId = await getAuthUserId()
  if (!usuarioId) return unauthorizedResponse()

  try {
    const envios = await prisma.detalleEnvio.findMany({
      where: { usuarioId },
      orderBy: { timestamp: "desc" },
    })

    return NextResponse.json({ envios })
  } catch (error) {
    console.error("Get activity error:", error)
    return NextResponse.json({ message: "Error interno al obtener la actividad." }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const usuarioId = await getAuthUserId()
  if (!usuarioId) return unauthorizedResponse()

  try {
    const body = await req.json()
    const { destinatario, medioEnvio, facturasIds } = body

    if (!destinatario || !medioEnvio) {
      return NextResponse.json({ message: "Faltan parámetros requeridos." }, { status: 400 })
    }

    const detalleEnvio = await prisma.detalleEnvio.create({
      data: {
        destinatario,
        medioEnvio, // e.g. "WhatsApp"
        estado: "Enviado",
        usuarioId,
        facturas: {
          create: Array.isArray(facturasIds) 
            ? facturasIds.map((id: number) => ({ facturaId: id }))
            : []
        }
      }
    })

    return NextResponse.json({ message: "Actividad registrada", id: detalleEnvio.id })
  } catch (error) {
    console.error("Log activity error:", error)
    return NextResponse.json({ message: "Error interno al registrar la actividad." }, { status: 500 })
  }
}
