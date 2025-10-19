import { Router } from "express";
import { DoctorController } from "./doctor.controller";

const router = Router();

router.get("/", DoctorController.getAllFromDB);
router.get("/:id", DoctorController.getDoctorById);

router.post("/ai-suggestion", DoctorController.aiAgentSuggestionDoctor);
router.patch("/:id", DoctorController.doctorUpdate);

router.delete("/:id", DoctorController.deleteDoctor);

export const DoctorRoute = router;
