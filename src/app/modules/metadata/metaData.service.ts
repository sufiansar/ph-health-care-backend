import { PaymentStatus, UserRole } from "@prisma/client";
import { prisma } from "../../shared/prisma";

const fetchMetaDataDashboard = async (user: any) => {
  let dashboardData;
  switch (user.role) {
    case UserRole.ADMIN:
      dashboardData = await getAdminMetaData();
      break;
    case UserRole.DOCTOR:
      dashboardData = await getDoctorMetaData(user);
      break;
    case UserRole.PATIENT:
      dashboardData = await getPatientMetaData(user);
      break;
    default:
      dashboardData = "General metadata";
  }
  return { dashboardData };
};

const getAdminMetaData = async () => {
  const totalPatients = await prisma.patient.count();
  const totalDoctors = await prisma.doctor.count();
  const totalAppointments = await prisma.appointment.count();
  const totalAdmins = await prisma.admin.count();
  const totalReviews = await prisma.review.count();

  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },

    where: {
      status: PaymentStatus.PAID,
    },
  });
  const barchart = await barchartForAdmin();
  const pieChart = await pieChartForAdmin();

  return {
    totalPatients,
    totalDoctors,
    totalAppointments,
    totalReviews,
    totalAdmins,
    barchart,
    totalRevenue,
    pieChart,
  };
};

const barchartForAdmin = async () => {
  const data = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', "createdAt") AS month,
      COUNT(*)::INTEGER AS "appointmentCount"
    FROM "appointments"
    GROUP BY month
    ORDER BY month ASC;
  `;
  return data;
};

const pieChartForAdmin = async () => {
  const data = await prisma.appointment.groupBy({
    by: ["status"],
    _count: {
      status: true,
    },
  });

  const formattedData = data.map((item) => ({
    status: item.status,
    count: item._count.status,
  }));
  return formattedData;
};

const getPatientMetaData = async (user: any) => {
  const patient = await prisma.patient.findUniqueOrThrow({
    where: { email: user.email },
  });

  const totalAppointments = await prisma.appointment.count({
    where: { patientId: patient.id },
  });
  const totalReviews = await prisma.review.count({
    where: { patientId: patient.id },
  });
  const totalPayments = await prisma.payment.count({
    where: {
      appointment: {
        patientId: patient.id,
        paymentStatus: PaymentStatus.PAID,
      },
    },
  });
  const totalPrescriptions = await prisma.prescription.count({
    where: { patientId: patient.id },
  });

  const appiontmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    where: { patientId: patient.id },
    _count: {
      status: true,
    },
  });

  const formattedStatusDistribution = appiontmentStatusDistribution.map(
    (item) => ({
      status: item.status,
      count: item._count.status,
    })
  );
  return {
    totalAppointments,
    totalReviews,
    totalPayments,
    totalPrescriptions,
    formattedStatusDistribution,
  };
};

const getDoctorMetaData = async (user: any) => {
  const doctor = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email },
  });

  const totalAppointments = await prisma.appointment.count({
    where: { doctorId: doctor.id },
  });
  const totalReviews = await prisma.review.count({
    where: { doctorId: doctor.id },
  });
  const totalPatients = await prisma.appointment.groupBy({
    by: ["patientId"],
    _count: {
      id: true,
    },
  });

  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },

    where: {
      appointment: {
        doctorId: doctor.id,
        paymentStatus: PaymentStatus.PAID,
      },
    },
  });

  const appiontmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    where: { doctorId: doctor.id },
    _count: {
      status: true,
    },
  });

  const formattedStatusDistribution = appiontmentStatusDistribution.map(
    (item) => ({
      status: item.status,
      count: item._count.status,
    })
  );

  return {
    totalAppointments,
    totalReviews,
    totalPatients,
    totalRevenue,
    formattedStatusDistribution,
  };
};

export const MetaDataService = {
  fetchMetaDataDashboard,
};
