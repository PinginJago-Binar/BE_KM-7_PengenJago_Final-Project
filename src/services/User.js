import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// BAGIAN REGISTER
/**
 * Create a new user in the database.
 * @param {Object} data - User data
 * @returns {Promise<Object>}
 */
const createUser = async (data) => {
  const { name, email, numberPhone, password } = data;
  return prisma.user.create({
    data: { name, email, numberPhone, password },
  });
};

/**
 * Update a user's OTP and expiry in the database.
 * @param {number} userId - User ID
 * @param {Object} otpData - OTP and expiry data
 * @returns {Promise<Object>}
 */
const updateUserOtp = async (userId, otpData) => {
  return prisma.user.update({
    where: { id: userId },
    data: otpData,
  });
};

/**
 * Find a user by email.
 * @param {string} email - User's email
 * @returns {Promise<Object|null>}
 */
const findUserByEmail = async (email) => {
  return prisma.user.findUnique({ where: { email } });
};

/**
 * Compare provided password with the stored hashed password.
 * @param {string} password - Provided password
 * @param {string} hashedPassword - Stored hashed password
 * @returns {Promise<boolean>}
 */
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Generate a JWT token for the user.
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */

const generateToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// done
/**
 * Verify and decode JWT token.
 * @param {string} token - JWT reset token
 * @returns {Object} - Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Update user password in the database.
 * @param {number} userId - User ID
 * @param {string} hashedPassword - Hashed new password
 * @returns {Promise<Object>}
 */
const updatePassword = async (userId, hashedPassword) => {
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};

const getUserServices = async () => {
  return await prisma.user.findMany();
};

/**
 * Update user details in the database.
 * @param {number} userId - ID of the user to update
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} - Updated user data
 */
const updateUserService = async (userId, updateData) => {
  return prisma.user.update({
    where: { id: userId },
    data: { ...updateData, updatedAt: new Date() },
  });
};

// Fungsi untuk soft delete user
const softDeleteUserService = async (userId) => {
  const deletedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: new Date(), // Setel deletedAt ke waktu saat ini
    },
  });

  return deletedUser;
};

const getActiveUsers = async () => {
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null, // Mengambil user yang tidak di-soft delete
    },
  });

  return users;
};

// Fungsi untuk mengembalikan user yang sudah di-soft delete
/**
 * Restore a soft-deleted user.
 * @param {number} userId - ID of the user to restore
 * @returns {Promise<Object>} - Restored user data
 */
const restoreUser = async (userId) => {
  return prisma.user.update({
    where: { id: userId },
    data: { deletedAt: null },
  });
};

/**
 * Check if a user exists and is soft-deleted.
 * @param {number} userId - ID of the user to check
 * @returns {Promise<Object|null>} - User data if found, otherwise null
 */
const findDeletedUser = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
  });
};

/**
 * get specific user by user id
 * @param {number} userId = your user id
 * @returns {Promise<Object>}
 */
const getUserById = (userId) => {
  return prisma.user.findUnique({ where: { id: userId } });
}

export {
  createUser,
  updateUserOtp,
  findUserByEmail,
  comparePassword,
  generateToken,
  verifyToken,
  updatePassword,
  getUserServices,
  updateUserService,
  softDeleteUserService,
  getActiveUsers,
  restoreUser,
  findDeletedUser,
  getUserById
};
