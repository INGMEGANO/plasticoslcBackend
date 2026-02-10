import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createProduct(data) {
  return prisma.product.create({
    data
  })
}

export async function listProducts() {
  return prisma.product.findMany()
}
