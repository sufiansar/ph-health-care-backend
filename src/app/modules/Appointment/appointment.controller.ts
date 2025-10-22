import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AppointmentService } from "./appointment.service";
import pick from "../../helper/pick";
import { paginationableFields } from "../user/user.constent";

const appointmentCreate = catchAsync(async (req: Request, res: Response) => {
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

const getMyAppointments = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["status", "paymentStatus"]);
  const options = pick(req.query, paginationableFields);
  const user = req.user;
  const result = await AppointmentService.getMyAppointments(
    user,
    filters,
    options
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Fetched my appointments successfully!",
    data: result,
  });
});

const getAllAppointments = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["status", "paymentStatus"]);
  const options = pick(req.query, paginationableFields);
  const user = req.user;
  const result = await AppointmentService.getAllAppointments(
    user,
    filters,
    options
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Fetched all appointments successfully!",
    data: result,
  });
});

const updateAppointment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = req.user;
  const result = await AppointmentService.updateAppointment(id, status, user);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Appointment updated successfully!",
    data: result,
  });
});

export const AppointmentController = {
  appointmentCreate,
  getMyAppointments,
  updateAppointment,
  getAllAppointments,
};
