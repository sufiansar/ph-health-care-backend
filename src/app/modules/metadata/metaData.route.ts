import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { MetaDataController } from "./metaData.controller";

const router = Router();

router.get(
  "/dashboard",
  auth(...Object.values(UserRole)),
  MetaDataController.fetchMetaDataDashboard
);

export const MetaDataRoutes = router;
