import { Router } from "express";
import { SchedulesController } from "./schedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.get(
  "/get-schedules",
  auth(UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  SchedulesController.getAllFromDB
);

router.get(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  SchedulesController.getByIdFromDB
);
router.get("/", auth(UserRole.DOCTOR), SchedulesController.scheduleForDoctor);

router.post(
  "/create-schedule",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  SchedulesController.createSchedule
);
router.delete(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  SchedulesController.scheduleDelete
);

export const ScheduleRoute = router;
