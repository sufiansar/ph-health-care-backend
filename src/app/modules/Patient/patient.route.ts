import { Router } from "express";
import { PatientController } from "./patient.controller";

const router = Router();

router.get("/", PatientController.getAllFromDB);
router.get("/:id", PatientController.getPatientById);
router.patch("/:id", PatientController.updatePatient);
router.delete("/:id", PatientController.deletePatient);

export const PatientRoute = router;
