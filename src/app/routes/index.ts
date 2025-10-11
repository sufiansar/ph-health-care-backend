import express from "express";
import { UserRoute } from "../modules/user/user.route";
import { AuthRouters } from "../modules/auth/auth.route";

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
