import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.routes.js'
import testRoutes from './routes/test.routes.js'

import productRoutes from './modules/products/product.routes.js'

import invoiceRoutes from './modules/invoices/invoice.routes.js'



dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// health check
app.get('/api', (req, res) => {
  res.json({ ok: true, message: 'API Plasticos LC funcionando 🚀' })
})

app.use('/api/auth', authRoutes)
app.use('/api/test', testRoutes)

app.use('/api/products', productRoutes)

app.use('/api/invoices', invoiceRoutes)

export default app
