import { Patient, Prisma } from "@prisma/client";
import { Ioptions, paginationHelper } from "../../helper/paginationHelpers";
import { prisma } from "../../shared/prisma";
import { patientSearchAbleFields } from "./patient.constant";
import { IPatientFilterRequest } from "./patient.interface";

const getAllFromDB = async (
  filters: IPatientFilterRequest,
  options: Ioptions,
  includeHealthData: boolean = false
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

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

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => {
        return {
          [key]: {
            equals: (filterData as any)[key],
          },
        };
      }),
    });
  }

  andConditions.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.PatientWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Conditional include based on parameter
  const includeClause = includeHealthData
    ? {
        medicalReport: true,
        patientHealthData: true,
      }
    : {
        medicalReport: {
          select: {
            id: true,
            reportName: true,
            createdAt: true,
          },
        },
      };

  const result = await prisma.patient.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: "desc",
          },
    include: includeClause,
  });

  const total = await prisma.patient.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
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
        patientHealthData: true,
        medicalReport: true,
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
