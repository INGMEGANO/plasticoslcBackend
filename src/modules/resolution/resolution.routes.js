import express from "express";
import * as resolutionController from "./resolution.controller.js";

const router = express.Router();

router.post("/", resolutionController.create);
router.get("/", resolutionController.findAll);
router.get("/:id", resolutionController.findById);
router.put("/:id", resolutionController.update);
router.delete("/:id", resolutionController.remove);

export default router;
