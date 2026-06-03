"use client"

import { useCallback, useEffect, useState } from "react"
import { FileText, Loader2, Download, Send, MessageCircle } from "lucide-react"
import type { FacturaDTO } from "@/types/factura"
import {
  buildMonthlyReportPdf,
  getReportFileName,
  pdfBlobToBase64,
} from "@/lib/report-pdf"
import { toast } from "sonner"

const inputClass =
  "px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-brand/15 focus:border-brand/60"

const soles = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
})

function currentMonthValue() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}

function formatMonthLabel(mes: string) {
  const [year, month] = mes.split("-").map(Number)
  if (!year || !month) return mes

  return new Intl.DateTimeFormat("es-PE", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1))
}

function getTopFacturas(facturas: FacturaDTO[]) {
  return [...facturas].sort((a, b) => b.monto - a.monto).slice(0, 5)
}

export default function ReportsPage() {
  const [facturas, setFacturas] = useState<FacturaDTO[]>([])
  const [mes, setMes] = useState(currentMonthValue())
  const [loading, setLoading] = useState(true)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [email, setEmail] = useState("")
  const [sendingEmail, setSendingEmail] = useState(false)

  const loadFacturas = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (mes) params.set("mes", mes)

    try {
      const res = await fetch(`/api/facturas?${params}`)
      const data = await res.json()
      setFacturas(data.facturas ?? [])
    } catch {
      toast.error("Error al cargar facturas")
    } finally {
      setLoading(false)
    }
  }, [mes])

  useEffect(() => {
    void Promise.resolve().then(loadFacturas)
  }, [loadFacturas])

  const totalIngresos = facturas
    .filter((f) => f.tipoMovimiento === "Ingreso")
    .reduce((acc, f) => acc + f.monto, 0)
  const totalGastos = facturas
    .filter((f) => f.tipoMovimiento === "Gasto")
    .reduce((acc, f) => acc + f.monto, 0)
  const balance = totalIngresos - totalGastos
  const totals = { totalIngresos, totalGastos, balance }

  const createPdfBlob = () => {
    const doc = buildMonthlyReportPdf({ facturas, mes, totals })
    return doc.output("blob")
  }

  const handleDownloadPDF = () => {
    const doc = buildMonthlyReportPdf({ facturas, mes, totals })
    doc.save(getReportFileName(mes))
  }

  const logWhatsAppActivity = () => {
    fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destinatario: "WhatsApp",
        medioEnvio: "WhatsApp",
        facturasIds: facturas.map((f) => f.id),
      }),
    }).catch((e) => console.error("Error logging whatsapp activity", e))
  }

  const buildWhatsAppSummary = () => {
    const monthLabel = formatMonthLabel(mes)
    const topFacturas = getTopFacturas(facturas)
      .map(
        (f, index) =>
          `${index + 1}. ${f.proveedor} - ${soles.format(f.monto)} (${f.tipoMovimiento})`
      )
      .join("\n")

    return `FactusAI | Reporte mensual

Periodo: ${monthLabel}
Facturas incluidas: ${facturas.length}

Resumen financiero
Ingresos: ${soles.format(totalIngresos)}
Gastos: ${soles.format(totalGastos)}
Balance: ${soles.format(balance)}

Principales facturas
${topFacturas || "Sin facturas registradas."}

El PDF completo esta disponible para descarga desde FactusAI.`
  }

  const handleShareWhatsApp = async () => {
    const text = buildWhatsAppSummary()

    try {
      const pdfFile = new File([createPdfBlob()], getReportFileName(mes), {
        type: "application/pdf",
      })

      if (navigator.canShare?.({ files: [pdfFile] })) {
        await navigator.share({
          title: `Reporte mensual FactusAI - ${formatMonthLabel(mes)}`,
          text,
          files: [pdfFile],
        })
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
        toast.info("WhatsApp web no permite adjuntar PDF automaticamente; se envio el resumen.")
      }
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
      toast.info("No se pudo adjuntar el PDF; se abrio WhatsApp con el resumen.")
    } finally {
      logWhatsAppActivity()
    }
  }

  const buildEmailHtml = (pdfFileName: string) => {
    const monthLabel = formatMonthLabel(mes)
    const rows = facturas
      .map(
        (f) => `
          <tr>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${f.fecha}</td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;"><strong>${f.proveedor}</strong></td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${f.categoria}</td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${f.tipoDocumento}</td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;"><span style="display:inline-block;padding:4px 8px;border-radius:999px;background:${f.tipoMovimiento === "Gasto" ? "#fff1f2" : "#ecfdf5"};color:${f.tipoMovimiento === "Gasto" ? "#be123c" : "#047857"};font-size:12px;font-weight:700;">${f.tipoMovimiento}</span></td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700;">${soles.format(f.monto)}</td>
          </tr>
        `
      )
      .join("")

    return `
      <div style="margin:0;background:#f8fafc;padding:24px 14px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <div style="max-width:760px;width:100%;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;">
          <div style="background:#0f172a;color:#ffffff;padding:28px 30px;">
            <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#cbd5e1;">FactusAI</div>
            <h1 style="margin:8px 0 4px;font-size:28px;line-height:1.15;">Reporte mensual</h1>
            <p style="margin:0;color:#cbd5e1;">Periodo: ${monthLabel}</p>
          </div>
          <div style="padding:24px 30px;">
            <p style="margin:0 0 18px;color:#475569;">Adjunto encontraras el PDF completo <strong>${pdfFileName}</strong> con el detalle de facturas del periodo.</p>
            <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:0 12px;margin:4px 0 26px;">
              <tr>
                <td style="width:33.33%;padding-right:8px;vertical-align:top;">
                  <div style="border:1px solid #e2e8f0;border-radius:14px;padding:16px;background:#f8fafc;min-width:0;">
                    <div style="font-size:12px;color:#64748b;text-transform:uppercase;">Ingresos</div>
                    <div style="font-size:20px;font-weight:800;color:#059669;line-height:1.35;word-break:break-word;">${soles.format(totalIngresos)}</div>
                  </div>
                </td>
                <td style="width:33.33%;padding:0 4px;vertical-align:top;">
                  <div style="border:1px solid #e2e8f0;border-radius:14px;padding:16px;background:#f8fafc;min-width:0;">
                    <div style="font-size:12px;color:#64748b;text-transform:uppercase;">Gastos</div>
                    <div style="font-size:20px;font-weight:800;color:#e11d48;line-height:1.35;word-break:break-word;">${soles.format(totalGastos)}</div>
                  </div>
                </td>
                <td style="width:33.33%;padding-left:8px;vertical-align:top;">
                  <div style="border:1px solid #e2e8f0;border-radius:14px;padding:16px;background:#f8fafc;min-width:0;">
                    <div style="font-size:12px;color:#64748b;text-transform:uppercase;">Balance</div>
                    <div style="font-size:20px;font-weight:800;color:${balance >= 0 ? "#0f172a" : "#e11d48"};line-height:1.35;word-break:break-word;">${soles.format(balance)}</div>
                  </div>
                </td>
              </tr>
            </table>
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <thead>
                <tr style="background:#f1f5f9;color:#475569;text-align:left;">
                  <th style="padding:10px;border-bottom:1px solid #e2e8f0;">Fecha</th>
                  <th style="padding:10px;border-bottom:1px solid #e2e8f0;">Proveedor</th>
                  <th style="padding:10px;border-bottom:1px solid #e2e8f0;">Categoria</th>
                  <th style="padding:10px;border-bottom:1px solid #e2e8f0;">Documento</th>
                  <th style="padding:10px;border-bottom:1px solid #e2e8f0;">Tipo</th>
                  <th style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">Monto</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      </div>
    `
  }

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSendingEmail(true)

    try {
      const pdfBlob = createPdfBlob()
      const pdfFileName = getReportFileName(mes)
      const pdfBase64 = await pdfBlobToBase64(pdfBlob)
      const htmlContent = buildEmailHtml(pdfFileName)

      const res = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          mes,
          htmlContent,
          pdfBase64,
          pdfFileName,
          facturasIds: facturas.map((f) => f.id),
        }),
      })

      if (res.ok) {
        toast.success("Reporte enviado correctamente")
        setShowEmailModal(false)
        setEmail("")
      } else {
        const errorData = await res.json()
        toast.error(`Error al enviar reporte: ${errorData.message || "Error desconocido"}`)
      }
    } catch {
      toast.error("Error de conexion al enviar reporte")
    } finally {
      setSendingEmail(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Reporte Mensual
          </h1>
          <p className="mt-1 text-slate-500">
            Resumen de ingresos y gastos, y opciones para compartir.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 p-4 mb-6 shadow-sm flex flex-wrap gap-3 items-center">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Mes a reportar</label>
          <input
            type="month"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {!loading && facturas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">Total Ingresos</p>
            <p className="text-2xl font-bold text-emerald-600">
              {soles.format(totalIngresos)}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">Total Gastos</p>
            <p className="text-2xl font-bold text-rose-600">
              {soles.format(totalGastos)}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">Balance</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? "text-slate-900" : "text-rose-600"}`}>
              {soles.format(balance)}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-100 flex gap-3 flex-wrap bg-slate-50/50">
          <button
            onClick={handleDownloadPDF}
            disabled={facturas.length === 0}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            <Download size={16} /> PDF
          </button>
          <button
            onClick={handleShareWhatsApp}
            disabled={facturas.length === 0}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50"
          >
            <MessageCircle size={16} /> WhatsApp
          </button>
          <button
            onClick={() => setShowEmailModal(true)}
            disabled={facturas.length === 0}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50"
          >
            <Send size={16} /> Enviar por Correo
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 className="animate-spin mr-2" size={20} />
            Calculando reporte...
          </div>
        ) : facturas.length === 0 ? (
          <div className="text-center py-16 px-4">
            <FileText className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-slate-600 font-medium">No hay facturas este mes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Proveedor</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Documento</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {facturas.map((f) => (
                  <tr key={f.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-700">{f.fecha}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{f.proveedor}</td>
                    <td className="px-4 py-3 text-slate-600">{f.categoria}</td>
                    <td className="px-4 py-3 text-slate-600">{f.tipoDocumento}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          f.tipoMovimiento === "Gasto"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {f.tipoMovimiento}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {soles.format(f.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showEmailModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <form onSubmit={handleSendEmail}>
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-bold text-lg text-slate-900">Enviar Reporte</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Se enviara el resumen y el PDF adjunto a este correo.
                </p>
              </div>
              <div className="p-5">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Correo destino
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contabilidad@ejemplo.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-black text-sm focus:outline-none focus:ring-4 focus:ring-brand/15 focus:border-brand/60"
                />
              </div>
              <div className="p-5 bg-slate-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="inline-flex items-center justify-center bg-brand hover:bg-brand-light text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50"
                >
                  {sendingEmail ? <Loader2 className="animate-spin" size={16} /> : "Enviar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
