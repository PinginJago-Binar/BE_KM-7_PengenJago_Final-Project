import express from "express";
import {
  registerController,
  verifyOtpController,
  login,
  forgotPasswordController,
  resetPasswordController,
  logoutController,
} from "../controllers/authController.js";
import {
  validate,
  registerSchema,
} from "../middlewares/validations/userValidation.js";
// import {
//   authenticate,
//   generateToken,
//   changePassword,
// } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerController);
router.post("/verify-otp", verifyOtpController);
router.post("/login", login);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);
router.post("/logout", logoutController);

export default router;
