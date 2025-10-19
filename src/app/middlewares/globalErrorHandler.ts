import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let success = false;
  let message = err.message || "Something went wrong!";
  let error = err;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      (message = "Duplicate Error"), (error = err.meta);
    }
    if (error.code === "P2003") {
      (message = "A constraint failed on the database"), (error = err.meta);
    }
    if (error.code === "P1000") {
      (message = "Authentication failed against database server"),
        (error = err.meta);
    }

    if (error.code === "P2025") {
      (message = "Required record not found"), (error = err.meta);
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    (message = "Validation Error"),
      (error = err.message),
      (statusCode = httpStatus.BAD_REQUEST);
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    (message = "Unknown Prisma error occured!"),
      (error = err.message),
      (statusCode = httpStatus.BAD_REQUEST);
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    (message = "Prisma client failed to initialize!"),
      (error = err.message),
      (statusCode = httpStatus.BAD_REQUEST);
  }
  res.status(statusCode).json({
    success,
    message,
    error,
  });
};

export default globalErrorHandler;
