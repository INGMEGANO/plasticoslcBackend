import { 
  createProduct,
  listProducts,
  activateProduct,
  deactivateProduct } from './product.service.js'
import { moveStock } from './inventory.service.js'

export async function create(req, res) {
  const product = await createProduct(req.body)
  res.json({ entity: product })
}

export async function list(req, res) {
  const { active } = req.query

  const products = await listProducts({
    active:
      active === undefined
        ? undefined
        : active === 'true'
  })

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

export async function activate(req, res) {
  const product = await activateProduct(req.params.id)
  res.json({ entity: product })
}

export async function deactivate(req, res) {
  const product = await deactivateProduct(req.params.id)
  res.json({ entity: product })
}