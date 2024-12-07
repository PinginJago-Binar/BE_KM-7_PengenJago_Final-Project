import path from "path";
import crypto from "crypto";
import ejs from "ejs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

import {
  createUser,
  updateUserOtp,
  findUserByEmail,
  comparePassword,
  generateToken,
  verifyToken,
  updatePassword,
} from "../services/User.js";

import asyncWrapper from "../utils/asyncWrapper.js";
import convertToJson from "../utils/convertToJson.js";
import Email from "../config/mail/nodemailer.js";

const prisma = new PrismaClient();

// done
const registerController = asyncWrapper(async (req, res) => {
  const { name, email, password, numberPhone } = req.body;

  // Cek apakah email sudah digunakan
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("Email is already in use.");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Buat user baru melalui service
  const user = await createUser({
    name,
    email,
    numberPhone,
    password: hashedPassword,
  });

  // Generate OTP dan waktu kadaluarsa
  const otp = crypto.randomInt(100000, 999999).toString(); // 6 digit OTP
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 menit kadaluarsa

  // Update OTP ke user
  await updateUserOtp(user.id, { otp, otpExpiry });

  // Kirim email registrasi dengan template HTML
  const htmlContent = await ejs.renderFile(
    path.join(process.cwd(), "./src/views/emails/otp.ejs"),
    { otp }
  );
  await Email(email, "Your OTP Code", htmlContent);

  res.status(201).json({
    message: "User registered",
    user: convertToJson(user),
  });
});

// done
const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  // Cari user berdasarkan email
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Cek apakah user sudah memverifikasi OTP
  if (!user.verifiedAt) {
    throw new Error("Please verify your account before logging in.");
  }

  // Validasi password
  const validPassword = await comparePassword(password, user.password);
  if (!validPassword) {
    throw new Error("Invalid email or password");
  }

  const userJson = convertToJson(user);

  // Generate JWT token
  const token = generateToken(userJson);

  res.json({
    message: "Login successful",
    user: convertToJson(userJson),
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

  // Cari user berdasarkan email
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }

  const userJson = convertToJson(user);

  // Generate reset token
  const resetToken = generateToken(userJson);

  // Buat reset link
  const resetLink = `${process.env.BASE_URL}/auth/forget-pass?token=${resetToken}`;

  // Path ke template email
  const templatePath = path.join(
    process.cwd(),
    "./src/views/emails/forgot-password-email.ejs"
  );

  // Render file EJS dengan data RESET_LINK
  const htmlContent = await ejs.renderFile(templatePath, { resetLink });

  // Kirim email
  await Email(email, "Reset Password", htmlContent);

  res.status(200).json({
    message: "Reset password email sent",
  });
});

// done
const resetPasswordController = asyncWrapper(async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  // Validasi input
  if (!token || !newPassword || !confirmPassword) {
    return res.status(400).json({
      message: "Token, newPassword, and confirmPassword are required",
    });
  }

  // Validasi password match
  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  // Verifikasi token
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) {
    throw new Error("Invalid token payload");
  }

  // Hash password baru
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password di database
  await updatePassword(decoded.id, hashedPassword);

  res.status(200).json({ message: "Password updated successfully" });
});

export {
  registerController,
  verifyOtpController,
  login,
  forgotPasswordController,
  resetPasswordController,
};
