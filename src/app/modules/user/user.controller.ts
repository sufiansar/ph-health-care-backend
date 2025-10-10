import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { UserService } from "./user.service";

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

export const UserController = {
  createPatient,
};
