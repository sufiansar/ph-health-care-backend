import { Router } from "express";
import { AuthController } from "./auth.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
// import { authLimiter } from "../../middlewares/rateLimiter";

const router = Router();

router.get(
  "/my-profile",
  auth(...Object.values(UserRole)),
  AuthController.getMyProfile
);

router.post("/login", /* authLimiter, */ AuthController.login);
router.post(
  "/change-password",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  AuthController.changePassword
);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/logout", AuthController.logout);
router.post(
  "/reset-password",
  auth(...Object.values(UserRole)),
  AuthController.resetPassword
);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-ad-password", AuthController.resetADPassword);

export const AuthRouters = router;
