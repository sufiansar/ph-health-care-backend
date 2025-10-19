import { Admin, Prisma } from "@prisma/client";
import { Ioptions, paginationHelper } from "../../helper/paginationHelpers";
import { adminSearchAbleFields } from "./admin.constant";
import { prisma } from "../../shared/prisma";

const getAllFromDB = async (filters: any, options: Ioptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, ...filterValues } = filters;
  const andConditions: Prisma.AdminWhereInput[] = [];
  if (searchTerm) {
    andConditions.push({
      OR: adminSearchAbleFields.map((field) => ({
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

  const whereConditions: Prisma.AdminWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const result = await prisma.admin.findMany({
    skip,
    take: limit,
    where: {
      AND: whereConditions,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.admin.count({
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

const getAdminById = async (id: string) => {
  const admin = await prisma.admin.findUniqueOrThrow({
    where: {
      id,
    },
  });
  return admin;
};

const adminUpdate = async (id: string, payload: Partial<Admin>) => {
  const existingAdmin = await prisma.admin.findUniqueOrThrow({
    where: {
      id,
    },
  });
  const updateAdmin = await prisma.admin.update({
    where: {
      id: existingAdmin?.id,
    },
    data: payload,
  });
  return updateAdmin;
};

const adminDelete = async (id: string) => {
  const existingAdmin = await prisma.admin.findUniqueOrThrow({
    where: {
      id,
    },
  });
  const deleteAdmin = await prisma.admin.delete({
    where: {
      id: existingAdmin?.id,
    },
  });
  return deleteAdmin;
};

export const AdminService = {
  getAllFromDB,
  adminUpdate,
  adminDelete,
  getAdminById,
};
