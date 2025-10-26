import { Request, Response } from "express";
import pick from "../../helper/pick";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { paginationableFields } from "../user/user.constent";
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

const getAllDoctorSchedules = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, ["isBooked"]);
    const options = pick(req.query, paginationableFields);
    const user = req.user;
    const result = await DoctorScheduleService.getAllDoctorSchedules(
      user,
      filters,
      options
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Doctor Schedules retrieved Successfully!!!",
      data: result,
    });
  }
);

const getMyDoctorSchedules = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["isBooked"]);
  const options = pick(req.query, paginationableFields);
  const user = req.user;
  const result = await DoctorScheduleService.getMyDoctorSchedules(
    user,
    filters,
    options
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "My Doctor Schedules retrieved Successfully!!!",
    data: result,
  });
});

const updateDoctorSchedule = catchAsync(async (req, res) => {
  const result = await DoctorScheduleService.updateDoctorSchedule();
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Doctor Schedule Updated Successfully!!!",
    data: result,
  });
});

const deleteDoctorSchedule = catchAsync(async (req, res) => {
  const doctor = req.user;
  const scheduleId = req.params.id;

  const result = await DoctorScheduleService.deleteDoctorSchedule(
    doctor,
    scheduleId
  );
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Doctor Schedule Deleted Successfully!!!",
    data: result,
  });
});

export const DoctorScheduleContorller = {
  createDoctorSchedule,
  updateDoctorSchedule,
  getAllDoctorSchedules,
  getMyDoctorSchedules,
  deleteDoctorSchedule,
};
