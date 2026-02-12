import { Router } from 'express'
import { downloadInvoicePDF } from './invoice-pdf.controller.js'
import { auth } from '../../middlewares/auth.middleware.js'

const router = Router()

router.get('/:id/pdf', auth, downloadInvoicePDF)

export default router
