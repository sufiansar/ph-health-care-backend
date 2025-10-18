import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import pick from "../../helper/pick";
import { paginationableFields } from "../user/user.constent";
import { doctorFiterAbleFields } from "./doctor.constant";
import { DoctorService } from "./doctor.service";
const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, doctorFiterAbleFields);
  const options = pick(req.query, paginationableFields);

  const result = await DoctorService.getAllFromDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor data fetched successfully",
    data: result,
  });
});

const doctorUpdate = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await DoctorService.doctorUpdate(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor updated successfully!",
    data: result,
  });
});

export const DoctorController = {
  getAllFromDB,
  doctorUpdate,
};
