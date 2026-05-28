"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react"
import AuthSplitLayout from "@/components/auth/AuthSplitLayout"

export default function LoginPage() {
  const router = useRouter()
  const [correo, setCorreo] = useState("")
  const [contrasena, setContrasena] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: correo,
        password: contrasena,
      })

      setLoading(false)

      if (result?.error) {
        toast.error("Correo o contraseña incorrectos.")
      } else {
        toast.success("¡Bienvenido de nuevo!")
        router.push("/")
      }
    } catch (err: any) {
      setLoading(false)
      toast.error("Error de conexión al iniciar sesión.")
    }
  }

  return (
    <AuthSplitLayout
      title="Bienvenido de nuevo"
      subtitle="Ingresa tus credenciales para continuar"
    >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="login-correo"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail size={16} className="text-slate-400" />
                </div>
                <input
                  id="login-correo"
                  type="email"
                  autoComplete="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand/15 focus:border-brand/60 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-contrasena"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock size={16} className="text-slate-400" />
                </div>
                <input
                  id="login-contrasena"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand/15 focus:border-brand/60 transition-all"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-light active:scale-[0.98] text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-lg shadow-brand/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus:ring-4 focus:ring-brand/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Iniciando sesión…
                </span>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-7">
            ¿No tienes cuenta?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-brand hover:text-brand-light transition-colors"
            >
              Regístrate
            </Link>
          </p>
    </AuthSplitLayout>
  )
}