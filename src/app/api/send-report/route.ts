import { NextRequest, NextResponse } from "next/server"
import { getAuthUserId, unauthorizedResponse } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const usuarioId = await getAuthUserId()
  if (!usuarioId) return unauthorizedResponse()

  try {
    const body = await req.json()
    const { email, mes, htmlContent, pdfBase64, pdfFileName, facturasIds } = body

    if (!email || !mes || !htmlContent) {
      return NextResponse.json(
        { message: "Faltan parametros requeridos." },
        { status: 400 }
      )
    }

    const attachments =
      typeof pdfBase64 === "string" && pdfBase64.length > 0
        ? [
            {
              filename:
                typeof pdfFileName === "string" && pdfFileName.length > 0
                  ? pdfFileName
                  : `reporte-factusai-${mes}.pdf`,
              content: pdfBase64,
              contentType: "application/pdf",
            },
          ]
        : undefined

    const { error } = await resend.emails.send({
      from: "FactusAI <onboarding@resend.dev>",
      to: [email],
      subject: `Reporte Mensual de Facturas - ${mes}`,
      html: htmlContent,
      attachments,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json(
        { message: error.message || "Error al enviar el correo." },
        { status: 500 }
      )
    }

    const detalleEnvio = await prisma.detalleEnvio.create({
      data: {
        destinatario: email,
        medioEnvio: "Email",
        estado: "Enviado",
        usuarioId,
        facturas: {
          create: Array.isArray(facturasIds)
            ? facturasIds.map((id: number) => ({ facturaId: id }))
            : [],
        },
      },
    })

    return NextResponse.json({
      message: "Reporte enviado exitosamente",
      id: detalleEnvio.id,
    })
  } catch (error) {
    console.error("Send report error:", error)
    return NextResponse.json(
      { message: "Error interno al enviar el reporte." },
      { status: 500 }
    )
  }
}
