import { Router } from 'express'
import { auth } from '../middlewares/auth.middleware.js'
import { audit } from '../middlewares/audit.middleware.js'

const router = Router()

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

export default router
