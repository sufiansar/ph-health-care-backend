import { prisma } from "../../shared/prisma";
import { v4 as uuidv4 } from "uuid";

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
    await tnx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });
    return appointmentData;
  });

  return result;
};
export const AppointmentService = {
  appointmentCreate,
};
