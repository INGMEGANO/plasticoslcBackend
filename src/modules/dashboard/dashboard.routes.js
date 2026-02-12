import { Router } from 'express'
import { auth } from '../../middlewares/auth.middleware.js'
import { invoiceDashboard, monthlySalesChart  } from './dashboard.controller.js'

const router = Router()

router.get('/invoices', auth, invoiceDashboard)
router.get('/invoices/monthly-sales', auth, monthlySalesChart)


export default router
