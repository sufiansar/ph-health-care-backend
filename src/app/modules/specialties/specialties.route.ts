import express, { NextFunction, Request, Response } from "express";
import { SpecialtiesController } from "./specialties.controller";

import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { FileUploader } from "../../helper/fileUploder";
import { SpecialtiesValidtaion } from "./Specialties.validation";

const router = express.Router();

router.get("/", SpecialtiesController.getAllFromDB);
router.post(
  "/",
  FileUploader.upload.single("file"),
  auth(UserRole.ADMIN),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = SpecialtiesValidtaion.create.parse(JSON.parse(req.body.data));
    return SpecialtiesController.inserIntoDB(req, res, next);
  }
);

router.delete("/:id", auth(UserRole.ADMIN), SpecialtiesController.deleteFromDB);

export const SpecialtiesRoutes = router;
