import { Router } from 'express'
import { auth } from '../../middlewares/auth.middleware.js'
import { audit } from '../../middlewares/audit.middleware.js'
import {
  create,
  list,
  activate,
  deactivate,
  move
} from './product.controller.js'

console.log('✅ product.routes.js cargado')

const router = Router()

// crear producto
router.post(
  '/',
  auth,
  audit({ action: 'CREATE', module: 'PRODUCT' }),
  create
)

// listar productos
router.get('/', list)

// activar producto
router.patch(
  '/:id/activate',
  auth,
  audit({ action: 'ACTIVATE', module: 'PRODUCT' }),
  activate
)

// desactivar producto
router.patch(
  '/:id/deactivate',
  auth,
  audit({ action: 'DEACTIVATE', module: 'PRODUCT' }),
  deactivate
)

// mover stock
router.post(
  '/:id/move',
  auth,
  audit({ action: 'MOVE_STOCK', module: 'INVENTORY' }),
  move
)

export default router
