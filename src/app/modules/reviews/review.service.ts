import { AppointmentStatus } from "@prisma/client";
import ApiError from "../../errors/ApiError";
import { prisma } from "../../shared/prisma";
import httpStatus from "http-status";

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

export const ReviewService = {
  createReview,
};
