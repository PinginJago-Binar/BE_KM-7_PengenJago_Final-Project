import {
  getUserServices,
  updateUserService,
} from "../services/userServices.js";
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

  // Panggil service untuk update data
  const updatedUser = await updateUserService(userId, {
    name,
    numberPhone,
    email,
  });

  res.status(200).json({
    message: "User updated successfully",
    user: convertToJson(updatedUser),
  });
});

export { getUserController, updateUserController };
