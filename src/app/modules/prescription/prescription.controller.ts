import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { PrescriptionService } from "./prescription.service";
import pick from "../../helper/pick";
import { paginationableFields } from "../user/user.constent";

const createPrescription = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  const prescriptionData = req.body;
  const result = await PrescriptionService.createPrescription(
    user,
    prescriptionData
  );
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Prescription created Successfully!!!",
    data: result,
  });
});

const getMyPrescriptionPatient = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, ["followUpDate", "instructions"]);
    const options = pick(req.query, paginationableFields);
    const user = req.user;
    const result = await PrescriptionService.getMyPrescriptionPatient(
      user,
      filters,
      options
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Fetched all My Prescription successfully!",
      data: result,
    });
  }
);

export const PrescriptionController = {
  createPrescription,
  getMyPrescriptionPatient,
};
