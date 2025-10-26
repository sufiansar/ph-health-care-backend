import { Router } from "express";
import { DoctorScheduleContorller } from "./doctorSchedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequestShema from "../../middlewares/validateRequest";
import { DoctorScheduleValidation } from "./doctorSchedule.validation";

const router = Router();
router.get(
  "/",
  auth(UserRole.ADMIN),
  DoctorScheduleContorller.getAllDoctorSchedules
);
router.get(
  "/my-schedules",
  auth(UserRole.DOCTOR),
  DoctorScheduleContorller.getMyDoctorSchedules
);
router.post(
  "/create-doctor-schedule",
  validateRequestShema(DoctorScheduleValidation.createDoctorScheduleSchema),
  auth(UserRole.DOCTOR),
  DoctorScheduleContorller.createDoctorSchedule
);
router.delete(
  "/:id",
  auth(UserRole.DOCTOR),
  DoctorScheduleContorller.deleteDoctorSchedule
);

export const DoctorScheduleRoute = router;
