import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.routes.js'
import testRoutes from './routes/test.routes.js'

import accessRoutes from './modules/access/access.routes.js';

import userRoutes from './modules/users/user.routes.js'

import productRoutes from './modules/products/product.routes.js'

import invoiceRoutes from './modules/invoices/invoice.routes.js'

import resolutionRoutes from "./modules/resolution/resolution.routes.js";

import purchaseRoutes from './modules/purchases/purchase.routes.js'

import supplierRoutes from "./modules/supplier/supplier.routes.js";

import customerRoutes from "./modules/customer/customer.routes.js";



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
app.use('/api', accessRoutes);

app.use('/api/users', userRoutes)

app.use('/api/products', productRoutes)

app.use('/api/invoices', invoiceRoutes)

app.use("/api/resolutions", resolutionRoutes);

app.use('/api/purchases', purchaseRoutes)

app.use("/api/suppliers", supplierRoutes);

app.use("/api/customers", customerRoutes);

export default app
