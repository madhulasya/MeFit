import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { listWorkouts, createWorkout, getWorkout, updateWorkout, deleteWorkout } from "../controllers/workout.controller.js";

const router = Router();

// List all workouts
router.get("/", authenticate, listWorkouts);

router.post("/", authenticate, authorize("Contributor", "Admin"), createWorkout);
router.get("/:id", authenticate, getWorkout);
router.patch("/:id", authenticate, authorize("Contributor", "Admin"), updateWorkout);
router.delete("/:id", authenticate, authorize("Contributor", "Admin"), deleteWorkout);

export { router as workoutRouter };