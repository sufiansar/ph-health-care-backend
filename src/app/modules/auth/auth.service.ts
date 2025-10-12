import { UserRole, UserStatus } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../../config";
import { jwtHelpers } from "../../helper/jwtHelper";

const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const ispassword = bcrypt.compare(payload.password, user.password);

  if (!ispassword) {
    throw new Error("Password is Wrong Please Give Correct Password");
  }

  const jwtPayload = {
    email: payload.email,
    role: user.role,
    password: payload.password,
  };

  if (!config.jwt.accessToken_secret) {
    throw new Error("JWT access token secret is not defined in config.");
  }
  if (!config.jwt.refreshToken_secret) {
    throw new Error("JWT refresh token secret is not defined in config.");
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
    needPasswordChange: user.needPasswordChange,
  };
};

export const AuthService = {
  login,
};
