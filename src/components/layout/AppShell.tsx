"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ""

  const isAuthRoute = pathname.startsWith("/auth")

  if (isAuthRoute) {
    return <div>{children}</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        <Navbar />
        <main className="p-6 md:px-10 md:py-8">{children}</main>
      </div>
    </div>
  )
}
