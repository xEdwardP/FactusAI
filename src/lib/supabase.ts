import { createClient, SupabaseClient } from "@supabase/supabase-js"

function resolveSupabaseUrl(): string | undefined {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
  }

  const connection =
    process.env.DATABASE_URL ?? process.env.DIRECT_URL ?? ""
  const match = connection.match(/postgres\.([a-z0-9]+)(?::|@)/i)
  if (match) {
    return `https://${match[1]}.supabase.co`
  }

  return undefined
}

function getSupabaseConfig() {
  return {
    url: resolveSupabaseUrl(),
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    bucket: process.env.SUPABASE_FACTURAS_BUCKET ?? "facturas",
  }
}

export function getFacturasBucket(): string {
  return getSupabaseConfig().bucket
}

/** @deprecated use getFacturasBucket() */
export const FACTURAS_BUCKET = process.env.SUPABASE_FACTURAS_BUCKET ?? "facturas"

export function isSupabaseConfigured(): boolean {
  const { url, serviceKey } = getSupabaseConfig()
  return Boolean(url && serviceKey)
}

export function getSupabaseAdmin(): SupabaseClient {
  const { url, serviceKey } = getSupabaseConfig()

  if (!url || !serviceKey) {
    throw new Error("Supabase Storage no configurado")
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function extractStoragePath(
  imagenUrl: string | null | undefined
): string | null {
  if (!imagenUrl) return null

  const bucket = getFacturasBucket()
  const publicMarker = `/storage/v1/object/public/${bucket}/`
  const signedMarker = `/storage/v1/object/sign/${bucket}/`

  for (const marker of [publicMarker, signedMarker]) {
    const idx = imagenUrl.indexOf(marker)
    if (idx !== -1) {
      const rest = imagenUrl.slice(idx + marker.length)
      return decodeURIComponent(rest.split("?")[0])
    }
  }

  // Ruta guardada directamente (path relativo en el bucket)
  if (!imagenUrl.startsWith("http")) {
    return imagenUrl
  }

  return null
}

export async function getSignedImageUrl(
  imagen: string | null | undefined,
  expiresIn = 3600
): Promise<string | null> {
  if (!imagen || !isSupabaseConfigured()) return imagen ?? null

  if (imagen.startsWith("http") && !imagen.includes("/storage/v1/object/")) {
    return imagen
  }

  const path = extractStoragePath(imagen)
  if (!path) return imagen

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.storage
    .from(getFacturasBucket())
    .createSignedUrl(path, expiresIn)

  if (error || !data?.signedUrl) {
    console.error("Signed URL error:", error)
    return null
  }

  return data.signedUrl
}
