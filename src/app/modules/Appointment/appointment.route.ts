import { Router } from "express";
import { AppointmentController } from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequestShema from "../../middlewares/validateRequest";
import { AppointmentValidation } from "./appionment.validation";

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
  validateRequestShema(AppointmentValidation.createAppointment),
  AppointmentController.appointmentCreate
);
router.patch(
  "/:id",
  auth(UserRole.DOCTOR),
  AppointmentController.updateAppointment
);
router.patch(
  "/status/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
  AppointmentController.changeAppointmentStatus
);

router.post(
  "/pay-later",
  auth(UserRole.PATIENT),
  validateRequestShema(AppointmentValidation.createAppointment),
  AppointmentController.createAppointmentWithPayLater
);

router.post(
  "/:id/initiate-payment",
  auth(UserRole.PATIENT),
  AppointmentController.initiatePayment
);

export const AppointmentRoutes = router;
