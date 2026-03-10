import express from "express"
import * as controller from "./payment.controller.js"

const router = express.Router()

router.post("/payments", controller.createPayment)

export default router