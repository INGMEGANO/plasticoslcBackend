import { Router } from 'express'
import * as controller from './invoice.controller.js'
import { auth } from '../../middlewares/auth.middleware.js'
import { audit } from '../../middlewares/audit.middleware.js'

const router = Router()

router.post(
  '/',
  auth,
  audit({ action: 'CREATE', module: 'INVOICE' }),
  controller.create
)

router.put(
  '/:id',
  auth,
  audit({ action: 'UPDATE', module: 'INVOICE' }),
  controller.update
)

router.get('/', auth, controller.list)

router.get('/:id', auth, controller.getById)

router.patch(
  '/:prefix/:number/cancel',
  auth,
  audit({ action: 'VOID', module: 'INVOICE' }),
  controller.cancel
)

router.get('/:prefix/:number', auth, controller.getByNumber)

export default router
