import express from "express";
import * as supplierController from "./supplier.controller.js";

const router = express.Router();

router.post("/", supplierController.create);
router.get("/", supplierController.findAll);
router.get("/:id", supplierController.findById);
router.put("/:id", supplierController.update);
router.delete("/:id", supplierController.deleteSupplier);

export default router;
