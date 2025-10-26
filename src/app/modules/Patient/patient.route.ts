import { Router } from "express";
import { PatientController } from "./patient.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.get("/", PatientController.getAllFromDB);
router.get("/:id", PatientController.getPatientById);
router.patch("/", auth(UserRole.PATIENT), PatientController.updatePatient);
router.delete("/:id", PatientController.deletePatient);

export const PatientRoute = router;
