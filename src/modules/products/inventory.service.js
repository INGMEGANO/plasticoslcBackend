import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function moveStock({ productId, type, quantity, reason }) {
  const product = await prisma.product.findUnique({
    where: { id: productId }
  })

  if (!product) throw new Error('Producto no existe')

  let newStock = product.stock

  if (type === 'IN') newStock += quantity
  if (type === 'OUT') {
    if (product.stock < quantity) {
      throw new Error('Stock insuficiente')
    }
    newStock -= quantity
  }
  if (type === 'ADJUST') newStock = quantity

  return prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: { stock: newStock }
    }),
    prisma.inventoryMovement.create({
      data: { productId, type, quantity, reason }
    })
  ])
}
