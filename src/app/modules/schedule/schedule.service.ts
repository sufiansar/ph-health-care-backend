import { addHours, addMinutes, format } from "date-fns";
import { prisma } from "../../shared/prisma";
import { Ioptions, paginationHelper } from "../../helper/paginationHelpers";
import { Prisma, Schedule } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import { IFilterRequest, ISchedule } from "./schedule.interface";

const convertDateTime = async (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + offset);
};

const createSchedule = async (payload: ISchedule): Promise<Schedule[]> => {
  const { startDate, endDate, startTime, endTime } = payload;

  const intervalTime = 30;

  const schedules = [];

  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    const startDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(startTime.split(":")[0])
        ),
        Number(startTime.split(":")[1])
      )
    );

    const endDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(endTime.split(":")[0])
        ),
        Number(endTime.split(":")[1])
      )
    );

    while (startDateTime < endDateTime) {
      const s = await convertDateTime(startDateTime);
      const e = await convertDateTime(addMinutes(startDateTime, intervalTime));

      const scheduleData = {
        startDateTime: s,
        endDateTime: e,
      };

      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          startDateTime: scheduleData.startDateTime,
          endDateTime: scheduleData.endDateTime,
        },
      });

      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });
        schedules.push(result);
      }

      startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedules;
};

const scheduleForDoctor = async (
  user: JwtPayload,
  filters: any,
  options: Ioptions
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { startDateTime: filterstartDateTime, endDateTime: filterendDateTime } =
    filters;

  const andConditions: Prisma.ScheduleWhereInput[] = [];
  if (filterstartDateTime && filterendDateTime) {
    andConditions.push({
      AND: [
        {
          startDateTime: {
            gte: filterstartDateTime,
          },
        },
        {
          endDateTime: {
            lte: filterendDateTime,
          },
        },
      ],
    });
  }
  const whereConditions: Prisma.ScheduleWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};
  const doctorSchedules = await prisma.doctorSchedule.findMany({
    where: {
      doctor: {
        email: user.email,
      },
    },
    select: {
      scheduleId: true,
    },
  });

  const doctorScheduleIds = doctorSchedules.map(
    (schedule) => schedule.scheduleId
  );

  const result = await prisma.schedule.findMany({
    skip,
    take: limit,
    where: {
      ...whereConditions,
      id: {
        notIn: doctorScheduleIds,
      },
    },

    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.schedule.count({
    where: {
      ...whereConditions,
      id: {
        notIn: doctorScheduleIds,
      },
    },
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

const scheduleDelete = async (id: string) => {
  return await prisma.schedule.delete({
    where: {
      id,
    },
  });
};

const getAllFromDB = async (
  filters: IFilterRequest,
  options: Ioptions,
  user: any
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { startDate, endDate, ...filterData } = filters;

  const andConditions = [];

  if (startDate && endDate) {
    // Both dates provided - find schedules within the date range
    const startOfDay = new Date(startDate as string);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(endDate as string);
    endOfDay.setUTCHours(23, 59, 59, 999);

    andConditions.push({
      startDateTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    });
  } else if (startDate) {
    // Only start date - find schedules on that specific day
    const startOfDay = new Date(startDate as string);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(startDate as string);
    endOfDay.setUTCHours(23, 59, 59, 999);

    andConditions.push({
      startDateTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    });
  } else if (endDate) {
    // Only end date - find schedules on that specific day
    const startOfDay = new Date(endDate as string);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(endDate as string);
    endOfDay.setUTCHours(23, 59, 59, 999);

    andConditions.push({
      startDateTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
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

  const whereConditions: Prisma.ScheduleWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const doctorSchedules = await prisma.doctorSchedule.findMany({
    where: {
      doctor: {
        email: user?.email,
      },
    },
  });

  const doctorScheduleIds = doctorSchedules.map(
    (schedule) => schedule.scheduleId
  );

  const result = await prisma.schedule.findMany({
    where: {
      ...whereConditions,
      id: {
        notIn: doctorScheduleIds,
      },
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: "desc",
          },
  });

  const total = await prisma.schedule.count({
    where: {
      ...whereConditions,
      id: {
        notIn: doctorScheduleIds,
      },
    },
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

const getByIdFromDB = async (id: string): Promise<Schedule | null> => {
  const result = await prisma.schedule.findUnique({
    where: {
      id,
    },
  });

  return result;
};

export const ScheduleService = {
  createSchedule,
  scheduleForDoctor,
  scheduleDelete,
  getAllFromDB,
  getByIdFromDB,
};
