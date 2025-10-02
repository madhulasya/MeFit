import { Router } from "express";
import { body } from "express-validator";
import { registerUser, loginUser, getProfile, getSelf, getUserById, updateUser, updatePassword, deleteUser, updateSelf } from "../controllers/user.controller.js";
import { startTotpSetup, verifyTotp, verifyTotpLogin } from "../controllers/totp.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const userRouter = Router();

// Helper to attach login rate limiter stored on app
const attachLoginLimiter = (req, res, next) => {
  const limiter = req.app.get('loginLimiter');
  return limiter ? limiter(req, res, next) : next();
};

/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */
userRouter.post(
  "/",
  body("name").isString().isLength({ min: 2 }).trim(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  registerUser
);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many login attempts
 */
userRouter.post("/login", attachLoginLimiter, loginUser);

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
userRouter.get("/", authenticate, getSelf);

/**
 * Frontend expects PUT /api/user/self to update own profile
 */
userRouter.put("/self", authenticate, updateSelf);

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
 *         description: User retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
userRouter.get("/:id", authenticate, getUserById);

/**
 * @swagger
 * /api/user/{id}:
 *   patch:
 *     summary: Update user
 *     tags: [Users]
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
userRouter.patch("/:id", authenticate, updateUser);

/**
 * @swagger
 * /api/user/{id}/update_password:
 *   post:
 *     summary: Update user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Unauthorized or incorrect current password
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
userRouter.post(
  "/:id/update_password",
  authenticate,
  body("newPassword").isLength({ min: 6 }),
  updatePassword
);

/**
 * @swagger
 * /api/user/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
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
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
userRouter.delete("/:id", authenticate, deleteUser);

/**
 * @swagger
 * /api/user/2fa/setup:
 *   post:
 *     summary: Setup two-factor authentication
 *     tags: [Users, 2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA setup initiated
 *       401:
 *         description: Unauthorized
 */
userRouter.post("/2fa/setup", authenticate, startTotpSetup);

/**
 * @swagger
 * /api/user/2fa/verify:
 *   post:
 *     summary: Verify and enable two-factor authentication
 *     tags: [Users, 2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 *       401:
 *         description: Unauthorized or invalid token
 */
userRouter.post("/2fa/verify", authenticate, verifyTotp);

/**
 * @swagger
 * /api/user/2fa/verify-login:
 *   post:
 *     summary: Verify 2FA during login
 *     tags: [Users, 2FA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - token
 *             properties:
 *               userId:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA verification successful
 *       401:
 *         description: Invalid token
 */
userRouter.post("/2fa/verify-login", verifyTotpLogin);

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Get detailed user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
userRouter.get("/me", authenticate, getProfile);

export { userRouter }