import express from "express";
import {
  getUserController,
  updateUserController,
  softDeleteUserController,
  restoreUserController,
  getActiveUsersController,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/users", getUserController);
router.put("/users/:userId", updateUserController);
router.delete("/users/:userId", softDeleteUserController);
router.put("/users/:userId/restore", restoreUserController);
router.get("/users/active", getActiveUsersController);

export default router;
