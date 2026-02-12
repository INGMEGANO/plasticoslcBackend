import { Router } from "express"
import * as controller from "./company.controller.js"
import { upload } from "../../middlewares/upload.js"

const router = Router()

router.post("/", controller.create)
router.get("/", controller.list)
router.get("/:id", controller.getById)
router.put("/:id", controller.update)
router.delete("/:id", controller.remove)
router.patch("/:id/activate", controller.activate)
router.patch(
  "/:id/logo",
  upload.single("logo"),
  controller.uploadLogo
)

export default router
