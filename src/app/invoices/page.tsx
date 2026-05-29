"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { FileText, Loader2, Plus } from "lucide-react"
import type { Catalogos, FacturaDTO } from "@/types/factura"

const inputClass =
  "px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-brand/15 focus:border-brand/60"

function currentMonthValue() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}

export default function InvoicesPage() {
  const [facturas, setFacturas] = useState<FacturaDTO[]>([])
  const [catalogos, setCatalogos] = useState<Catalogos | null>(null)
  const [mes, setMes] = useState(currentMonthValue())
  const [categoriaId, setCategoriaId] = useState("")
  const [loading, setLoading] = useState(true)

  const loadFacturas = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (mes) params.set("mes", mes)
    if (categoriaId) params.set("categoriaId", categoriaId)

    const res = await fetch(`/api/facturas?${params}`)
    const data = await res.json()
    setFacturas(data.facturas ?? [])
    setLoading(false)
  }, [mes, categoriaId])

  useEffect(() => {
    fetch("/api/catalogos")
      .then((r) => r.json())
      .then(setCatalogos)
  }, [])

  useEffect(() => {
    loadFacturas()
  }, [loadFacturas])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Mis facturas
          </h1>
          <p className="mt-1 text-slate-500">
            Listado con filtros por mes y categoría.
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-light text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
        >
          <Plus size={16} />
          Nueva factura
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 p-4 mb-6 shadow-sm flex flex-wrap gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Mes</label>
          <input
            type="month"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Categoría
          </label>
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className={inputClass}
          >
            <option value="">Todas</option>
            {catalogos?.categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              setMes("")
              setCategoriaId("")
            }}
            className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 className="animate-spin mr-2" size={20} />
            Cargando facturas…
          </div>
        ) : facturas.length === 0 ? (
          <div className="text-center py-16 px-4">
            <FileText className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-slate-600 font-medium">No hay facturas</p>
            <p className="text-sm text-slate-400 mt-1">
              Registra una factura o ajusta los filtros.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Proveedor</th>
                  <th className="px-4 py-3 font-medium">Categoría</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium text-right">Monto</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {facturas.map((f) => (
                  <tr
                    key={f.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3 text-slate-700">{f.fecha}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {f.proveedor}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{f.categoria}</td>
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
                      S/ {f.monto.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/invoices/${f.id}`}
                        className="text-brand hover:text-brand-light font-medium"
                      >
                        Ver →
                      </Link>
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
