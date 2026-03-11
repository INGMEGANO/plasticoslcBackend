
import express from "express"
import * as controller from "./inventory.controller.js"

const router = express.Router()

router.get("/inventory/kardex/:productId", controller.kardex)

router.get("/inventory/kardex",controller.kardexAll)

router.get("/inventory/stock",controller.stock)

export default router