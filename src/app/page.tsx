"use client"

import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import {
  LogOut,
  LayoutDashboard,
  Upload,
  BarChart3,
  Clock,
} from "lucide-react"

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/logo.png"
              alt="FactusAI"
              width={110}
              height={55}
              priority
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-700">
                {session?.user?.name || "Usuario"}
              </p>
              <p className="text-xs text-slate-400">
                {session?.user?.email || ""}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all"
            >
              <LogOut size={16} />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            ¡Hola, {session?.user?.name?.split(" ")[0] || "Usuario"}!
          </h1>
          <p className="text-slate-500">
            Bienvenido a tu panel de gestión de facturas
          </p>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: Upload,
              title: "Subir factura",
              desc: "Digitaliza un nuevo comprobante",
              color: "from-indigo-500 to-indigo-600",
              shadow: "shadow-indigo-500/20",
            },
            {
              icon: LayoutDashboard,
              title: "Mis facturas",
              desc: "Ver todas tus facturas registradas",
              color: "from-violet-500 to-violet-600",
              shadow: "shadow-violet-500/20",
            },
            {
              icon: BarChart3,
              title: "Reportes",
              desc: "Estadísticas y gráficas de gastos",
              color: "from-emerald-500 to-emerald-600",
              shadow: "shadow-emerald-500/20",
            },
            {
              icon: Clock,
              title: "Actividad",
              desc: "Historial de envíos recientes",
              color: "from-amber-500 to-amber-600",
              shadow: "shadow-amber-500/20",
            },
          ].map(({ icon: Icon, title, desc, color, shadow }) => (
            <div
              key={title}
              className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-lg ${shadow} mb-4`}
              >
                <Icon size={22} className="text-white" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">
                {title}
              </h3>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>

        {/* Placeholder section */}
        <div className="mt-10 bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50">
              <Image 
                src="/assets/logo.png" 
                alt="Logo" 
                width={60} 
                height={30} 
                className="opacity-40 grayscale" 
              />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-2">
            Tu espacio de trabajo está listo
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Comienza subiendo tu primera factura o explorando las funcionalidades
            del sistema.
          </p>
        </div>
      </main>
    </div>
  )
}
