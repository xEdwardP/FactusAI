import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"

export type GeminiExtractResult = {
  fecha: string
  proveedor: string
  monto: number
  categoriaSugerida: string
}

const MODEL = "gemini-2.5-flash"

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey?.trim()) {
    throw new Error("GEMINI_NOT_CONFIGURED")
  }
  return new GoogleGenerativeAI(apiKey.trim())
}

function buildPrompt(categorias: string[]) {
  const lista = categorias.map((c) => `- ${c}`).join("\n")
  return `Eres un asistente que extrae datos de comprobantes de pago (facturas, boletas, tickets) en Perú.
Analiza la imagen o PDF y devuelve SOLO un JSON con estos campos:
- fecha: fecha del comprobante en formato YYYY-MM-DD (usa la fecha de emisión; si no hay año claro, usa el año actual)
- proveedor: razón social o nombre del emisor/comercio (máximo 150 caracteres)
- monto: monto total a pagar en soles (número decimal, sin símbolo de moneda; usa el total final con IGV si aparece)
- categoriaSugerida: una de estas categorías exactas (elige la más adecuada según el tipo de gasto):
${lista}

Si no puedes leer un campo con certeza, infiere lo más razonable o usa "Otros" para categoría y fecha de hoy solo si no hay fecha visible.`
}

export async function extractFacturaFromMedia(
  buffer: Buffer,
  mimeType: string,
  categorias: string[]
): Promise<GeminiExtractResult> {
  const genAI = getClient()
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          fecha: { type: SchemaType.STRING },
          proveedor: { type: SchemaType.STRING },
          monto: { type: SchemaType.NUMBER },
          categoriaSugerida: { type: SchemaType.STRING },
        },
        required: ["fecha", "proveedor", "monto", "categoriaSugerida"],
      },
    },
  })

  const base64 = buffer.toString("base64")
  const result = await model.generateContent([
    { text: buildPrompt(categorias) },
    { inlineData: { mimeType, data: base64 } },
  ])

  const text = result.response.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error("GEMINI_PARSE_ERROR")
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("fecha" in parsed) ||
    !("proveedor" in parsed) ||
    !("monto" in parsed) ||
    !("categoriaSugerida" in parsed)
  ) {
    throw new Error("GEMINI_PARSE_ERROR")
  }

  const raw = parsed as Record<string, unknown>
  const fecha = String(raw.fecha).trim()
  const proveedor = String(raw.proveedor).trim().slice(0, 150)
  const monto =
    typeof raw.monto === "number" ? raw.monto : parseFloat(String(raw.monto))
  const categoriaSugerida = String(raw.categoriaSugerida).trim()

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new Error("GEMINI_INVALID_DATE")
  }
  if (!proveedor || Number.isNaN(monto) || monto <= 0) {
    throw new Error("GEMINI_INVALID_FIELDS")
  }

  return { fecha, proveedor, monto, categoriaSugerida }
}

export function matchCategoriaId(
  sugerida: string,
  categorias: { id: number; nombre: string }[]
): number | null {
  const norm = (s: string) =>
    s
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .trim()

  const target = norm(sugerida)
  const exact = categorias.find((c) => norm(c.nombre) === target)
  if (exact) return exact.id

  const partial = categorias.find(
    (c) => norm(c.nombre).includes(target) || target.includes(norm(c.nombre))
  )
  if (partial) return partial.id

  const otros = categorias.find((c) => norm(c.nombre) === "otros")
  return otros?.id ?? categorias[0]?.id ?? null
}
