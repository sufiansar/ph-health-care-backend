import bcrypt from "bcryptjs";
import { createUser } from "./user.interface";
import config from "../../../config";
import { prisma } from "../../shared/prisma";
import { Request } from "express";
import { FileUploader } from "../../helper/fileUploder";

const createPatient = async (req: Request) => {
  if (req.file) {
    const uploadResult = await FileUploader.uploadToCloudinary(req.file);
    req.body.patient.profilePhoto = uploadResult?.secure_url;
  }
  const hashPassword = await bcrypt.hash(
    req.body.password,
    Number(config.bcryptJs_salt)
  );

  const result = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: req.body.patient.email,
        password: hashPassword,
      },
    });
    return await tnx.patient.create({
      data: req.body.patient,
    });
  });
  return result;
};

export const UserService = {
  createPatient,
};
