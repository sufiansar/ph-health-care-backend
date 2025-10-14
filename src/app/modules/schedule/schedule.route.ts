import { Router } from "express";
import { SchedulesController } from "./schedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();
router.get("/", auth(UserRole.DOCTOR), SchedulesController.scheduleForDoctor);

router.post("/create-schedule", SchedulesController.createSchedule);
router.delete("/:id", SchedulesController.scheduleDelete);

export const ScheduleRoute = router;
