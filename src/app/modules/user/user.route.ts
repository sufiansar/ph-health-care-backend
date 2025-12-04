import { NextFunction, Request, Response, Router } from "express";
import { UserController } from "./user.controller";
import { FileUploader } from "../../helper/fileUploder";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { userValidation } from "./user.validation";

const router = Router();

router.get("/", auth(UserRole.ADMIN), UserController.getAllUser);
router.get("/me", auth(...Object.values(UserRole)), UserController.getMe);

router.post(
  "/patient-create",
  FileUploader.upload.single("file"),

  (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidation.createPatientSchema.parse(
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
    req.body = userValidation.createAdminSchema.parse(
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
    req.body = userValidation.createDoctorSchema.parse(
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
router.patch(
  "/update-my-profile",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  FileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    return UserController.updateMyProfie(req, res, next);
  }
);

export const UserRoute = router;
