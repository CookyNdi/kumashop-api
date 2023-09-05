import express from "express";
import {
  updateBasicData,
  updateProfileImages,
  updateEmail,
  updatePhoneNumber,
  updatePin,
  updatePassword,
} from "../../controllers/user/UsersManagement.js";

const router = express.Router();

router.patch("/user/basic-data/:id", updateBasicData);
router.patch("/user/profile-image/:id", updateProfileImages);
router.patch("/user/email/:id", updateEmail);
router.patch("/user/phone-number/:id", updatePhoneNumber);
router.patch("/user/password/:id", updatePassword);
router.patch("/user/pin/:id", updatePin);

export default router;
