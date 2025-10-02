import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { listPrograms, createProgram, getProgram, updateProgram, deleteProgram } from "../controllers/program.controller.js";

const router = Router();

// List all programs
router.get("/", authenticate, listPrograms);

router.post("/", authenticate, authorize("Contributor", "Admin"), createProgram);
router.get("/:id", authenticate, getProgram);
router.patch("/:id", authenticate, authorize("Contributor", "Admin"), updateProgram);
router.delete("/:id", authenticate, authorize("Contributor", "Admin"), deleteProgram);

export { router as programRouter };