import express from "express";
import {
  getUserController,
  updateUserController,
  softDeleteUserController,
  restoreUserController,
  getActiveUsersController,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUserController);
router.put("/:userId", updateUserController);
router.delete("/:userId", softDeleteUserController);
router.put("/:userId/restore", restoreUserController);
router.get("/active", getActiveUsersController);

export default router;
