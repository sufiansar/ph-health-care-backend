import { Doctor, Prisma, UserStatus } from "@prisma/client";
import { Ioptions, paginationHelper } from "../../helper/paginationHelpers";
import { doctorSearchAbleFields } from "./doctor.constant";
import { prisma } from "../../shared/prisma";
import { IDoctorFilterRequest, IDoctorUpdate } from "./doctor.interface";
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
      doctorSchedule: {
        include: {
          schedule: true,
        },
      },
      Review: true,
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

const doctorUpdate = async (id: string, payload: IDoctorUpdate) => {
  const { specialties, removeSpecialties, ...doctorData } = payload;

  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  await prisma.$transaction(async (transactionClient) => {
    // Step 1: Update doctor basic data
    if (Object.keys(doctorData).length > 0) {
      await transactionClient.doctor.update({
        where: {
          id,
        },
        data: doctorData,
      });
    }

    // Step 2: Remove specialties if provided
    if (
      removeSpecialties &&
      Array.isArray(removeSpecialties) &&
      removeSpecialties.length > 0
    ) {
      // Validate that specialties to remove exist for this doctor
      const existingDoctorSpecialties =
        await transactionClient.doctorSpecialties.findMany({
          where: {
            doctorId: doctorInfo.id,
            specialitiesId: {
              in: removeSpecialties,
            },
          },
        });

      if (existingDoctorSpecialties.length !== removeSpecialties.length) {
        const foundIds = existingDoctorSpecialties.map(
          (ds) => ds.specialitiesId
        );
        const notFound = removeSpecialties.filter(
          (id) => !foundIds.includes(id)
        );
        throw new Error(
          `Cannot remove non-existent specialties: ${notFound.join(", ")}`
        );
      }

      // Delete the specialties
      await transactionClient.doctorSpecialties.deleteMany({
        where: {
          doctorId: doctorInfo.id,
          specialitiesId: {
            in: removeSpecialties,
          },
        },
      });
    }

    // Step 3: Add new specialties if provided
    if (specialties && Array.isArray(specialties) && specialties.length > 0) {
      // Verify all specialties exist in Specialties table
      const existingSpecialties = await transactionClient.specialties.findMany({
        where: {
          id: {
            in: specialties,
          },
        },
        select: {
          id: true,
        },
      });

      const existingSpecialtyIds = existingSpecialties.map((s) => s.id);
      const invalidSpecialties = specialties.filter(
        (id) => !existingSpecialtyIds.includes(id)
      );

      if (invalidSpecialties.length > 0) {
        throw new Error(
          `Invalid specialty IDs: ${invalidSpecialties.join(", ")}`
        );
      }

      // Check for duplicates - don't add specialties that already exist
      const currentDoctorSpecialties =
        await transactionClient.doctorSpecialties.findMany({
          where: {
            doctorId: doctorInfo.id,
            specialitiesId: {
              in: specialties,
            },
          },
          select: {
            specialitiesId: true,
          },
        });

      const currentSpecialtyIds = currentDoctorSpecialties.map(
        (ds) => ds.specialitiesId
      );
      const newSpecialties = specialties.filter(
        (id) => !currentSpecialtyIds.includes(id)
      );

      // Only create new specialties that don't already exist
      if (newSpecialties.length > 0) {
        const doctorSpecialtiesData = newSpecialties.map((specialtyId) => ({
          doctorId: doctorInfo.id,
          specialitiesId: specialtyId,
        }));

        await transactionClient.doctorSpecialties.createMany({
          data: doctorSpecialtiesData,
        });
      }
    }
  });

  // Step 4: Return updated doctor with specialties
  const result = await prisma.doctor.findUnique({
    where: {
      id: doctorInfo.id,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
    },
  });

  return result;
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
      Review: true,
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

const softDelete = async (id: string): Promise<Doctor> => {
  return await prisma.$transaction(async (transactionClient) => {
    const deleteDoctor = await transactionClient.doctor.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    await transactionClient.user.update({
      where: {
        email: deleteDoctor.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return deleteDoctor;
  });
};

const getAllPublic = async (
  filters: IDoctorFilterRequest,
  options: Ioptions
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, specialties, ...filterData } = filters;

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

  if (specialties && specialties.length > 0) {
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

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));
    andConditions.push(...filterConditions);
  }

  andConditions.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.DoctorWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.doctor.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { averageRating: "desc" },
    select: {
      id: true,
      name: true,
      // email: false, // Hide email in public API
      profilePhoto: true,
      contactNumber: true,
      address: true,
      registrationNumber: true,
      experience: true,
      gender: true,
      appointmentFee: true,
      qualification: true,
      currentWorkingPlace: true,
      designation: true,
      averageRating: true,
      createdAt: true,
      updatedAt: true,
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
      Review: {
        select: {
          rating: true,
          comment: true,
          createdAt: true,
          Patient: {
            select: {
              name: true,
              profilePhoto: true,
            },
          },
        },
      },
    },
  });

  const total = await prisma.doctor.count({
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

export const DoctorService = {
  getAllFromDB,
  doctorUpdate,
  getDoctorById,
  getAllPublic,
  deleteDoctor,
  aiAgentSuggestionDoctor,
  softDelete,
};
