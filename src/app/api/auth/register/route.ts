import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { nombre, correo, contrasena } = await req.json()

    if (!nombre || !correo || !contrasena) {
      return NextResponse.json(
        { message: "Todos los campos son requeridos." },
        { status: 400 }
      )
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { correo },
    })

    if (usuarioExistente) {
      return NextResponse.json(
        { message: "El correo ya está registrado." },
        { status: 409 }
      )
    }

    const hash = await bcrypt.hash(contrasena, 12)
    
    // Generar un identificador único menor a 20 caracteres
    const usernamePart = correo.split('@')[0].substring(0, 10);
    const randomPart = Math.random().toString(36).substring(2, 8);
    const identificador = `${usernamePart}_${randomPart}`;

    await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          nombre,
          correo,
          contrasena: hash,
          identificador,
          estado: "Activo",
        },
      })

      const empresa = await tx.empresa.create({
        data: { nombre: `Empresa de ${nombre}` },
      })

      await tx.usuarioEmpresa.create({
        data: { usuarioId: usuario.id, empresaId: empresa.id },
      })
    })

    return NextResponse.json(
      { message: "Usuario registrado correctamente." },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Register Error:", error)
    return NextResponse.json(
      { message: error?.message || "Error interno del servidor." },
      { status: 500 }
    )
  }
}