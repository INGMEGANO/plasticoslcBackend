import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createProduct(data) {
  return prisma.product.create({
    data
  })
}

export async function listProducts({ active } = {}) {
  return prisma.product.findMany({
    where:
      active === undefined
        ? {}
        : { active }
  })
}

export async function activateProduct(id) {
  return prisma.product.update({
    where: { id },
    data: { active: true }
  })
}

export async function deactivateProduct(id) {
  return prisma.product.update({
    where: { id },
    data: { active: false }
  })
}
