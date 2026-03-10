import express from "express"
import * as controller from "./accountsReceivable.controller.js"

const router = express.Router()

router.get("/accounts-receivable", controller.getAccountsReceivable)

router.get("/accounts-receivable/overdue", controller.getOverdueInvoices)

router.get(
  "/reports/accounts-receivable-by-customer",
  controller.accountsReceivableByCustomer
)

export default router