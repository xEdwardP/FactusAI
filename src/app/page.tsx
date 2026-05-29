"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { LayoutDashboard, Upload, BarChart3, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import type { DashboardSummary } from "@/types/dashboard"

export default function HomePage() {
  const { data: session } = useSession()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setSummary(data))
      .finally(() => setLoading(false))
  }, [])

  const cards = summary
    ? [
        { label: "Total facturas", value: summary.totalFacturas },
        { label: "Facturas del mes", value: summary.facturasMes },
        {
          label: "Gastos del mes",
          value: `S/ ${summary.montoMesGastos.toLocaleString("es-PE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        },
        { label: "Recientes", value: summary.ultimas.length },
      ]
    : []

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Panel • Resumen general
        </div>
        <h1 className="mt-3 text-2xl md:text-3xl font-bold text-slate-900">
          ¡Hola, {session?.user?.name?.split(" ")[0] || "Usuario"}!
        </h1>
        <p className="mt-1 text-slate-500">
          Resumen rápido de tu actividad y accesos directos.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center justify-center min-h-[100px]"
              >
                <Loader2 className="animate-spin text-slate-400" size={20} />
              </div>
            ))
          : cards.map(({ label, value }) => (
              <div
                key={label}
                className="group bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {value}
                </p>
                <div className="mt-4 h-1 w-10 rounded-full bg-slate-200 group-hover:bg-brand/30 transition-colors" />
              </div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Acciones rápidas
            </h2>
            <span className="text-xs text-slate-500">
              Hazlo en 1–2 clics
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: Upload,
                title: "Subir factura",
                desc: "Digitaliza un nuevo comprobante",
                color: "from-indigo-500 to-indigo-600",
                href: "/upload",
              },
              {
                icon: LayoutDashboard,
                title: "Mis facturas",
                desc: "Ver todas tus facturas registradas",
                color: "from-violet-500 to-violet-600",
                href: "/invoices",
              },
              {
                icon: BarChart3,
                title: "Reportes",
                desc: "Estadísticas y gráficas de gastos",
                color: "from-emerald-500 to-emerald-600",
                href: "/reports",
              },
              {
                icon: Clock,
                title: "Actividad",
                desc: "Historial de envíos recientes",
                color: "from-amber-500 to-amber-600",
                href: "/activity",
              },
            ].map(({ icon: Icon, title, desc, color, href }) => (
              <Link
                key={title}
                href={href}
                className="group relative flex items-start gap-4 rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div
                  className={`h-11 w-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-sm`}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {title}
                  </h3>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
                <span className="absolute right-4 top-4 text-xs text-slate-400 group-hover:text-slate-600 transition-colors">
                  Ir →
                </span>
              </Link>
            ))}
          </div>
        </div>

        <aside className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Últimas facturas
            </h3>
            <Link
              href="/invoices"
              className="text-xs font-medium text-brand hover:text-brand-light transition-colors"
            >
              Ver todas
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-slate-400" size={20} />
            </div>
          ) : !summary?.ultimas.length ? (
            <p className="text-sm text-slate-500 text-center py-8">
              Aún no tienes facturas registradas.
            </p>
          ) : (
            <ul className="space-y-3">
              {summary.ultimas.map((inv) => (
                <li key={inv.id}>
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {inv.proveedor}
                      </p>
                      <p className="text-xs text-slate-400">{inv.fecha}</p>
                    </div>
                    <div className="text-sm font-semibold text-slate-800">
                      S/ {inv.monto.toFixed(2)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  )
}
