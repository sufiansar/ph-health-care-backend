import { NextFunction, Request, Response, Router } from "express";
import { UserController } from "./user.controller";
import { FileUploader } from "../../helper/fileUploder";
import { UserValidation } from "./user.validation";

const router = Router();

router.use(
  "/patient-create",
  FileUploader.upload.single("file"),

  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.createPatientSchema.parse(
      JSON.parse(req.body.data)
    );
    return UserController.createPatient(req, res, next);
  },
  UserController.createPatient
);

export const UserRoute = router;
