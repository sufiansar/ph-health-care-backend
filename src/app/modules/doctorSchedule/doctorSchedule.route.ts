import { Router } from "express";
import { DoctorScheduleContorller } from "./doctorSchedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequestShema from "../../middlewares/validateRequest";
import { DoctorScheduleValidation } from "./doctorSchedule.validation";

const router = Router();

router.post(
  "/create-doctor-schedule",
  validateRequestShema(DoctorScheduleValidation.createDoctorScheduleSchema),
  auth(UserRole.DOCTOR),
  DoctorScheduleContorller.createDoctorSchedule
);

export const DoctorScheduleRoute = router;
