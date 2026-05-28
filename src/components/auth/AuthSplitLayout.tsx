"use client"

import Image from "next/image"
import React from "react"
import { Brain, ScanLine, Send } from "lucide-react"

type Benefit = { icon: React.ElementType; text: string }

const defaultBenefits: Benefit[] = [
  { icon: ScanLine, text: "Digitaliza tus facturas fácilmente" },
  { icon: Brain, text: "Clasificación automática con IA" },
  { icon: Send, text: "Envío directo por WhatsApp o correo" },
]

export default function AuthSplitLayout({
  title,
  subtitle,
  children,
  benefits = defaultBenefits,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  benefits?: Benefit[]
}) {
  return (
    <main className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      {/* Left panel */}
      <section className="hidden lg:flex relative flex-col justify-between overflow-hidden bg-brand px-14 py-12 text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-28 -left-28 h-96 w-96 rounded-full bg-white/7 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-16 translate-y-20 rounded-full bg-white/6 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.10),transparent_55%)]" />
        </div>

        <div className="relative z-10 flex justify-center">
          <Image
            src="/assets/logo.png"
            alt="FactusAI"
            width={150}
            height={75}
            priority
            className="brightness-0 invert drop-shadow-md"
          />
        </div>

        <div className="relative z-10 space-y-10">
          <div>
            <h2 className="text-4xl font-extrabold leading-tight mb-4">
              Organiza tus facturas
              <br />
              <span className="text-sky-300">de forma inteligente</span>
            </h2>
            <p className="text-slate-200/90 text-base leading-relaxed max-w-md">
              Registra, clasifica y envía tus comprobantes a tu contadora en
              segundos. Sin caos, sin papeles.
            </p>
          </div>

          <div className="space-y-5">
            {benefits.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                  <Icon size={16} className="text-sky-300" />
                </div>
                <span className="text-sm text-slate-100/90">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-200/60">
          © {new Date().getFullYear()} FactusAI. Todos los derechos reservados.
        </p>
      </section>

      {/* Right panel */}
      <section className="relative flex flex-col justify-center items-center min-h-screen px-6 py-12 bg-white">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(2,132,199,0.12),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.10),transparent_55%)]" />

        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8 lg:hidden">
            <Image
              src="/assets/logo.png"
              alt="FactusAI"
              width={120}
              height={60}
              priority
            />
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-sm shadow-[0_12px_40px_-20px_rgba(15,23,42,0.35)]">
            <div className="p-6 sm:p-7">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                {title}
              </h1>
              <p className="text-sm text-slate-500 mb-7">{subtitle}</p>
              {children}
            </div>
            <div className="px-6 sm:px-7 py-4 border-t border-slate-200/60 bg-slate-50/70 rounded-b-2xl">
              <p className="text-xs text-slate-500">
                Al continuar, aceptas el uso responsable de la plataforma.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

