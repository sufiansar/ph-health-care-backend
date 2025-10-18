import express from "express";
import { UserRoute } from "../modules/user/user.route";
import { AuthRouters } from "../modules/auth/auth.route";
import { ScheduleRoute } from "../modules/schedule/schedule.route";
import { DoctorScheduleRoute } from "../modules/doctorSchedule/doctorSchedule.route";
import { SpecialtiesRoutes } from "../modules/specialties/specialties.route";
import { DoctorRoute } from "../modules/doctor/doctor.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoute,
  },
  {
    path: "/auth",
    route: AuthRouters,
  },
  {
    path: "/schedule",
    route: ScheduleRoute,
  },
  {
    path: "/doctor-schedule",
    route: DoctorScheduleRoute,
  },
  {
    path: "/specialties",
    route: SpecialtiesRoutes,
  },
  {
    path: "/doctor",
    route: DoctorRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
