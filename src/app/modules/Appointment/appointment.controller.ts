import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AppointmentService } from "./appointment.service";

const appointmentCreate = catchAsync(async (req, res) => {
  const user = req.user;
  const payload = req.body; 
  const result = await AppointmentService.appointmentCreate(user, payload);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Appointment created Successfully!!!",
    data: result,
  });
});

export const AppointmentController = {
  appointmentCreate,
};
