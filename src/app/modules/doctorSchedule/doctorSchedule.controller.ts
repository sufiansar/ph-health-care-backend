import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { DoctorScheduleService } from "./doctorSchedule.service";

const createDoctorSchedule = catchAsync(async (req, res) => {
  const user = req.user;

  const payload = req.body;
  const result = await DoctorScheduleService.createDoctorSchedule(
    user,
    payload
  );
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Doctor Schedule created Successfully!!!",
    data: result,
  });
});

export const DoctorScheduleContorller = {
  createDoctorSchedule,
};
