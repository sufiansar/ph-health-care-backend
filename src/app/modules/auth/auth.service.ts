import { UserStatus } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import config from "../../../config";
import { jwtHelpers } from "../../helper/jwtHelper";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { createUserToken } from "../../helper/userToken";
import jwt, { Secret } from "jsonwebtoken";
import { sendEmail } from "../../helper/sendEmail";
import { name } from "ejs";

const login = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new Error("Password incorrect!");
  }
  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.accessToken_secret as string,
    config.jwt.accessToken_expiresIn as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.refreshToken_secret as string,
    config.jwt.refreshToken_expiresIn as string
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      config.jwt.refreshToken_secret as string
    );
  } catch (err) {
    throw new Error("You are not authorized!");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.accessToken_secret as string,
    config.jwt.accessToken_expiresIn as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.refreshToken_secret as string,
    config.jwt.refreshToken_expiresIn as string
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData.needPasswordChange,
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

const getMyProfile = async (user: any) => {
  const accessToken = user.accessToken;
  const decodedData = jwtHelpers.verifyToken(
    accessToken,
    config.jwt.accessToken_secret as string
  );

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      role: true,
      needPasswordChange: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      doctor: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          address: true,
          registrationNumber: true,
          experience: true,
          gender: true,
          appointmentFee: true,
          qualification: true,
          currentWorkingPlace: true,
          designation: true,
          averageRating: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
          doctorSpecialties: {
            include: {
              specialities: true,
            },
          },
        },
      },
      patient: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          address: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
          patientHealthData: true,
        },
      },
    },
  });

  return userData;
};
const resetADPassword = async (
  token: string,
  payload: { id: string; password: string }
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.id,
      status: UserStatus.ACTIVE,
    },
  });

  const isValidToken = jwtHelpers.verifyToken(
    token,
    config.jwt.accessToken_secret as string
  );

  if (!isValidToken) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
  }

  // hash password
  const password = await bcrypt.hash(
    payload.password,
    Number(config.bcryptJs_salt)
  );

  // update into database
  await prisma.user.update({
    where: {
      id: payload.id,
    },
    data: {
      password,
      needPasswordChange: false,
    },
  });
};
export const AuthService = {
  login,
  refreshToken,
  resetPassword,
  forgotPassword,
  getMyProfile,
  changePassword,
  resetADPassword,
};
