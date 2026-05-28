"use client"

import Image from "next/image"
import { useSession } from "next-auth/react"
import { LayoutDashboard, Upload, BarChart3, Clock } from "lucide-react"

export default function HomePage() {
  const { data: session } = useSession()

  // Datos de ejemplo para el plugin de inicio
  const summary = {
    total: 124,
    invoices: 124,
    monthAmount: 23450.75,
    latest: [
      { id: "F-2026-001", customer: "ACME S.A.", total: 3450.5 },
      { id: "F-2026-002", customer: "Distribuciones X", total: 1200 },
      { id: "F-2026-003", customer: "Servicios Y", total: 785.25 },
    ],
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">
          ¡Hola, {session?.user?.name?.split(" ")[0] || "Usuario"}!
        </h1>
        <p className="text-slate-500">Resumen rápido de tu actividad</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-500">Total</p>
          <p className="text-2xl font-semibold text-slate-800">{summary.total}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-500">Facturas</p>
          <p className="text-2xl font-semibold text-slate-800">{summary.invoices}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-500">Monto del mes</p>
          <p className="text-2xl font-semibold text-slate-800">S/ {summary.monthAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-500">Últimas facturas</p>
          <p className="text-2xl font-semibold text-slate-800">{summary.latest.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Acciones rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: Upload,
                title: "Subir factura",
                desc: "Digitaliza un nuevo comprobante",
                color: "from-indigo-500 to-indigo-600",
              },
              {
                icon: LayoutDashboard,
                title: "Mis facturas",
                desc: "Ver todas tus facturas registradas",
                color: "from-violet-500 to-violet-600",
              },
              {
                icon: BarChart3,
                title: "Reportes",
                desc: "Estadísticas y gráficas de gastos",
                color: "from-emerald-500 to-emerald-600",
              },
              {
                icon: Clock,
                title: "Actividad",
                desc: "Historial de envíos recientes",
                color: "from-amber-500 to-amber-600",
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="flex items-start gap-4 bg-slate-50 p-4 rounded-lg">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Últimas facturas</h3>
          <ul className="space-y-3">
            {summary.latest.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">{inv.id}</p>
                  <p className="text-xs text-slate-400">{inv.customer}</p>
                </div>
                <div className="text-sm font-semibold text-slate-700">S/ {inv.total.toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}
