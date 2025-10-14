import { Router } from "express";
import { DoctorScheduleContorller } from "./doctorSchedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
  "/create-doctor-schedule",
  auth(UserRole.DOCTOR),
  DoctorScheduleContorller.createDoctorSchedule
);

export const DoctorScheduleRoute = router;
