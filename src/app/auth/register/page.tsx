"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  User,
  ScanLine,
  Brain,
  Send,
  CheckCircle2,
} from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    confirmar: "",
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const passwordChecks = [
    { label: "Mínimo 8 caracteres", valid: form.contrasena.length >= 8 },
    { label: "Las contraseñas coinciden", valid: form.contrasena.length > 0 && form.contrasena === form.confirmar },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.contrasena !== form.confirmar) {
      toast.error("Las contraseñas no coinciden.")
      return
    }

    if (form.contrasena.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          correo: form.correo,
          contrasena: form.contrasena,
        }),
      })

      let data;
      try {
        data = await res.json()
      } catch (err) {
        throw new Error("El servidor no devolvió una respuesta válida. Intenta nuevamente.")
      }

      setLoading(false)

      if (!res.ok) {
        toast.error(data?.message || "Error al registrar usuario.")
      } else {
        // Iniciar sesión automáticamente
        const loginResult = await signIn("credentials", {
          redirect: false,
          email: form.correo,
          password: form.contrasena,
        })

        if (loginResult?.error) {
          toast.error("Usuario creado, pero hubo un error al iniciar sesión.")
        } else {
          toast.success("¡Cuenta creada exitosamente!")
          router.push("/")
        }
      }
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message || "Error de conexión con el servidor.")
    }
  }

  return (
    <main className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      {/* ── Left Panel: Branding ── */}
      <div className="hidden lg:flex relative flex-col justify-between overflow-hidden bg-brand px-14 py-12 text-white">
        {/* Decorative floating shapes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/5 blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 h-56 w-56 rounded-full bg-white/5 blur-3xl animate-pulse [animation-delay:2s]" />
        </div>

        {/* Brand mark */}
        <div className="relative z-10 flex justify-center mb-3">
          <Image
            src="/assets/logo.png"
            alt="FactusAI"
            width={150}
            height={75}
            priority
            className="brightness-0 invert drop-shadow-md"
          />
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-10">
          <div>
            <h2 className="text-4xl font-extrabold leading-tight mb-4">
              Organiza tus facturas
              <br />
              <span className="text-sky-300">
                de forma inteligente
              </span>
            </h2>
            <p className="text-slate-300 text-base leading-relaxed max-w-md">
              Registra, clasifica y envía tus comprobantes a tu contadora en
              segundos. Sin caos, sin papeles.
            </p>
          </div>

          <div className="space-y-5">
            {[
              { icon: ScanLine, text: "Digitaliza tus facturas fácilmente" },
              { icon: Brain, text: "Clasificación automática con IA" },
              { icon: Send, text: "Envío directo por WhatsApp o correo" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                  <Icon size={16} className="text-sky-300" />
                </div>
                <span className="text-sm text-slate-200">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-400">
          © {new Date().getFullYear()} FactusAI. Todos los derechos reservados.
        </p>
      </div>

      {/* ── Right Panel: Register Form ── */}
      <div className="flex flex-col justify-center items-center bg-slate-50 min-h-screen px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile-only logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Image
              src="/assets/logo.png"
              alt="FactusAI"
              width={120}
              height={60}
              priority
            />
          </div>

          <h1 className="text-2xl font-bold text-brand mb-1">
            Crear cuenta
          </h1>
          <p className="text-sm text-slate-500 mb-8">
            Completa los datos para registrarte
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="register-nombre"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Nombre completo
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <User size={16} className="text-slate-400" />
                </div>
                <input
                  id="register-nombre"
                  name="nombre"
                  type="text"
                  required
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Juan Pérez"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="register-correo"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail size={16} className="text-slate-400" />
                </div>
                <input
                  id="register-correo"
                  name="correo"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.correo}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="register-contrasena"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock size={16} className="text-slate-400" />
                </div>
                <input
                  id="register-contrasena"
                  name="contrasena"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={form.contrasena}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="register-confirmar"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Confirmar contraseña
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock size={16} className="text-slate-400" />
                </div>
                <input
                  id="register-confirmar"
                  name="confirmar"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={form.confirmar}
                  onChange={handleChange}
                  placeholder="Repite tu contraseña"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Password strength indicators */}
            {form.contrasena.length > 0 && (
              <div className="space-y-1.5">
                {passwordChecks.map(({ label, valid }) => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    <CheckCircle2
                      size={14}
                      className={valid ? "text-emerald-500" : "text-slate-300"}
                    />
                    <span className={valid ? "text-emerald-600" : "text-slate-400"}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-light active:scale-[0.98] text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-lg shadow-brand/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Registrando…
                </span>
              ) : (
                "Crear cuenta"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-brand hover:text-brand-light transition-colors"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}