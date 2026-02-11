import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { signToken } from '../utils/jwt.js'

const prisma = new PrismaClient()

export async function login(req, res) {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true }
              }
            }
          }
        }
      }
    }
  })

  if (!user || !user.active) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const roles = user.roles.map(r => r.role.name)

  const permissions = user.roles.flatMap(r =>
    r.role.permissions.map(p => p.permission.code)
  )

  const token = signToken({
    id: user.id,
    roles,
    permissions
  })

  // Quitamos el password antes de enviar
  const { password: _, ...userWithoutPassword } = user

  res.json({
    token,
    user: {
      ...userWithoutPassword,
      roles,
      permissions
    }
  })
}
