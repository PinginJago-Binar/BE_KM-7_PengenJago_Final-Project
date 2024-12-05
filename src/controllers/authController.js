import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

import {
  registerService,
  loginService,
  forgotPasswordService,
  resetPasswordService,
  logoutService,
} from "../services/authServices.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import convertToJson from "../utils/convertToJson.js";

const prisma = new PrismaClient();

// done
const registerController = asyncWrapper(async (req, res) => {
  const user = await registerService(req.body);

  res.status(201).json({
    message: "User registered",
    user: convertToJson(user),
  });
});

// done
const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  // Panggil loginService
  const { user, token } = await loginService(email, password);

  res.json({
    message: "Login successful",
    user,
    token,
  });
});

// done
const verifyOtpController = asyncWrapper(async (req, res) => {
  const { userId, otp } = req.body;

  // Cari user berdasarkan userId
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found.");

  // Validasi OTP
  if (user.otp !== otp) throw new Error("Invalid OTP.");
  if (user.otpExpiry && user.otpExpiry < new Date())
    throw new Error("OTP has expired.");

  // Update status verifikasi dan set verifiedAt setelah berhasil diverifikasi
  await prisma.user.update({
    where: { id: userId },
    data: {
      otp: null,
      otpExpiry: null,
      verifiedAt: new Date(), // Menyimpan waktu saat verifikasi berhasil
    },
  });

  res.status(200).json({ message: "OTP verified successfully." });
});

// done
const forgotPasswordController = asyncWrapper(async (req, res) => {
  const { email } = req.body;

  // Panggil forgotPasswordService untuk proses reset password
  const result = await forgotPasswordService(email);

  // Kirimkan respons ke client
  res.status(200).json({
    result: convertToJson(result),
  });
});

// done
const resetPasswordController = asyncWrapper(async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    return res.status(400).json({
      message: "Token, newPassword, and confirmPassword are required",
    });
  }

  // Panggil service reset password
  const result = await resetPasswordService(
    token,
    newPassword,
    confirmPassword
  );

  res.status(200).json(result);
});

const logoutController = asyncWrapper(async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  await logoutService(token);

  res.status(200).json({ message: "Successfully logged out" });
});

export {
  registerController,
  verifyOtpController,
  login,
  forgotPasswordController,
  resetPasswordController,
  logoutController,
};
