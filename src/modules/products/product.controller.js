import { createProduct, listProducts } from './product.service.js'
import { moveStock } from './inventory.service.js'

export async function create(req, res) {
  const product = await createProduct(req.body)
  res.json({ entity: product })
}

export async function list(req, res) {
  const products = await listProducts()
  res.json(products)
}

export async function move(req, res) {
  const { type, quantity, reason } = req.body

  const [product] = await moveStock({
    productId: req.params.id,
    type,
    quantity,
    reason
  })

  res.json({ entity: product })
}
