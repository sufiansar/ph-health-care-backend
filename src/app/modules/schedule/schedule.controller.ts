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

export const SchedulesController = {
  createSchedule,
  scheduleForDoctor,
  scheduleDelete,
};
