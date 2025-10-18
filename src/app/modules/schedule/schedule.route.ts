import { Router } from "express";
import { SchedulesController } from "./schedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();
router.get("/", auth(UserRole.DOCTOR), SchedulesController.scheduleForDoctor);

router.post(
  "/create-schedule",
  auth(UserRole.ADMIN),
  SchedulesController.createSchedule
);
router.delete("/:id", auth(UserRole.ADMIN), SchedulesController.scheduleDelete);

export const ScheduleRoute = router;
