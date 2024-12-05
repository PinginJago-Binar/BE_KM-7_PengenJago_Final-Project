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

  // Update user di database
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate,
  });

  return updatedUser;
};

export { getUserServices, updateUserService };
