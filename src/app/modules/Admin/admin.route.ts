import { Router } from "express";
import { AdminController } from "./admin.controller";

const router = Router();

router.get("/", AdminController.getAllFromDB);
router.get("/:id", AdminController.adminGetById);
router.delete("/:id", AdminController.adminDelete);
router.patch("/:id", AdminController.adminUpdate);

export const AdminRoute = router;
