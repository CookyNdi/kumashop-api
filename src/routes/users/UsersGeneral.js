import express from "express";
import { getAllUsers, getUserById } from "../../controllers/user/UsersGeneral.js";

const router = express.Router();

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);

/**
 * @swagger
 * /users:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     tags: [Users General]
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
 *     tags: [Users General]
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

export default router;
