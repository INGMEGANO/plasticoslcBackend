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


// Obtener producto por ID
export async function getProductById(id) {
  return prisma.product.findUnique({
    where: { id }
  })
}

// Editar producto
export async function updateProduct(id, data) {
  // Validar que exista
  const product = await prisma.product.findUnique({
    where: { id }
  })

  if (!product) {
    throw new Error('Producto no encontrado')
  }

  return prisma.product.update({
    where: { id },
    data
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
