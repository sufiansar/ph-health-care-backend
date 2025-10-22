import {
  AppointmentStatus,
  PaymentStatus,
  Prescription,
  Prisma,
  UserRole,
} from "@prisma/client";
import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { Ioptions, paginationHelper } from "../../helper/paginationHelpers";

const createPrescription = async (
  user: any,
  prescriptionData: Partial<Prescription>
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: prescriptionData.appointmentId,
      status: AppointmentStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
    },
    include: {
      doctor: true,
    },
  });
  console.log("Logged-in doctor email:", user.email);
  console.log("Appointment doctor email:", appointmentData?.doctor.email);

  if (user.role !== UserRole.DOCTOR) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Only doctors can create prescriptions"
    );
  }

  if (appointmentData.doctor.email !== user.email) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this appointment"
    );
  }

  if (!appointmentData) {
    throw new Error("Appointment not found");
  }

  const prescription = await prisma.prescription.create({
    data: {
      appointmentId: appointmentData.id,
      doctorId: appointmentData.doctorId,
      patientId: appointmentData.patientId,
      instructions: prescriptionData.instructions as string,
      followUpDate: (prescriptionData.followUpDate as Date) || null,
    },
    include: {
      patient: true,
    },
  });

  return prescription;
};

const getMyPrescriptionPatient = async (
  user: any,
  filters: any,
  options: Ioptions
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { ...filterData } = filters;

  const andConditions: Prisma.PrescriptionWhereInput[] = [];

  if (user.role !== UserRole.PATIENT) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Only patients can access their prescriptions"
    );
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.PrescriptionWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const prescriptions = await prisma.prescription.findMany({
    skip,
    take: limit,
    where: {
      AND: whereConditions,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      doctor: true,
    },
  });
  const total = await prisma.prescription.count({
    where: {
      AND: whereConditions,
    },
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: prescriptions,
  };
};

export const PrescriptionService = {
  createPrescription,
  getMyPrescriptionPatient,
};
