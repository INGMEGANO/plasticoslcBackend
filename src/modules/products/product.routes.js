import { Router } from 'express'
import { auth } from '../../middlewares/auth.middleware.js'
import { audit } from '../../middlewares/audit.middleware.js'
import {
  create,
  list,
  getById,
  update,
  activate,
  deactivate,
  move
} from './product.controller.js'

console.log('✅ product.routes.js cargado')

const router = Router()

router.post(
  '/',
  auth,
  audit({ action: 'CREATE', module: 'PRODUCT' }),
  create
)

router.get('/', list)

// 🔥 FALTABAN ESTAS DOS
router.get('/:id', getById)

router.put(
  '/:id',
  auth,
  audit({ action: 'UPDATE', module: 'PRODUCT' }),
  update
)

router.patch(
  '/:id/activate',
  auth,
  audit({ action: 'ACTIVATE', module: 'PRODUCT' }),
  activate
)

router.patch(
  '/:id/deactivate',
  auth,
  audit({ action: 'DEACTIVATE', module: 'PRODUCT' }),
  deactivate
)

router.post(
  '/:id/move',
  auth,
  audit({ action: 'MOVE_STOCK', module: 'INVENTORY' }),
  move
)

export default router
