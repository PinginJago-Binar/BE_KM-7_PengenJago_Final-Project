import path from "path";
import crypto from "crypto";
import ejs from "ejs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

import Email from "../config/mail/nodemailer.js";
import convertToJson from "../utils/convertToJson.js";
// import { generateToken } from "../middlewares/auth.js";

const prisma = new PrismaClient();

// done
const registerService = async (data) => {
  const { name, email, password, numberPhone } = data;

  // Cek apakah email sudah digunakan
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Email is already in use.");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Buat user baru
  const user = await prisma.user.create({
    data: {
      name,
      email,
      numberPhone,
      password: hashedPassword,
    },
  });

  // Generate OTP dan waktu kadaluarsa
  const otp = crypto.randomInt(100000, 999999).toString(); // 6 digit OTP
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 menit kadaluarsa

  // Simpan OTP dan waktu kadaluarsa ke user
  await prisma.user.update({
    where: { id: user.id },
    data: { otp, otpExpiry },
  });

  // Kirim email registrasi dengan template HTML
  const htmlContent = await ejs.renderFile(
    path.join(process.cwd(), "./src/views/emails/otp.ejs"),
    { otp }
  );
  await Email(email, "Your OTP Code", htmlContent);

  return { user };
};

// done
const loginService = async (email, password) => {
  // Cari user berdasarkan email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const userJson = convertToJson(user);

  // Validasi password
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new Error("Invalid email or password");
  }

  // Generate JWT token
  const token = jwt.sign({ id: userJson.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // Konversi user ke JSON format
  return {
    user: convertToJson(user),
    token,
  };
};

// done
const forgotPasswordService = async (email) => {
  // Cari user berdasarkan email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("User not found");
  }

  const userJson = convertToJson(user);

  // Generate reset token
  const resetToken = jwt.sign(
    { id: userJson.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN } // Token berlaku sesuai env
  );

  // Buat reset link
  const resetLink = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;

  // Path ke template email
  const templatePath = path.join(
    process.cwd(),
    "./src/views/emails/forgot-password-email.ejs"
  );

  // Render file EJS dengan data RESET_LINK
  const htmlContent = await ejs.renderFile(templatePath, { resetLink });

  // Kirim email
  await Email(email, "Reset Password", htmlContent);

  return {
    message: "Reset password email sent",
  };
};

// done
const resetPasswordService = async (token, newPassword, confirmPassword) => {
  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id;

  if (!userId) {
    throw new Error("Invalid token payload");
  }

  // Hash password baru
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password di database
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: "Password updated successfully" };
};

const logoutService = async (token) => {
  await blacklistToken(token);
};

export {
  registerService,
  loginService,
  forgotPasswordService,
  resetPasswordService,
  logoutService,
};
