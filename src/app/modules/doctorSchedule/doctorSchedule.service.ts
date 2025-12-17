import { Prisma, UserRole } from "@prisma/client";
import { Ioptions, paginationHelper } from "../../helper/paginationHelpers";
import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const createDoctorSchedule = async (
  user: any,
  payload: {
    scheduleIds: string[];
  }
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctorData.id,
    scheduleId,
  }));

  // Create all doctor schedules
  await prisma.doctorSchedule.createMany({
    data: doctorScheduleData,
  });

  // Fetch the created schedules with populated data
  const createdSchedules = await prisma.doctorSchedule.findMany({
    where: {
      doctorId: doctorData.id,
      scheduleId: {
        in: payload.scheduleIds,
      },
    },
    include: {
      schedule: true,
      doctor: true,
    },
  });

  return createdSchedules;
};

const getAllDoctorSchedules = async (
  user: any,
  filters: any,
  options: Ioptions
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { ...filterData } = filters;

  const andConditions: Prisma.DoctorScheduleWhereInput[] = [];

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.DoctorScheduleWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const appointments = await prisma.doctorSchedule.findMany({
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
      schedule: true,
    },
  });
  const total = await prisma.doctorSchedule.count({
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
    data: appointments,
  };
};

const getMyDoctorSchedules = async (
  user: any,
  filters: any,
  options: Ioptions
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { ...filterData } = filters;

  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const andConditions: Prisma.DoctorScheduleWhereInput[] = [];

  andConditions.push({
    doctorId: {
      equals: doctorInfo.id,
    },
  });

  if (user.role !== UserRole.DOCTOR) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not authorized to access all appointments"
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

  const whereConditions: Prisma.DoctorScheduleWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const doctorSchedules = await prisma.doctorSchedule.findMany({
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
      schedule: true,
    },
  });
  const total = await prisma.doctorSchedule.count({
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
    data: doctorSchedules,
  };
};

const deleteDoctorSchedule = async (doctor: any, scheduleId: string) => {
  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: { email: doctor.email },
  });

  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
  });
  if (!schedule) {
    throw new ApiError(httpStatus.NOT_FOUND, "Schedule not found");
  }

  const ownSchedule = await prisma.doctorSchedule.findFirst({
    where: {
      doctorId: doctorInfo.id,
      scheduleId,
    },
  });

  if (!ownSchedule) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only delete your own schedule"
    );
  }

  await prisma.doctorSchedule.delete({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorInfo.id,
        scheduleId,
      },
    },
  });

  return ownSchedule;
};

const updateDoctorSchedule = async () => {};

export const DoctorScheduleService = {
  createDoctorSchedule,
  updateDoctorSchedule,
  getAllDoctorSchedules,
  getMyDoctorSchedules,
  deleteDoctorSchedule,
};
