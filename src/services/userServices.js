import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

const getUserServices = async () => {
  return await prisma.user.findMany();
};

const updateUserService = async (userId, updateData) => {
  const { name, numberPhone, email } = updateData;

  // Validasi minimal ada satu field yang diupdate
  if (!name && !numberPhone && !email) {
    throw new Error(
      "At least one field (name, numberPhone, or email) is required"
    );
  }

  // Filter data yang akan diupdate agar hanya field yang ada di body
  const dataToUpdate = {};
  if (name) dataToUpdate.name = name;
  if (numberPhone) dataToUpdate.numberPhone = numberPhone;
  if (email) dataToUpdate.email = email;

  // Tambahkan field updatedAt dengan waktu saat ini
  dataToUpdate.updatedAt = new Date();

  // Update user di database
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate,
  });

  return updatedUser;
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

// Fungsi untuk mengembalikan user yang sudah di-soft delete
const restoreUserService = async (userId) => {
  // Cek apakah user ada dan sudah di-soft delete
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.deletedAt) {
    throw new Error("User is not deleted or does not exist");
  }

  // Mengembalikan user dengan menghapus nilai deletedAt
  const restoredUser = await prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: null, // Menghapus deletedAt untuk mengembalikan user
    },
  });

  return restoredUser;
};

// Fungsi untuk mendapatkan semua user yang belum di-soft delete
const getActiveUsers = async () => {
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null, // Mengambil user yang tidak di-soft delete
    },
  });

  return users;
};

export {
  getUserServices,
  updateUserService,
  softDeleteUserService,
  getActiveUsers,
  restoreUserService,
};
