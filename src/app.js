import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.routes.js'
import testRoutes from './routes/test.routes.js'

import productRoutes from './modules/products/product.routes.js'



dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// health check
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'API Plasticos LC funcionando 🚀' })
})

app.use('/auth', authRoutes)
app.use('/test', testRoutes)

app.use('/products', productRoutes)



export default app
