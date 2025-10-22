import { Router } from "express";
import { AppointmentController } from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.get(
  "/my-appointments",
  auth(UserRole.PATIENT, UserRole.DOCTOR),
  AppointmentController.getMyAppointments
);

router.get("/", auth(UserRole.ADMIN), AppointmentController.getAllAppointments);
router.post(
  "/",
  auth(UserRole.PATIENT),
  AppointmentController.appointmentCreate
);
router.patch(
  "/:id",
  auth(UserRole.DOCTOR),
  AppointmentController.updateAppointment
);

export const AppointmentRoutes = router;
