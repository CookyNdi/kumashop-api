import express from "express";
import { getAllUsers, getUserById, resgisterUser } from "../../controllers/user/UsersManagement.js";

const router = express.Router();

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.post("/users", resgisterUser);

/**
 * @swagger
 * /users:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     tags: [Users Management]
 *     responses:
 *       200:
 *         description: Users fetched
 *       500:
 *         description: failed to fetch Users
 */
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Dapatkan informasi pengguna berdasarkan ID
 *     tags: [Users Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID pengguna yang akan ditemukan
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data pengguna berhasil ditemukan
 *       404:
 *         description: Pengguna dengan ID yang diberikan tidak ditemukan
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users Management]
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
