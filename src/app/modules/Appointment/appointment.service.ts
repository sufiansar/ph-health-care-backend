import {
  AppointmentStatus,
  PaymentStatus,
  Prisma,
  UserRole,
} from "@prisma/client";
import { Ioptions, paginationHelper } from "../../helper/paginationHelpers";
import { stripe } from "../../helper/stripe";
import { prisma } from "../../shared/prisma";
import { v4 as uuidv4 } from "uuid";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { IAuthUser } from "../../interface";

const appointmentCreate = async (user: any, payload: any) => {
  const patientEmail = await prisma.patient.findUniqueOrThrow({
    where: { email: user.email },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { id: payload.doctorId, isDeleted: false },
  });
  const isBookedCheck = await prisma.doctorSchedule.findFirstOrThrow({
    where: {
      doctorId: payload.doctorId,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });

  const videoCallingId = uuidv4();
  const result = await prisma.$transaction(async (tnx) => {
    const appointmentData = await tnx.appointment.create({
      data: {
        patientId: patientEmail.id,
        doctorId: doctorData.id,
        scheduleId: isBookedCheck.scheduleId,
        videoCallingId,
      },
    });

    await tnx.doctorSchedule.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });
    const transactionId = uuidv4();
    const paymentdata = await tnx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Appointment with Dr. ${doctorData.name}`,
              description: `Patient: ${
                user.name
              } | Date: ${appointmentData.createdAt.toDateString()}`,
            },
            unit_amount: doctorData.appointmentFee * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: appointmentData.id,
        paymentId: paymentdata.id,
        transactionId: transactionId,
      },
      success_url: `https://www.linkedin.com/in/sufian32`,
      cancel_url: `https://www.facebook.com/sufian.asr`,
    });

    //     res.status(200).json({ success: true, url: session.url });
    //   } catch (error: any) {
    //     console.error("Stripe session error:", error);
    //     res.status(500).json({ success: false, message: "Payment initialization failed" });
    //   }
    // });

    return { paymentUrl: session.url };
  });

  return result;
};

const getMyAppointments = async (
  user: IAuthUser,
  filters: any,
  options: Ioptions
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { ...filterData } = filters;

  const andConditions: Prisma.AppointmentWhereInput[] = [];

  if (user?.role === UserRole.PATIENT) {
    andConditions.push({
      patient: {
        email: user?.email,
      },
    });
  } else if (user?.role === UserRole.DOCTOR) {
    andConditions.push({
      doctor: {
        email: user?.email,
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));
    andConditions.push(...filterConditions);
  }

  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.appointment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include:
      user?.role === UserRole.PATIENT
        ? { doctor: true, schedule: true, Review: true, prescription: true }
        : {
            patient: {
              include: { medicalReport: true, patientHealthData: true },
            },
            schedule: true,
            prescription: true,
            Review: true,
          },
  });

  const total = await prisma.appointment.count({
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

const getAllAppointments = async (
  user: any,
  filters: any,
  options: Ioptions
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { ...filterData } = filters;

  const andConditions: Prisma.AppointmentWhereInput[] = [];

  if (user.role !== UserRole.ADMIN) {
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

  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const appointments = await prisma.appointment.findMany({
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
      patient: true,
    },
  });
  const total = await prisma.appointment.count({
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

const updateAppointment = async (
  appointmentId: string,
  status: AppointmentStatus,
  user: any
) => {
  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: { id: appointmentId },
    include: { doctor: true },
  });

  if (user.role === UserRole.DOCTOR) {
    if (appointment.doctor.email !== user.email) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You are not authorized to update this appointment"
      );
    }
  }

  return await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
  });
};

const changeAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus,
  user: any
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
    },
    include: {
      doctor: true,
    },
  });

  if (user?.role === UserRole.DOCTOR) {
    if (!(user.email === appointmentData.doctor.email)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "This is not your appointment!"
      );
    }
  }

  const result = await prisma.appointment.update({
    where: {
      id: appointmentId,
    },
    data: {
      status,
    },
  });

  return result;
};

const cancelUnpaidAppointment = async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  const unPaidAppointments = await prisma.appointment.findMany({
    where: {
      createdAt: {
        lte: thirtyMinutesAgo,
      },
      paymentStatus: PaymentStatus.UNPAID,
    },
  });

  const appointmentsIdToCancel = unPaidAppointments.map(
    (appointment) => appointment.id
  );

  await prisma.$transaction(async (tnx) => {
    await tnx.payment.deleteMany({
      where: {
        appointmentId: { in: appointmentsIdToCancel },
      },
    });
    await tnx.appointment.deleteMany({
      where: {
        id: { in: appointmentsIdToCancel },
      },
    });

    for (const unPaidAppiontment of unPaidAppointments) {
      await tnx.doctorSchedule.update({
        where: {
          doctorId_scheduleId: {
            doctorId: unPaidAppiontment.doctorId,
            scheduleId: unPaidAppiontment.scheduleId,
          },
        },
        data: {
          isBooked: true,
        },
      });
    }
  });
};

export const AppointmentService = {
  appointmentCreate,
  getMyAppointments,
  updateAppointment,
  cancelUnpaidAppointment,
  getAllAppointments,
  changeAppointmentStatus,
};
