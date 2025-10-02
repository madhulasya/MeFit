import { Router } from "express";
import { body } from "express-validator";
import { authenticate } from "../middlewares/auth.middleware.js";
import { listMyGoals, createGoal, getGoal, updateGoal, deleteGoal } from "../controllers/goal.controller.js";

const router = Router();

/**
 * @swagger
 * /api/goal:
 *   get:
 *     summary: List goals for the authenticated user
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Goals retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, listMyGoals);

/**
 * @swagger
 * /api/goal:
 *   post:
 *     summary: Create a goal for the authenticated user
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               program:
 *                 type: string
 *                 description: Program ID (Mongo ObjectId)
 *               currentWorkout:
 *                 type: string
 *                 description: Current workout ID (Mongo ObjectId)
 *               targetWorkoutsPerWeek:
 *                 type: integer
 *                 minimum: 0
 *               achieved:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Goal created successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authenticate,
  body("program").optional().isMongoId(),
  body("currentWorkout").optional().isMongoId(),
  body("targetWorkoutsPerWeek").optional().isInt({ min: 0 }),
  body("achieved").optional().isBoolean(),
  createGoal
);

/**
 * @swagger
 * /api/goal/{id}:
 *   get:
 *     summary: Get a goal by ID
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Goal retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Goal not found
 */
router.get("/:id", authenticate, getGoal);

/**
 * @swagger
 * /api/goal/{id}:
 *   patch:
 *     summary: Update a goal
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               program:
 *                 type: string
 *               currentWorkout:
 *                 type: string
 *               targetWorkoutsPerWeek:
 *                 type: integer
 *                 minimum: 0
 *               achieved:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Goal updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Goal not found
 */
router.patch(
  "/:id",
  authenticate,
  body("program").optional().isMongoId(),
  body("currentWorkout").optional().isMongoId(),
  body("targetWorkoutsPerWeek").optional().isInt({ min: 0 }),
  body("achieved").optional().isBoolean(),
  updateGoal
);

/**
 * @swagger
 * /api/goal/{id}:
 *   delete:
 *     summary: Delete a goal
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Goal deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Goal not found
 */
router.delete("/:id", authenticate, deleteGoal);

export { router as goalRouter };