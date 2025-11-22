import { Router } from "express";
import { DoctorController } from "./doctor.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.get("/", DoctorController.getAllFromDB);
router.get("/:id", DoctorController.getDoctorById);

router.post("/ai-suggestion", DoctorController.aiAgentSuggestionDoctor);
router.patch(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
  DoctorController.doctorUpdate
);

router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  DoctorController.deleteDoctor
);
router.delete(
  "/soft/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  DoctorController.softDelete
);

export const DoctorRoute = router;
