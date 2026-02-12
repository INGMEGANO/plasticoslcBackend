import { Router } from 'express'
import { auth } from '../../middlewares/auth.middleware.js'
import { invoiceDashboard } from './dashboard.controller.js'

const router = Router()

router.get('/invoices', auth, invoiceDashboard)

export default router
