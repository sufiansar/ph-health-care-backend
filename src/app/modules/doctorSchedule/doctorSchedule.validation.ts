import z from "zod";

const createDoctorScheduleSchema = z.object({
  body: z.object({
    schedulesIds: z.array(z.string()),
  }),
});

export const DoctorScheduleValidation = {
  createDoctorScheduleSchema,
};
