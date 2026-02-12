import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ✅ Crear empresa
export async function createCompany(data) {
  return prisma.company.create({
    data
  })
}

// ✅ Listar empresas
export async function getCompanies() {
  return prisma.company.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" }
  })
}

// ✅ Obtener por ID
export async function getCompanyById(id) {
  return prisma.company.findUnique({
    where: { id }
  })
}

// ✅ Actualizar empresa
export async function updateCompany(id, data) {
  return prisma.company.update({
    where: { id },
    data
  })
}

// ✅ Desactivar (mejor que borrar)
export async function deleteCompany(id) {
  return prisma.company.update({
    where: { id },
    data: { active: false }
  })
}

export async function activateCompany(id) {
  return prisma.company.update({
    where: { id },
    data: { active: true }
  })
}
