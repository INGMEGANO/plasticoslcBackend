import express from "express";
import * as customerController from "./customer.controller.js";

const router = express.Router();

router.post("/", customerController.create);
router.get("/", customerController.findAll);
router.get("/:id", customerController.findById);
router.put("/:id", customerController.update);
router.delete("/:id", customerController.deleteCustomer);

export default router;
