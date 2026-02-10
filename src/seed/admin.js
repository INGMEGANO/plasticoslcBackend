import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('Admin123*', 10)

  const user = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@plasticoslc.com',
      password
    }
  })

  const role = await prisma.role.create({
    data: {
      name: 'SUPER_ADMIN',
      description: 'Acceso total al sistema'
    }
  })

  await prisma.userRole.create({
    data: {
      userId: user.id,
      roleId: role.id
    }
  })

  console.log('SUPER ADMIN creado')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
