import { Router } from "express";
import { body } from "express-validator";
import {
  getAllUsersController,
  createUserController,
  loginUserController,
  profileController,
  logoutController,
} from "../controllers/user.controller.js";
import { authUser } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/register",
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isLength({ min: 3 }).withMessage("Password too short"),
  createUserController
);

router.post(
  "/login",
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isLength({ min: 3 }).withMessage("Password too short"),
  loginUserController
);

router.get("/profile", authUser, profileController);
router.post("/logout", authUser, logoutController);
router.get("/all", authUser, getAllUsersController);

export default router;
