import { NextRequest, NextResponse } from "next/server"
import { getAuthUserId, unauthorizedResponse } from "@/lib/api-auth"
import { errorResponse, USER_MESSAGES } from "@/lib/api-errors"
import {
  extractFacturaFromMedia,
  matchCategoriaId,
} from "@/lib/gemini"
import { prisma } from "@/lib/prisma"

const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
])

export async function POST(req: NextRequest) {
  const usuarioId = await getAuthUserId()
  if (!usuarioId) return unauthorizedResponse()

  if (!process.env.GEMINI_API_KEY?.trim()) {
    return errorResponse(
      USER_MESSAGES.aiUnavailable,
      503,
      "GEMINI_API_KEY no configurada"
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file")

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { message: "Archivo requerido." },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { message: "Solo se permiten imágenes (JPG, PNG, WEBP, GIF) o PDF." },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: "El archivo no puede superar 10 MB." },
        { status: 400 }
      )
    }

    const categorias = await prisma.categoriaGasto.findMany({
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    })

    if (categorias.length === 0) {
      return errorResponse(USER_MESSAGES.aiUnavailable, 503, "Sin categorías")
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const extracted = await extractFacturaFromMedia(
      buffer,
      file.type,
      categorias.map((c) => c.nombre)
    )

    const categoriaGastoId = matchCategoriaId(
      extracted.categoriaSugerida,
      categorias
    )

    return NextResponse.json({
      fecha: extracted.fecha,
      proveedor: extracted.proveedor,
      monto: extracted.monto,
      categoriaSugerida: extracted.categoriaSugerida,
      categoriaGastoId,
    })
  } catch (err) {
    const code = err instanceof Error ? err.message : ""
    if (code === "GEMINI_NOT_CONFIGURED") {
      return errorResponse(USER_MESSAGES.aiUnavailable, 503, code)
    }
    if (
      code === "GEMINI_PARSE_ERROR" ||
      code === "GEMINI_INVALID_DATE" ||
      code === "GEMINI_INVALID_FIELDS"
    ) {
      return errorResponse(
        USER_MESSAGES.aiExtractFailed,
        422,
        "Gemini extract validation",
        err
      )
    }
    return errorResponse(
      USER_MESSAGES.aiExtractFailed,
      500,
      "Gemini extract error",
      err
    )
  }
}
