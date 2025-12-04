import { JwtPayload } from "jsonwebtoken";
import pick from "../../helper/pick";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { fitersAbleFields, paginationableFields } from "./user.constent";
import { UserService } from "./user.service";
import { IAuthUser } from "../../interface";
import { Request, Response } from "express";

const createPatient = catchAsync(async (req, res) => {
  const user = req;
  const result = await UserService.createPatient(user);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Patient created Successfully!!!",
    data: result,
  });
});

const createAdmin = catchAsync(async (req, res) => {
  const user = req;
  const result = await UserService.createAdmin(user);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Admin created Successfully!!!",
    data: result,
  });
});

const createDoctor = catchAsync(async (req, res) => {
  const user = req;
  const result = await UserService.createDoctor(user);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Doctor created Successfully!!!",
    data: result,
  });
});

const getAllUser = catchAsync(async (req, res) => {
  const filters = pick(req.query, fitersAbleFields);
  const options = pick(req.query, paginationableFields);

  const result = await UserService.getAllUser(filters, options);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User Retrive Successfully!!!",
    meta: result.meta,
    data: result.data,
  });
});

const getMe = catchAsync(async (req, res) => {
  const user = req.user as IAuthUser;
  const result = await UserService.getMe(user);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Get My Profile Retrive Successfully!!!",

    data: result,
  });
});

const changeStatus = catchAsync(async (req, res) => {
  const id = req.params.id;
  const user = req.body;
  const result = await UserService.changeStatus(id, user);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Status Changed Successfully!!!",

    data: result,
  });
});
const updateMyProfie = catchAsync(async (req, res) => {
  const user = req.user;

  const result = await UserService.updateMyProfie(user as IAuthUser, req);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "My profile updated!",
    data: result,
  });
});

export const UserController = {
  createPatient,
  createAdmin,
  createDoctor,
  getAllUser,
  getMe,
  changeStatus,
  updateMyProfie,
};
