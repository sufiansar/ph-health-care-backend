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

const newAccessToken = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const result = await AuthService.newAccessToken(refreshToken);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Refresh Token Generated Successfully!!!",
    data: result,
  });
});

const logout = catchAsync(async (req, res) => {
  res.clearCookie("accessToken", {
    secure: true,
    sameSite: "none",
    httpOnly: true,
  });
  res.clearCookie("refreshToken", {
    secure: true,
    sameSite: "none",
    httpOnly: true,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  const user = req.user;

  const result = await AuthService.resetPassword(
    oldPassword,
    newPassword,
    user
  );
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Password Reset Successfully!!!",
    data: result,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const email = req.body.email;
  const result = await AuthService.forgotPassword(email);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Password Reset Successfully!!!",
    data: result,
  });
});
const getMyProfile = catchAsync(async (req, res) => {
  const userSession = req.cookies;

  const result = await AuthService.getMyProfile(userSession);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile fetched successfully",
    data: result,
  });
});

export const AuthController = {
  login,
  newAccessToken,
  logout,
  resetPassword,
  forgotPassword,
  getMyProfile,
};
