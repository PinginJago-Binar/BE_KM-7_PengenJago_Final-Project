import express from "express";
import {
  getUserController,
  updateUserController,
  softDeleteUserController,
  restoreUserController,
  getActiveUsersController,
} from "../controllers/userController.js";
import {
  validate,
  updateUserSchema,
} from "../middlewares/validations/userValidation.js";

const router = express.Router();

router.get("/", getUserController);
router.put("/:userId", validate(updateUserSchema), updateUserController);
router.delete("/:userId", softDeleteUserController);
router.put("/:userId/restore", restoreUserController);
router.get("/active", getActiveUsersController);

export default router;
