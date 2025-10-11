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

export const UserValidation = {
  createPatientSchema,
};
