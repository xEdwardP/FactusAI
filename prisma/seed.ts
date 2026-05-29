import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

const categorias = [
  { nombre: "Alimentación", descripcion: "Comidas, supermercado y restaurantes" },
  { nombre: "Transporte", descripcion: "Combustible, pasajes y movilidad" },
  { nombre: "Salud", descripcion: "Farmacia, consultas y seguros" },
  { nombre: "Servicios", descripcion: "Luz, agua, internet y telefonía" },
  { nombre: "Oficina", descripcion: "Útiles, equipos y suministros" },
  { nombre: "Otros", descripcion: "Gastos varios" },
]

const tiposDocumento = [
  "Factura",
  "Boleta",
  "Recibo",
  "Nota de crédito",
  "Ticket",
]

async function main() {
  for (const cat of categorias) {
    const existing = await prisma.categoriaGasto.findFirst({
      where: { nombre: cat.nombre },
    })
    if (!existing) {
      await prisma.categoriaGasto.create({ data: cat })
    }
  }

  for (const nombre of tiposDocumento) {
    const existing = await prisma.tipoDocumento.findFirst({
      where: { nombre },
    })
    if (!existing) {
      await prisma.tipoDocumento.create({ data: { nombre } })
    }
  }

  console.log("Seed completado: categorías y tipos de documento.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
