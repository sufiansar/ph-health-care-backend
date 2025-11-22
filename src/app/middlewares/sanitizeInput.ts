import { NextFunction, Request, Response } from "express";

/**
 * Middleware to trim string inputs and remove potentially harmful characters
 */
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query (don't reassign the whole object)
  if (req.query) {
    const sanitizedQuery = sanitizeObject(req.query);
    Object.assign(req.query, sanitizedQuery);
  }

  // Sanitize params (same idea)
  if (req.params) {
    const sanitizedParams = sanitizeObject(req.params);
    Object.assign(req.params, sanitizedParams);
  }

  next();
};

const sanitizeObject = (obj: any): any => {
  if (typeof obj !== "object" || obj === null) {
    return sanitizeValue(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }
  return sanitized;
};

const sanitizeValue = (value: any): any => {
  if (typeof value === "string") {
    value = value.trim();
    value = value.replace(/\0/g, "");
  }
  return value;
};
