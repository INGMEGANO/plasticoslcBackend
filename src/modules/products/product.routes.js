import { Router } from 'express'
import { auth } from '../../middlewares/auth.middleware.js'
import { audit } from '../../middlewares/audit.middleware.js'
import * as controller from './product.controller.js'

console.log('✅ product.routes.js cargado')

const router = Router()

router.post(
  '/',
  auth,
  audit({ action: 'CREATE', module: 'PRODUCT' }),
  controller.create
)

router.get('/', auth, controller.list)

router.post(
  '/:id/move',
  auth,
  audit({ action: 'MOVE_STOCK', module: 'INVENTORY' }),
  controller.move
)

export default router
