import config from "../../config";
import httpStatus from "http-status";
import ApiError from "../errors/ApiError";
import { jwtHelpers } from "./jwtHelper";
import { User } from "@prisma/client";

export const createUserToken = (user: Partial<User>) => {
  if (!user || !user.id || !user.email || !user.role) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User payload is missing required fields"
    );
  }

  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  if (!config.jwt.accessToken_secret) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "JWT access token secret is not configured"
    );
  }

  if (!config.jwt.refreshToken_secret) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "JWT refresh token secret is not configured"
    );
  }

  const accessToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.accessToken_secret,
    config.jwt.accessToken_expiresIn as string
  );

  const refreshToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.refreshToken_secret,
    config.jwt.refreshToken_expiresIn as string
  );

  return {
    accessToken,
    refreshToken,
  };
};
