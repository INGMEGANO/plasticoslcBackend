import { Router } from 'express'
import { downloadInvoicePDF,sendInvoiceByEmail  } from './invoice-pdf.controller.js'
import { auth } from '../../middlewares/auth.middleware.js'

const router = Router()

router.get('/:id/pdf', auth, downloadInvoicePDF)

router.post('/:id/email', sendInvoiceByEmail)


export default router
