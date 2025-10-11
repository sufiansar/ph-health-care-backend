import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();

router.use("/login", AuthController.login);

export const AuthRouters = router;
