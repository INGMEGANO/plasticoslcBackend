import { Router } from 'express'
import {
  create,
  update,
  confirm,
  cancel,
  list,
  getById
} from './purchase.controller.js'

import { auth } from '../../middlewares/auth.middleware.js'
import { audit } from '../../middlewares/audit.middleware.js'

const router = Router()

router.post(
  '/',
  auth,
  audit({ action: 'CREATE', module: 'PURCHASE' }),
  create
)

router.put(
  '/:id',
  auth,
  audit({ action: 'UPDATE', module: 'PURCHASE' }),
  update
)

router.patch(
  '/:id/confirm',
  auth,
  audit({ action: 'CONFIRM', module: 'PURCHASE' }),
  confirm
)

router.patch(
  '/:id/cancel',
  auth,
  audit({ action: 'CANCEL', module: 'PURCHASE' }),
  cancel
)

router.get('/', auth, list)

router.get('/:id', auth, getById)

export default router
