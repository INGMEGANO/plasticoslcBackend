// src/modules/users/user.service.js
import { PrismaClient } from '@prisma/client'

import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/* =========================
   CREATE USER
========================= */
export async function createUser(data) {
  const { name, email, password, roleIds = [] } = data

  const existing = await prisma.user.findUnique({
    where: { email }
  })

  if (existing) {
    throw new Error('Email already exists')
  }

  const hashed = await bcrypt.hash(password, 10)

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      active: true,
      roles: {
        create: roleIds.map(roleId => ({
          role: { connect: { id: roleId } }
        }))
      }
    },
    include: {
      roles: {
        include: { role: true }
      }
    }
  })
}

/* =========================
   UPDATE USER (NO PASSWORD)
========================= */
export async function updateUser(id, data) {
  const { name, email, active, roleIds } = data

  return prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      active,
      roles: roleIds
        ? {
            deleteMany: {},
            create: roleIds.map(roleId => ({
              role: { connect: { id: roleId } }
            }))
          }
        : undefined
    },
    include: {
      roles: {
        include: { role: true }
      }
    }
  })
}

/* =========================
   CHANGE PASSWORD (ADMIN)
========================= */
export async function changePassword(userId, newPassword) {
  const hashed = await bcrypt.hash(newPassword, 10)

  return prisma.user.update({
    where: { id: userId },
    data: { password: hashed }
  })
}

/* =========================
   TOGGLE ACTIVE
========================= */
export async function toggleUser(id) {
  const user = await prisma.user.findUnique({ where: { id } })

  return prisma.user.update({
    where: { id },
    data: { active: !user.active }
  })
}

/* =========================
   LIST USERS (PAGINATED)
========================= */
export async function listUsers(page = 1, limit = 10) {
  const skip = (page - 1) * limit

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      include: {
        roles: {
          include: { role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count()
  ])

  return {
    data: users,
    meta: {
      total,
      page,
      lastPage: Math.ceil(total / limit)
    }
  }
}
