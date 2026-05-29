import { NextRequest, NextResponse } from "next/server"
import { getAuthUserId, unauthorizedResponse } from "@/lib/api-auth"
import { errorResponse, USER_MESSAGES } from "@/lib/api-errors"
import {
  getFacturasBucket,
  getSupabaseAdmin,
  isSupabaseConfigured,
} from "@/lib/supabase"

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

  if (!isSupabaseConfigured()) {
    return errorResponse(
      USER_MESSAGES.serviceUnavailable,
      503,
      "Supabase Storage no configurado"
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

    const ext = file.name.split(".").pop()?.toLowerCase() || "bin"
    const safeExt = ext.replace(/[^a-z0-9]/g, "") || "bin"
    const path = `${usuarioId}/${crypto.randomUUID()}.${safeExt}`

    const buffer = Buffer.from(await file.arrayBuffer())
    const bucket = getFacturasBucket()
    const supabase = getSupabaseAdmin()

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      return errorResponse(
        USER_MESSAGES.uploadFailed,
        500,
        "Supabase upload error",
        error
      )
    }

    return NextResponse.json({ path })
  } catch (error) {
    return errorResponse(
      USER_MESSAGES.uploadFailed,
      500,
      "Upload error",
      error
    )
  }
}
