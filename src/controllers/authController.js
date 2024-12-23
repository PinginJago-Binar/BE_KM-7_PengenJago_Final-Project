import path from "path";
import crypto from "crypto";
import ejs from "ejs";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

import {
  createUser,
  updateUserOtp,
  findUserById,
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
    return res.status(409).json({ message: "Email is already in use." });
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

  // Remove sensitive fields
  const { otp: _, otpExpiry: __, ...userWithoutOtp } = convertToJson(user);

  res.status(201).json({
    message: "User registered",
    user: userWithoutOtp,
  });
});

// done
const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  // Cari user berdasarkan email
  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: "Invalid email." });
  }

  // Cek apakah user sudah memverifikasi OTP
  if (!user.verifiedAt) {
    return res
      .status(403)
      .json({ message: "Please verify your account before logging in." });
  }

  // Validasi password
  const validPassword = await comparePassword(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: "Invalid password." });
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
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Validasi OTP
  if (user.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP." });
  }
  if (user.otpExpiry && user.otpExpiry < new Date()) {
    return res.status(400).json({ message: "OTP has expired." });
  }

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

const resetOtpController = asyncWrapper(async (req, res) => {
  const { userId } = req.body;

  // Validasi input
  if (!userId) {
    return res.status(400).json({
      message: "User ID is required",
    });
  }

  // Cari user berdasarkan ID
  const user = await findUserById(userId);
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  // Generate OTP dan waktu kadaluarsa
  const otp = crypto.randomInt(100000, 999999).toString(); // 6 digit OTP
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 menit kadaluarsa

  // Simpan OTP baru dan waktu kadaluwarsa
  await updateUserOtp(user.id, { otp, otpExpiry });

  // Kirim email registrasi dengan template HTML
  const htmlContent = await ejs.renderFile(
    path.join(process.cwd(), "./src/views/emails/otp.ejs"),
    { otp }
  );
  await Email(user.email, "Your OTP Code", htmlContent);

  res.status(200).json({
    message: "OTP has been reset and sent to your email",
  });
});

// done
const forgotPasswordController = asyncWrapper(async (req, res) => {
  const { email } = req.body;

  // Cari user berdasarkan email
  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const userJson = convertToJson(user);

  // Generate reset token
  const resetToken = generateToken(userJson);

  // Buat reset link
  const resetLink = `${process.env.FE_URL}/auth/forget-pass?token=${resetToken}`;

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
    throw new Error("Token, newPassword, and confirmPassword are required");
  }

  // Validasi password match
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
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
  resetOtpController,
  login,
  forgotPasswordController,
  resetPasswordController,
};
