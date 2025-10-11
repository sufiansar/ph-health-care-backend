import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AuthService } from "./auth.service";

const login = catchAsync(async (req, res) => {
  const user = req.body;

  const result = await AuthService.login(user);

  const { accessToken, refreshToken, needPasswordChange } = result;
  res.cookie("accessToken", accessToken, {
    secure: true,
    sameSite: "none",
    httpOnly: true,
    maxAge: 1000 * 60 * 60,
  });
  res.cookie("refreshToken", refreshToken, {
    secure: true,
    sameSite: "none",
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 90,
  });
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Loged in Successfully!!!",
    data: {
      needPasswordChange,
    },
  });
});

export const AuthController = {
  login,
};
