import { Request, Response } from "express";
import pick from "../../helper/pick";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { fitersAbleFields } from "../user/user.constent";
import { ScheduleService } from "./schedule.service";

const createSchedule = catchAsync(async (req, res) => {
  const user = req.body;
  const result = await ScheduleService.createSchedule(user);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Schedule created Successfully!!!",
    data: result,
  });
});

const scheduleForDoctor = catchAsync(async (req, res) => {
  const filters = pick(req.query, ["startDateTime", "endDateTime"]);
  const options = pick(req.query, fitersAbleFields);
  const user = req.user;
  console.log(user);

  const result = await ScheduleService.scheduleForDoctor(
    user,
    filters,
    options
  );
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "ScheduleForDoctor Fetch Successfully!!!",
    meta: result.meta,
    data: result.data,
  });
});

const scheduleDelete = catchAsync(async (req, res) => {
  const schedule = req.params.id;
  const result = await ScheduleService.scheduleDelete(schedule);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule Deleted Successfully!!!",
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["startDate", "endDate"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const user = req.user;
  const result = await ScheduleService.getAllFromDB(filters, options, user);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule fetched successfully!",
    data: result.data,
    meta: result.meta,
  });
});

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ScheduleService.getByIdFromDB(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule retrieval successfully",
    data: result,
  });
});

export const SchedulesController = {
  createSchedule,
  scheduleForDoctor,
  scheduleDelete,
  getAllFromDB,
  getByIdFromDB,
};
