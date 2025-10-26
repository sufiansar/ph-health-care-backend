import { AppointmentStatus, Prisma } from "@prisma/client";
import ApiError from "../../errors/ApiError";
import { prisma } from "../../shared/prisma";
import httpStatus from "http-status";
import { Ioptions, paginationHelper } from "../../helper/paginationHelpers";

const createReview = async (user: any, reviewData: any) => {
  const isUserExist = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: reviewData.appointmentId,
    },
  });

  if (appointment.patientId !== isUserExist.id) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You are not authorized to review this appointment"
    );
  }

  if (appointment.status !== AppointmentStatus.COMPLETED) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot review an appointment that is not completed"
    );
  }
  return await prisma.$transaction(async (tnx) => {
    const review = await tnx.review.create({
      data: {
        appointmentId: appointment.id,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        rating: reviewData.rating,
        comment: reviewData.comment,
      },
    });
    const avgRating = await tnx.review.aggregate({
      where: {
        doctorId: appointment.doctorId,
      },
      _avg: {
        rating: true,
      },
    });

    await tnx.doctor.update({
      where: {
        id: appointment.doctorId,
      },
      data: {
        avgRating: avgRating._avg.rating || 0,
      },
    });

    return review;
  });
};

const getAllReviews = async (user: any, filters: any, options: Ioptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { ...filterData } = filters;

  const andConditions: Prisma.ReviewWhereInput[] = [];

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.ReviewWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const reviews = await prisma.review.findMany({
    skip,
    take: limit,
    where: {
      AND: whereConditions,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      Doctor: true,
      Patient: true,
      Appointment: true,
    },
  });
  const total = await prisma.review.count({
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
    data: reviews,
  };
};
export const ReviewService = {
  createReview,
  getAllReviews,
};
