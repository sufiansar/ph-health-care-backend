import { Request } from "express";

import { prisma } from "../../shared/prisma";
import { Specialties } from "@prisma/client";
import { FileUploader } from "../../helper/fileUploder";
import { Ioptions, paginationHelper } from "../../helper/paginationHelpers";

const inserIntoDB = async (req: Request) => {
  const file = req.file;

  if (file) {
    const uploadToCloudinary = await FileUploader.uploadToCloudinary(file);
    req.body.icon = uploadToCloudinary?.secure_url;
  }

  const result = await prisma.specialties.create({
    data: req.body,
  });

  return result;
};

const getAllFromDB = async (options: Ioptions) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);

  const result = await prisma.specialties.findMany({
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? ({ [options.sortBy]: options.sortOrder } as any)
        : ({ createdAt: "desc" } as any),
  });

  const total = await prisma.specialties.count();

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const deleteFromDB = async (id: string): Promise<Specialties> => {
  const result = await prisma.specialties.delete({
    where: {
      id,
    },
  });
  return result;
};

export const SpecialtiesService = {
  inserIntoDB,
  getAllFromDB,
  deleteFromDB,
};
