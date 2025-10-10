import bcrypt from "bcryptjs";
import { createUser } from "./user.interface";
import config from "../../../config";
import { prisma } from "../../shared/prisma";
import { Request } from "express";
import { FileUploader } from "../../helper/fileUploder";

const createPatient = async (req: Request) => {
  if (req.file) {
    const uploadResult = FileUploader.uploadToCloudinary(req.file);
  }
  const hashPassword = await bcrypt.hash(
    req.body.password,
    Number(config.bcryptJs_salt)
  );

  const result = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: req.body.email,
        password: hashPassword,
      },
    });
    return await tnx.patient.create({
      data: {
        name: req.body.name,
        email: req.body.email,
      },
    });
  });
  return result;
};

export const UserService = {
  createPatient,
};
