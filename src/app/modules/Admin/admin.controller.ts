import { Request, Response } from "express";
import pick from "../../helper/pick";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { paginationableFields } from "../user/user.constent";
import { AdminService } from "./admin.service";

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, [
    "name",
    "email",
    "contactNumber",
    "searchTerm",
  ]);
  const options = pick(req.query, paginationableFields);

  const result = await AdminService.getAllFromDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin data fetched successfully",
    data: result,
  });
});

const adminUpdate = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdminService.adminUpdate(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin data updated successfully",
    data: result,
  });
});
const adminGetById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdminService.getAdminById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin data fetched successfully",
    data: result,
  });
});

const adminDelete = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdminService.adminDelete(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin data deleted successfully",
    data: result,
  });
});

export const AdminController = {
  getAllFromDB,
  adminUpdate,
  adminDelete,
  adminGetById,
};
