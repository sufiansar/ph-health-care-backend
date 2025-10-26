import { Patient, Prisma } from "@prisma/client";
import { Ioptions, paginationHelper } from "../../helper/paginationHelpers";
import { prisma } from "../../shared/prisma";
import { patientSearchAbleFields } from "./patient.constant";

const getAllFromDB = async (filters: any, options: Ioptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, ...filterValues } = filters;
  const andConditions: Prisma.PatientWhereInput[] = [];
  if (searchTerm) {
    andConditions.push({
      OR: patientSearchAbleFields.map((field) => ({
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

  const whereConditions: Prisma.PatientWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const result = await prisma.patient.findMany({
    skip,
    take: limit,
    where: {
      AND: whereConditions,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.patient.count({
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

const getPatientById = async (id: string) => {
  const existingPatient = await prisma.patient.findUniqueOrThrow({
    where: { id },
  });

  return existingPatient;
};
const updatePatient = async (payload: any, user: any) => {
  const { medicalReport, patientHealthData, ...patientData } = payload;
  const existingPatient = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
      isDeleted: false,
    },
  });

  return await prisma.$transaction(async (tnx) => {
    await tnx.patient.update({
      where: {
        id: existingPatient.id,
      },
      data: {
        ...patientData,
      },
    });

    if (patientHealthData) {
      await tnx.patientHealthData.upsert({
        where: {
          patientId: existingPatient.id,
        },
        update: patientHealthData,

        create: {
          ...patientHealthData,
          patientId: existingPatient.id,
        },
      });
    }

    if (medicalReport) {
      await tnx.medicalReport.create({
        data: {
          ...medicalReport,
          patientId: existingPatient.id,
        },
      });
    }

    const result = await tnx.patient.findUnique({
      where: {
        id: existingPatient.id,
      },
      include: {
        PatientHealthData: true,
        MedicalReport: true,
      },
    });
    return result;
  });
};

const deletePatient = async (id: string) => {
  const existingPatient = await prisma.patient.findUniqueOrThrow({
    where: { id },
  });
  const deletePatientData = await prisma.patient.delete({
    where: {
      id: existingPatient.id,
    },
  });
  return deletePatientData;
};
export const PatientService = {
  getAllFromDB,
  updatePatient,
  deletePatient,
  getPatientById,
};
