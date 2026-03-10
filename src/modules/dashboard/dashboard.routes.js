import { Router } from 'express'
import { auth } from '../../middlewares/auth.middleware.js'
import { invoiceDashboard, monthlySalesChart  } from './dashboard.controller.js'
import * as controller from "./dashboard.controller.js"

const router = Router()

router.get('/invoices', auth, invoiceDashboard)
router.get('/invoices/monthly-sales', auth, monthlySalesChart)


router.get("/sales-today", controller.salesToday)

router.get("/sales-month", controller.salesMonth)

router.get("/accounts-receivable", controller.accountsReceivable)

router.get("/top-products", controller.topProducts)

router.get("/cash-flow", controller.cashFlow)

router.get("/", controller.fullDashboard)

export default router
