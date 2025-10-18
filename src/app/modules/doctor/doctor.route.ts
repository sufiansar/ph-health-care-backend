import { Router } from "express";
import { DoctorController } from "./doctor.controller";

const router = Router();

router.get("/", DoctorController.getAllFromDB);

router.patch("/:id", DoctorController.doctorUpdate);

export const DoctorRoute = router;
