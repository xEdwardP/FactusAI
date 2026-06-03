"use client"

import { useEffect, useState } from "react"
import { Clock, Loader2, CheckCircle2, XCircle, Send } from "lucide-react"

type Envio = {
  id: number
  timestamp: string
  destinatario: string
  medioEnvio: "Email" | "WhatsApp" | "Otro"
  estado: "Enviado" | "Fallido" | "Entregado"
}

export default function ActivityPage() {
  const [envios, setEnvios] = useState<Envio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/activity")
      .then((r) => r.json())
      .then((data) => {
        setEnvios(data.envios ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Actividad
          </h1>
          <p className="mt-1 text-slate-500">
            Historial de envíos de reportes.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 className="animate-spin mr-2" size={20} />
            Cargando historial…
          </div>
        ) : envios.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Clock className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-slate-600 font-medium">No hay actividad</p>
            <p className="text-sm text-slate-400 mt-1">
              Aún no has compartido ningún reporte.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Fecha y Hora</th>
                  <th className="px-4 py-3 font-medium">Destinatario</th>
                  <th className="px-4 py-3 font-medium">Medio</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {envios.map((envio) => (
                  <tr
                    key={envio.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3 text-slate-700">
                      {new Date(envio.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {envio.destinatario}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                        {envio.medioEnvio === "WhatsApp" ? (
                          <MessageCircleIcon size={14} className="text-green-600" />
                        ) : (
                          <Send size={14} className="text-blue-600" />
                        )}
                        {envio.medioEnvio}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                          envio.estado === "Enviado" || envio.estado === "Entregado"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {envio.estado === "Fallido" ? (
                          <XCircle size={14} />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                        {envio.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function MessageCircleIcon({ size, className }: { size: number, className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  )
}
