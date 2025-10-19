import { Prisma } from "@prisma/client";
import { Ioptions, paginationHelper } from "../../helper/paginationHelpers";
import { doctorSearchAbleFields } from "./doctor.constant";
import { prisma } from "../../shared/prisma";
import { IDoctorUpdateInput } from "./doctor.interface";
import ApiError from "../../errors/ApiError";
import http_status from "http-status";
import { openai } from "../../helper/openRouterAi";

const getAllFromDB = async (filters: any, options: Ioptions) => {
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, specialties, ...filterValues } = filters;
  const andConditions: Prisma.DoctorWhereInput[] = [];
  if (searchTerm) {
    andConditions.push({
      OR: doctorSearchAbleFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (specialties) {
    andConditions.push({
      doctorSpecialties: {
        some: {
          specialities: {
            title: {
              contains: specialties,
              mode: "insensitive",
            },
          },
        },
      },
    });
  }

  if (Object.keys(filterValues).length > 0) {
    andConditions.push({
      AND: Object.keys(filterValues).map((key) => ({
        [key]: {
          equals: filterValues[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.DoctorWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const result = await prisma.doctor.findMany({
    skip,
    take: limit,
    where: {
      AND: whereConditions,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
    },
  });

  const total = await prisma.doctor.count({
    where: whereConditions,
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

const doctorUpdate = async (
  id: string,
  payload: Partial<IDoctorUpdateInput>
) => {
  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const { specialties, ...doctorData } = payload;

  return await prisma.$transaction(async (tnx) => {
    if (specialties && specialties.length > 0) {
      const deleteSpecialtyIds = specialties.filter(
        (specialty) => specialty.isDeleted
      );

      for (const specialty of deleteSpecialtyIds) {
        await tnx.doctorSpecialties.deleteMany({
          where: {
            doctorId: id,
            specialitiesId: specialty.specialtyId,
          },
        });
      }

      const createSpecialtyIds = specialties.filter(
        (specialty) => !specialty.isDeleted
      );

      for (const specialty of createSpecialtyIds) {
        await tnx.doctorSpecialties.create({
          data: {
            doctorId: id,
            specialitiesId: specialty.specialtyId,
          },
        });
      }
    }

    const updatedData = await tnx.doctor.update({
      where: {
        id: doctorInfo.id,
      },
      data: doctorData,
      include: {
        doctorSpecialties: {
          include: {
            specialities: true,
          },
        },
      },
    });

    return updatedData;
  });
};

const getDoctorById = async (id: string) => {
  const doctor = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
      doctorSchedule: {
        include: {
          schedule: true,
        },
      },
    },
  });

  return doctor;
};

const aiAgentSuggestionDoctor = async (payload: { symptoms: string }) => {
  if (!payload?.symptoms) {
    throw new ApiError(
      http_status.BAD_REQUEST,
      "Symptoms are required for AI suggestions."
    );
  }

  const doctors = await prisma.doctor.findMany({
    where: { isDeleted: false },
    include: { doctorSpecialties: { include: { specialities: true } } },
  });

  const doctorsList = doctors.map((doc) => ({
    name: doc.name,
    email: doc.email,
    contactNumber: doc.contactNumber,
    specialties: doc.doctorSpecialties.map((ds) => ds.specialities.title),
  }));

  const specialtiesList = [
    ...new Set(doctorsList.flatMap((d) => d.specialties)),
  ];

  const prompt = `
You are a professional medical AI assistant. A patient reports the following symptoms: "${
    payload.symptoms
  }".

Available specialties: ${specialtiesList.join(", ")}.
Doctors and their specialties: ${JSON.stringify(doctorsList)}.

Task:
1. Suggest the top 3 specialties most relevant to these symptoms.
2. Assign a confidence score (0-100) for each specialty.
3. Recommend up to 5 doctors who match these specialties.
4. Return ONLY JSON in this format:

{
  "suggestedSpecialties": [
    { "specialty": "Specialty Name", "confidence": 85 },
    { "specialty": "Specialty Name", "confidence": 70 }
  ],
  "suggestedDoctors": [
    { "name": "Doctor Name","email": "Doctor Email",
      "contactNumber": "Doctor Contact", "specialty": "Specialty Name" }
  ]
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful medical assistant that provides specialty and doctor recommendations based on patient symptoms.",
      },

      { role: "user", content: prompt },
    ],
    temperature: 0,
  });

  const aiText = response.choices[0].message?.content || "{}";
  let aiResult = { suggestedSpecialties: [], suggestedDoctors: [] };
  console.log(aiResult);
  try {
    aiResult = JSON.parse(aiText);
  } catch (err) {
    console.warn("AI response parsing failed:", aiText);
  }

  return {
    message: "AI suggested specialties and doctors based on symptoms.",
    ...aiResult,
  };
};

const deleteDoctor = async (id: string) => {
  const doctor = await prisma.doctor.delete({
    where: {
      id,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
    },
  });

  return doctor;
};

export const DoctorService = {
  getAllFromDB,
  doctorUpdate,
  getDoctorById,
  deleteDoctor,
  aiAgentSuggestionDoctor,
};
