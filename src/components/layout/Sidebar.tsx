"use client"

import Link from "next/link"
import {
  LayoutDashboard,
  Upload,
  FileText,
  BarChart3,
  Clock,
} from "lucide-react"

export default function Sidebar() {
  const items = [
    { href: "/", label: "Inicio", icon: LayoutDashboard },
    { href: "/upload", label: "Subir factura", icon: Upload },
    { href: "/invoices", label: "Mis facturas", icon: FileText },
    { href: "/reports", label: "Reportes", icon: BarChart3 },
    { href: "/activity", label: "Actividad", icon: Clock },
  ]

  return (
    <aside className="w-72 hidden md:flex flex-col bg-white border-r border-slate-200">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <Link href="/">
          <img src="/assets/logo.png" alt="FactusAI" className="w-36" />
        </Link>
      </div>

      <nav className="p-4 flex-1">
        <ul className="space-y-1">
          {items.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span className="p-2 bg-slate-100 rounded-md">
                  <Icon size={16} />
                </span>
                <span className="text-sm font-medium">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <p className="text-xs text-slate-400">FactusAI • Administración</p>
      </div>
    </aside>
  )
}
