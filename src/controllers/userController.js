import {
  getUserServices,
  updateUserService,
  softDeleteUserService,
  getActiveUsers,
  restoreUser,
  findDeletedUser,
} from "../services/User.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import convertToJson from "../utils/convertToJson.js";

// done
const getUserController = asyncWrapper(async (req, res) => {
  const users = await getUserServices();

  if (!users.length) {
    return res.status(404).json({ message: "No users found." });
  }

  res.status(200).json({
    user: convertToJson(users),
  });
});

// done
const updateUserController = asyncWrapper(async (req, res) => {
  const { userId } = req.params;
  const { name, numberPhone, email } = req.body;

  // Validasi minimal ada satu field yang diupdate
  if (!name && !numberPhone && !email) {
    return res.status(400).json({
      message: "At least one field (name, numberPhone, or email) is required",
    });
  }

  // Filter data yang akan diupdate agar hanya field yang ada di body
  const dataToUpdate = {};
  if (name) dataToUpdate.name = name;
  if (numberPhone) dataToUpdate.numberPhone = numberPhone;
  if (email) dataToUpdate.email = email;

  // Panggil service untuk update data
  const updatedUser = await updateUserService(userId, dataToUpdate);

  res.status(200).json({
    message: "User updated successfully",
    user: convertToJson(updatedUser),
  });
});

// done
const softDeleteUserController = asyncWrapper(async (req, res) => {
  const { userId } = req.params;

  // Panggil service untuk soft delete user
  const deletedUser = await softDeleteUserService(userId);

  res.status(200).json({
    message: "User deleted successfully (soft delete)",
    user: convertToJson(deletedUser),
  });
});

// done
const getActiveUsersController = asyncWrapper(async (req, res) => {
  const users = await getActiveUsers();

  res.status(200).json({
    message: "Active users retrieved successfully",
    users: convertToJson(users),
  });
});

// done
const restoreUserController = asyncWrapper(async (req, res) => {
  const { userId } = req.params;

  // Cek apakah user ada dan di-soft delete
  const user = await findDeletedUser(userId);
  if (!user || !user.deletedAt) {
    return res.status(400).json({
      message: "User is not deleted or does not exist",
    });
  }

  // Panggil service untuk mengembalikan user
  const restoredUser = await restoreUser(userId);

  res.status(200).json({
    message: "User restored successfully",
    user: convertToJson(restoredUser),
  });
});

export {
  getUserController,
  updateUserController,
  softDeleteUserController,
  getActiveUsersController,
  restoreUserController,
};
