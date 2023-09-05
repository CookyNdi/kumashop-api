import express from "express";
import { updateUser, updateProfileImages } from "../../controllers/user/UsersManagement.js";

const router = express.Router();

router.patch("/user/profile-image/:id", updateProfileImages);

export default router;
