import { Router } from "express";
import { AuthController } from "./auth.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.get(
  "/my-profile",
  auth(...Object.values(UserRole)),
  AuthController.getMyProfile
);
router.post("/login", AuthController.login);
router.post("/refresh-token", AuthController.newAccessToken);
router.post("/logout", AuthController.logout);
router.post(
  "/reset-password",
  auth(...Object.values(UserRole)),
  AuthController.resetPassword
);
router.post("/forgot-password", AuthController.forgotPassword);

export const AuthRouters = router;
