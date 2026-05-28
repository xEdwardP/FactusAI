"use client"

import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { LogOut, User } from "lucide-react"

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div />

        <div className="flex items-center gap-4">
          <Link href="/profile" className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-700">
                {session?.user?.name || "Usuario"}
              </p>
              <p className="text-xs text-slate-400">{session?.user?.email || ""}</p>
            </div>
            <div className="h-9 w-9 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt={session.user.name || "User"} className="h-9 w-9 object-cover" />
              ) : (
                <User size={16} className="text-slate-500" />
              )}
            </div>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  )
}
