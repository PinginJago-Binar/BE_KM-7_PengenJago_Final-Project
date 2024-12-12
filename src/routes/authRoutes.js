import express from "express";
import {
  registerController,
  verifyOtpController,
  resetOtpController,
  login,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/authController.js";

import {
  validate,
  registerSchema,
  loginSchema,
  otpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../middlewares/validations/userValidation.js";

// import {
//   authenticate,
//   generateToken,
//   changePassword,
// } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerController);
router.post("/verify-otp", validate(otpSchema), verifyOtpController);
router.post("/reset-otp", resetOtpController);
router.post("/login", validate(loginSchema), login);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPasswordController
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPasswordController
);

export default router;
