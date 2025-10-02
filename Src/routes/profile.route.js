import { Router } from "express";
import { body } from "express-validator";
import { authenticate } from "../middlewares/auth.middleware.js";
import { createProfile, getProfileById, updateProfile, deleteProfile } from "../controllers/profile.controller.js";

const router = Router();

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Create a user profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               weight:
 *                 type: number
 *                 minimum: 0
 *               height:
 *                 type: number
 *                 minimum: 0
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       400:
 *         description: Profile already exists or invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authenticate,
  body("firstName").optional().isString().trim(),
  body("lastName").optional().isString().trim(),
  body("weight").optional().isFloat({ min: 0 }),
  body("height").optional().isFloat({ min: 0 }),
  createProfile
);

/**
 * @swagger
 * /api/profile/{id}:
 *   get:
 *     summary: Get profile by ID
 *     tags: [Profiles]
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
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Profile not found
 */
router.get("/:id", authenticate, getProfileById);

/**
 * @swagger
 * /api/profile/{id}:
 *   patch:
 *     summary: Update profile
 *     tags: [Profiles]
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               weight:
 *                 type: number
 *                 minimum: 0
 *               height:
 *                 type: number
 *                 minimum: 0
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Profile not found
 */
router.patch("/:id", authenticate, updateProfile);

/**
 * @swagger
 * /api/profile/{id}:
 *   delete:
 *     summary: Delete profile
 *     tags: [Profiles]
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
 *         description: Profile deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Profile not found
 */
router.delete("/:id", authenticate, deleteProfile);

export { router as profileRouter };