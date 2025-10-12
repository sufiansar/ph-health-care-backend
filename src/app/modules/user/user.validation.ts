import z, { email } from "zod";
const createPatientSchema = z.object({
  password: z.string(),
  patient: z.object({
    name: z.string({
      message: "Name Is Required",
    }),
    email: z.string({
      message: "Email Is Required ",
    }),
    address: z.string().optional(),
  }),
});

export const createAdminSchema = z.object({
  password: z.string(),
  admin: z.object({
    name: z.string({
      message: "Name is required",
    }),
    email: z
      .string({
        message: "Email is required",
      })
      .email("Invalid email address"),
    contactNumber: z.string({
      message: "Contact number is required",
    }),
    isDeleted: z.boolean().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  }),
});

export const GenderEnum = z.enum(["MALE", "FEMALE"]);

export const createDoctorSchema = z.object({
  password: z.string(),
  doctor: z.object({
    name: z.string({ message: "Name is required" }),
    email: z
      .string({ message: "Email is required" })
      .email("Invalid email address"),
    contactNumber: z.string({ message: "Contact number is required" }),
    address: z.string({ message: "Address is required" }),
    registrationNumber: z.string({
      message: "Registration number is required",
    }),
    experience: z.number().int().nonnegative().optional(),
    gender: GenderEnum,
    appointmentFee: z
      .number()
      .int({ message: "Appointment fee must be an integer" }),
    qualification: z.string({ message: "Qualification is required" }),
    currentWorkingPlace: z.string({
      message: "Current working place is required",
    }),
    designation: z.string({ message: "Designation is required" }),
  }),
});

export const UserValidation = {
  createPatientSchema,
  createAdminSchema,
  createDoctorSchema,
};
