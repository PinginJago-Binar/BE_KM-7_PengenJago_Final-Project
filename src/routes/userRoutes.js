import express from "express";
import {
  getUserController,
  updateUserController,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/users", getUserController);
router.put("/users/:userId", updateUserController);

export default router;
