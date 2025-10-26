import { NextFunction, Request, Response, Router } from "express";
import { UserController } from "./user.controller";
import { FileUploader } from "../../helper/fileUploder";
import { UserValidation } from "./user.validation";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.get("/", auth(UserRole.ADMIN), UserController.getAllUser);
router.get("/me", auth(...Object.values(UserRole)), UserController.getMe);

router.post(
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

router.post(
  "/admin-create",
  FileUploader.upload.single("file"),

  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.createAdminSchema.parse(
      JSON.parse(req.body.data)
    );

    return UserController.createAdmin(req, res, next);
  },
  UserController.createAdmin
);

router.post(
  "/doctor-create",
  FileUploader.upload.single("file"),

  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.createDoctorSchema.parse(
      JSON.parse(req.body.data)
    );

    return UserController.createDoctor(req, res, next);
  },
  UserController.createDoctor
);

router.patch(
  "/:id/status",
  auth(UserRole.ADMIN),

  UserController.changeStatus
);

export const UserRoute = router;
