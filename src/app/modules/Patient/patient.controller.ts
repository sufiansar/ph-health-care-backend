import { Request, Response } from "express";
import pick from "../../helper/pick";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { paginationableFields } from "../user/user.constent";
import { PatientService } from "./patient.service";
import { MedicalReport, Patient, PatientHealthData } from "@prisma/client";

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["name", "email", "searchTerm"]);
  const options = pick(req.query, paginationableFields);

  const result = await PatientService.getAllFromDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient data fetched successfully",
    data: result,
  });
});

const getPatientById = catchAsync(async (req: Request, res: Response) => {
  const patientId = req.params.id;

  const result = await PatientService.getPatientById(patientId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient data fetched successfully",
    data: result,
  });
});

const updatePatient = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const payload = req.body;

  const result = await PatientService.updatePatient(payload, user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient data updated successfully",
    data: result,
  });
});
const deletePatient = catchAsync(async (req: Request, res: Response) => {
  const patientId = req.params.id;

  const result = await PatientService.deletePatient(patientId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient data deleted successfully",
    data: result,
  });
});

export const PatientController = {
  getAllFromDB,
  updatePatient,
  deletePatient,
  getPatientById,
};
