import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

export async function getAuthUserId(): Promise<number | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  const id = parseInt(session.user.id, 10)
  return Number.isNaN(id) ? null : id
}

export function unauthorizedResponse() {
  return NextResponse.json({ message: "No autorizado." }, { status: 401 })
}
