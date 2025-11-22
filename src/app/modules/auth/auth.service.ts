import { UserStatus } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import config from "../../../config";
import { jwtHelpers } from "../../helper/jwtHelper";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { createUserToken } from "../../helper/userToken";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../helper/sendEmail";
import { name } from "ejs";

const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const ispassword = await bcrypt.compare(payload.password, user.password);

  if (!ispassword) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Password is Wrong Please Give Correct Password"
    );
  }
  const userToken = createUserToken(user);

  return {
    accessToken: userToken.accessToken,
    refreshToken: userToken.refreshToken,
    needPasswordChange: user.needPasswordChange,
  };
};

const newAccessToken = async (refreshToken: string) => {
  const verifiedToken = jwtHelpers.verifyToken(
    refreshToken,
    config.jwt.refreshToken_secret as string
  );
  if (!verifiedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please Login First");
  }
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: verifiedToken.email,
      status: UserStatus.ACTIVE,
    },
  });

  const userToken = createUserToken(user);

  return {
    accessToken: userToken.accessToken,
  };
};

const resetPassword = async (
  oldPassword: string,
  newPassword: string,
  user: any
) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  const ispassword = await bcrypt.compare(oldPassword, isUserExist.password);

  if (!ispassword) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Old Password is Wrong Please Give Correct Password"
    );
  }
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedNewPassword;
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedNewPassword },
  });
  return hashedNewPassword;
};

const forgotPassword = async (email: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const jwtPayload = {
    id: isUserExist.id,
    email: isUserExist.email,
    role: isUserExist.role,
  };
  const resetToken = jwt.sign(
    jwtPayload,
    config.jwt.accessToken_secret as string,
    {
      expiresIn: "10m",
    }
  );

  const resetLink = `http://localhost:3000/reset-password?id=${isUserExist.id}&token=${resetToken}`;

  console.log(`Password reset link (send this via email): ${resetLink}`);

  await sendEmail({
    to: isUserExist.email,
    subject: "Password Reset Request",
    templateName: "forgotPassword",
    templateData: {
      email: isUserExist.email,
      resetLink: resetLink,
      expiryTime: "15 minutes",
      ipAddress: "Unknown",
      companyName: "Sufian Health Care",
      supportEmail: "support@sufianhealthcare.com",
      privacyUrl: "https://sufianhealthcare.com/privacy",
      termsUrl: "https://sufianhealthcare.com/terms",
    },
    text: `Hello ${isUserExist.email},\n\nWe received a password reset request for your account. Click the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 15 minutes.\nIf you didn't request this, please ignore this message.`,
  });

  return resetToken;
};

const changePassword = async (user: any, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new Error("Password incorrect!");
  }

  const hashedPassword: string = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcryptJs_salt)
  );

  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return {
    message: "Password changed successfully!",
  };
};

const getMyProfile = async (session: any) => {
  const accessToken = session.accessToken;
  const decodedToken = jwtHelpers.verifyToken(
    accessToken,
    config.jwt.accessToken_secret as string
  );
  if (!decodedToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please Login First");
  }
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedToken.email,
      status: UserStatus.ACTIVE,
    },
  });

  const { id, email, role, needPasswordChange, status } = user;

  return { id, email, role, needPasswordChange, status };
};
export const AuthService = {
  login,
  newAccessToken,
  resetPassword,
  forgotPassword,
  getMyProfile,
  changePassword,
};
