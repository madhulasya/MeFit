import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { listExercises, getExercise, createExercise, updateExercise, deleteExercise } from "../controllers/exercise.controller.js";

const router = Router();

router.get("/", authenticate, listExercises);
router.get("/:id", authenticate, getExercise);
router.post("/", authenticate, authorize("Contributor", "Admin"), createExercise);
router.patch("/:id", authenticate, authorize("Contributor", "Admin"), updateExercise);
router.delete("/:id", authenticate, authorize("Contributor", "Admin"), deleteExercise);

export { router as exerciseRouter };