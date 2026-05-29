import { prisma } from "@/lib/prisma"

export async function getOrCreateEmpresaForUsuario(
  usuarioId: number,
  nombreUsuario?: string
): Promise<number> {
  const link = await prisma.usuarioEmpresa.findFirst({
    where: { usuarioId },
    select: { empresaId: true },
  })

  if (link) return link.empresaId

  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { nombre: true },
  })

  const empresa = await prisma.empresa.create({
    data: {
      nombre: nombreUsuario
        ? `Empresa de ${nombreUsuario}`
        : `Empresa de ${usuario?.nombre ?? "Usuario"}`,
    },
  })

  await prisma.usuarioEmpresa.create({
    data: { usuarioId, empresaId: empresa.id },
  })

  return empresa.id
}
