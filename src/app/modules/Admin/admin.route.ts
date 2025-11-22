import { Router } from "express";
import { AdminController } from "./admin.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.get("/", auth(UserRole.ADMIN), AdminController.getAllFromDB);
router.get("/:id", auth(UserRole.ADMIN), AdminController.adminGetById);
router.delete("/:id", auth(UserRole.ADMIN), AdminController.adminDelete);
router.patch("/:id", auth(UserRole.ADMIN), AdminController.adminUpdate);

export const AdminRoute = router;
