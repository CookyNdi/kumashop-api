import express from "express";
import { resgisterUser } from "../../controllers/user/UsersAuth.js";

const router = express.Router();

router.post("/users", resgisterUser);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               birth_date:
 *                 type: string
 *               password:
 *                 type: string
 *               confPassword:
 *                 type: string
 *               pin:
 *                 type: integer
 *     responses:
 *       201:
 *         description: User created successfully
 */

export default router;
