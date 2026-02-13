import { Router } from "express"
import {
  getSalesSummary,
  getSalesList,
  exportSalesPDF,
  exportSalesExcel,
  exportSalesZIP
} from "./sales.controller.js"

const router = Router()

router.get("/summary", getSalesSummary)
router.get("/list", getSalesList)
router.get("/export/pdf", exportSalesPDF)
router.get("/export/excel", exportSalesExcel)
router.get("/export/zip", exportSalesZIP)

export default router
