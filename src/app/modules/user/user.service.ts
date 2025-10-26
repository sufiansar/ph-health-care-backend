import bcrypt from "bcryptjs";
import { createUser } from "./user.interface";
import config from "../../../config";
import { prisma } from "../../shared/prisma";
import { Request } from "express";
import { FileUploader } from "../../helper/fileUploder";
import { Prisma, UserRole, UserStatus } from "@prisma/client";
import { Ioptions, paginationHelper } from "../../helper/paginationHelpers";
import { searchAbleFields } from "./user.constent";

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
        role: UserRole.PATIENT,
        password: hashPassword,
      },
    });
    return await tnx.patient.create({
      data: req.body.patient,
    });
  });
  return result;
};

const createAdmin = async (req: Request) => {
  if (req.file) {
    const uploadResult = await FileUploader.uploadToCloudinary(req.file);
    req.body.admin.profilePhoto = uploadResult?.secure_url;
  }
  const hashPassword = await bcrypt.hash(
    req.body.password,
    Number(config.bcryptJs_salt)
  );

  const admin = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: req.body.admin.email,
        role: UserRole.ADMIN,
        password: hashPassword,
      },
    });
    return await tnx.admin.create({
      data: req.body.admin,
    });
  });
  return admin;
};

const createDoctor = async (req: Request) => {
  if (req.file) {
    const uploadResult = await FileUploader.uploadToCloudinary(req.file);
    req.body.doctor.profilePhoto = uploadResult?.secure_url;
  }
  console.log(req);
  console.log(req.file);
  const hashPassword = await bcrypt.hash(
    req.body.password,
    Number(config.bcryptJs_salt)
  );
  const doctor = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: req.body.doctor.email,
        role: UserRole.DOCTOR,
        password: hashPassword,
      },
    });

    return await tnx.doctor.create({
      data: req.body.doctor,
    });
  });
  return doctor;
};

const getAllUser = async (params: any, options: Ioptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterValues } = params;
  const andConditions: Prisma.UserWhereInput[] = [];
  if (searchTerm) {
    andConditions.push({
      OR: searchAbleFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterValues).length > 0) {
    andConditions.push({
      AND: Object.keys(filterValues).map((key) => ({
        [key]: {
          equals: filterValues[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const result = await prisma.user.findMany({
    skip,
    take: limit,
    where: {
      AND: whereConditions,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getMe = async (user: any) => {
  const result = await prisma.user.findUnique({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      needPasswordChange: true,
    },
  });
  let profileData;
  if (result?.role === UserRole.ADMIN) {
    profileData = await prisma.admin.findUnique({
      where: { email: result.email },
    });
  } else if (result?.role === UserRole.DOCTOR) {
    profileData = await prisma.doctor.findUnique({
      where: { email: result.email },
    });
  } else if (result?.role === UserRole.PATIENT) {
    profileData = await prisma.patient.findUnique({
      where: { email: result.email },
    });
  }
  return {
    ...result,
    profile: profileData,
  };
};

const changeStatus = async (id: string, payload: { status: UserStatus }) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
  });
  const result = await prisma.user.update({
    where: { id },
    data: payload,
  });
  return result;
};
export const UserService = {
  createPatient,
  createAdmin,
  createDoctor,
  getAllUser,
  getMe,
  changeStatus,
};
