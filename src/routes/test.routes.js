import { Router } from 'express'
import { auth } from '../middlewares/auth.middleware.js'
import { audit } from '../middlewares/audit.middleware.js'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.post(
  '/test-audit',
  auth,
  audit({ action: 'TEST_ACTION', module: 'SYSTEM' }),
  async (req, res) => {
    res.json({
      entity: { id: 'test-123', message: 'Auditoría funcionando' }
    })
  }
)

// Debug endpoint para ver datos de invoices (sin auth)
router.get('/debug/invoices', async (req, res) => {
  try {
    const total = await prisma.invoice.count()
    const statuses = await prisma.invoice.groupBy({
      by: ['status'],
      _count: true
    })
    const sample = await prisma.invoice.findMany({
      take: 5,
      select: {
        id: true,
        status: true,
        orderDate: true,
        dueDate: true,
        paidAt: true,
        orderTotalAmountDue: true,
        orderTotalAfterTax: true
      }
    })
    
    res.json({
      ok: true,
      total,
      statuses,
      sample,
      now: new Date(),
      monthStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      monthEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    })
  } catch (error) {
    res.json({ ok: false, error: error.message })
  }
})

export default router
