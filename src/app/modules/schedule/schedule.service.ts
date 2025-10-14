import { addHours, addMinutes, format } from "date-fns";
import { prisma } from "../../shared/prisma";
import { Ioptions, paginationHelper } from "../../helper/paginationHelpers";
import { Prisma } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

const createSchedule = async (payload: any) => {
  //   const { startTime, endTime, startDate, endDate } = payload;

  //   console.log(payload);
  //   const intervalTime = 30;
  //   const schedule = [];
  //   const currentDate = new Date(startDate);
  //   const lastDate = new Date(endDate);

  //   while (currentDate <= lastDate) {
  //     const startDateTime = new Date(
  //       addMinutes(
  //         addHours(
  //           `${format(currentDate, "yyyy-MM-dd")}`,
  //           Number(startTime.split(":")[0])
  //         ),
  //         Number(startTime.split(":")[1])
  //       )
  //     );

  //     const endDateTime = new Date(
  //       addMinutes(
  //         addHours(
  //           `${format(currentDate, "yyyy-MM-dd")}`,
  //           Number(endTime.split(":")[0])
  //         ),
  //         Number(endTime.split(":")[1])
  //       )
  //     );

  //     console.log(currentDate, lastDate);
  //     while (startDateTime < endDateTime) {
  //       const slotStartDateTime = startDateTime;
  //       const slotEndDateTime = addMinutes(startDateTime, intervalTime);
  //       const scheduleData = {
  //         startDateTime: slotStartDateTime,
  //         endDateTime: slotEndDateTime,
  //       };
  //       console.log(slotEndDateTime, slotStartDateTime);

  //       const existingSchedule = await prisma.schedule.findFirst({
  //         where: scheduleData,
  //       });

  //       if (!existingSchedule) {
  //         const result = await prisma.schedule.create({
  //           data: scheduleData,
  //         });
  //         schedule.push(result);
  //       }

  //       slotEndDateTime.setMinutes(slotEndDateTime.getMinutes() + intervalTime);
  //     }
  //     currentDate.setDate(currentDate.getDate() + 1);
  //   }
  //   return schedule;

  const { startTime, endTime, startDate, endDate } = payload;

  const intervalTime = 30;
  const schedules = [];

  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    const startDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(startTime.split(":")[0]) // 11:00
        ),
        Number(startTime.split(":")[1])
      )
    );

    const endDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(endTime.split(":")[0]) // 11:00
        ),
        Number(endTime.split(":")[1])
      )
    );

    while (startDateTime < endDateTime) {
      const slotStartDateTime = startDateTime;
      const slotEndDateTime = addMinutes(startDateTime, intervalTime);

      const scheduleData = {
        startDateTime: slotStartDateTime,
        endDateTime: slotEndDateTime,
      };

      const existingSchedule = await prisma.schedule.findFirst({
        where: scheduleData,
      });

      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });
        schedules.push(result);
      }

      slotStartDateTime.setMinutes(
        slotStartDateTime.getMinutes() + intervalTime
      );
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

export const ScheduleService = {
  createSchedule,
  scheduleForDoctor,
  scheduleDelete,
};
