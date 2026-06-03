import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { FacturaDTO } from "@/types/factura"

type ReportTotals = {
  totalIngresos: number
  totalGastos: number
  balance: number
}

type ReportPdfOptions = {
  facturas: FacturaDTO[]
  mes: string
  totals: ReportTotals
}

const soles = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
})

function formatMonth(mes: string) {
  const [year, month] = mes.split("-").map(Number)
  if (!year || !month) return mes

  return new Intl.DateTimeFormat("es-PE", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1))
}

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return date

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed)
}

function drawSummaryCard(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  color: [number, number, number]
) {
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(x, y, 58, 24, 2, 2, "FD")
  doc.setTextColor(100, 116, 139)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.text(label.toUpperCase(), x + 5, y + 8)
  doc.setTextColor(...color)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.text(value, x + 5, y + 18)
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages()

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    doc.setDrawColor(226, 232, 240)
    doc.line(14, 283, 196, 283)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text("FactusAI - Reporte mensual de facturas", 14, 289)
    doc.text(`Pagina ${page} de ${pageCount}`, 176, 289)
  }
}

export function getReportFileName(mes: string) {
  return `reporte-factusai-${mes}.pdf`
}

export function buildMonthlyReportPdf({ facturas, mes, totals }: ReportPdfOptions) {
  const doc = new jsPDF()
  const monthLabel = formatMonth(mes)
  const generatedAt = new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date())

  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, 210, 42, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(20)
  doc.text("Reporte mensual", 14, 19)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(`Periodo: ${monthLabel}`, 14, 28)
  doc.text(`Generado: ${generatedAt}`, 14, 35)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.text("FactusAI", 173, 21)

  drawSummaryCard(doc, "Ingresos", soles.format(totals.totalIngresos), 14, 52, [
    5, 150, 105,
  ])
  drawSummaryCard(doc, "Gastos", soles.format(totals.totalGastos), 76, 52, [
    225, 29, 72,
  ])
  drawSummaryCard(
    doc,
    "Balance",
    soles.format(totals.balance),
    138,
    52,
    totals.balance >= 0 ? [15, 23, 42] : [225, 29, 72]
  )

  autoTable(doc, {
    startY: 86,
    head: [["Resumen", "Valor"]],
    body: [
      ["Facturas incluidas", String(facturas.length)],
      [
        "Ingresos registrados",
        String(facturas.filter((f) => f.tipoMovimiento === "Ingreso").length),
      ],
      [
        "Gastos registrados",
        String(facturas.filter((f) => f.tipoMovimiento === "Gasto").length),
      ],
    ],
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
      textColor: [51, 65, 85],
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 50, halign: "right" },
    },
    margin: { left: 14, right: 14 },
  })

  autoTable(doc, {
    startY: 130,
    head: [["Fecha", "Proveedor", "Categoria", "Documento", "Tipo", "Monto"]],
    body: facturas.map((f) => [
      formatDate(f.fecha),
      f.proveedor,
      f.categoria,
      f.tipoDocumento,
      f.tipoMovimiento,
      soles.format(f.monto),
    ]),
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 2.6,
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
      textColor: [51, 65, 85],
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 42 },
      2: { cellWidth: 34 },
      3: { cellWidth: 28 },
      4: { cellWidth: 23 },
      5: { cellWidth: 28, halign: "right", fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
  })

  addFooter(doc)

  return doc
}

export async function pdfBlobToBase64(blob: Blob) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })

  return dataUrl.split(",")[1] ?? dataUrl
}
