import z from "zod";
// const createPatientSchema = z.object({
//   password: z.string(),
//   patient: z.object({
//     name: z.string({
//       message: "Name Is Required",
//     }),
//     email: z.string({
//       message: "Email Is Required ",
//     }),
//     address: z.string().optional(),
//   }),
// });

// export const createAdminSchema = z.object({
//   password: z.string(),
//   admin: z.object({
//     name: z.string({
//       message: "Name is required",
//     }),
//     email: z
//       .string({
//         message: "Email is required",
//       })
//       .email("Invalid email address"),
//     contactNumber: z.string({
//       message: "Contact number is required",
//     }),
//     isDeleted: z.boolean().optional(),
//     createdAt: z.date().optional(),
//     updatedAt: z.date().optional(),
//   }),
// });

export const GenderEnum = z.enum(["MALE", "FEMALE"]);

// export const createDoctorSchema = z.object({
//   password: z.string(),
//   doctor: z.object({
//     name: z.string({ message: "Name is required" }),
//     email: z
//       .string({ message: "Email is required" })
//       .email("Invalid email address"),
//     contactNumber: z.string({ message: "Contact number is required" }),
//     address: z.string({ message: "Address is required" }),
//     registrationNumber: z.string({
//       message: "Registration number is required",
//     }),
//     experience: z.number().int().nonnegative().optional(),
//     gender: GenderEnum,
//     appointmentFee: z
//       .number()
//       .int({ message: "Appointment fee must be an integer" }),
//     qualification: z.string({ message: "Qualification is required" }),
//     currentWorkingPlace: z.string({
//       message: "Current working place is required",
//     }),
//     designation: z.string({ message: "Designation is required" }),
//   }),
// });

// export const UserValidation = {
//   createPatientSchema,
//   createAdminSchema,
//   createDoctorSchema,
// };

import { Gender, UserStatus } from "@prisma/client";

const createAdminSchema = z.object({
  password: z.string({
    error: "Password is required",
  }),
  admin: z.object({
    name: z.string({
      error: "Name is required!",
    }),
    email: z.string({
      error: "Email is required!",
    }),
    contactNumber: z.string({
      error: "Contact Number is required!",
    }),
  }),
});

const createDoctorSchema = z.object({
  password: z.string({
    error: "Password is required",
  }),
  doctor: z.object({
    name: z.string({
      error: "Name is required!",
    }),
    email: z.string({
      error: "Email is required!",
    }),
    contactNumber: z.string({
      error: "Contact Number is required!",
    }),
    address: z.string().optional(),
    registrationNumber: z.string({
      error: "Reg number is required",
    }),
    experience: z.number().optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE]),
    appointmentFee: z.number({
      error: "Appointment fee is required",
    }),
    qualification: z.string({
      error: "Qualification is required",
    }),
    currentWorkingPlace: z.string({
      error: "Current working place is required!",
    }),
    designation: z.string({
      error: "Designation is required!",
    }),
    // NEW: Add specialties array for doctor creation
    specialties: z
      .array(
        z.string().uuid({
          message: "Each specialty must be a valid UUID",
        })
      )
      .min(1, {
        message: "At least one specialty is required",
      })
      .optional(),
  }),
});

const createPatientSchema = z.object({
  password: z.string(),
  patient: z.object({
    email: z
      .string({
        error: "Email is required!",
      })
      .email(),
    name: z.string({
      error: "Name is required!",
    }),
    contactNumber: z.string({
      error: "Contact number is required!",
    }),
    address: z.string({
      error: "Address is required",
    }),
  }),
});

const updateStatus = z.object({
  body: z.object({
    status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED]),
  }),
});

export const userValidation = {
  createAdminSchema,
  createDoctorSchema,
  createPatientSchema,
  updateStatus,
};
