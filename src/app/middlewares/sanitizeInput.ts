// import { NextFunction, Request, Response } from "express";

// /**
//  * Middleware to trim string inputs and remove potentially harmful characters
//  */
// export const sanitizeInput = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   // Sanitize body
//   if (req.body) {
//     req.body = sanitizeObject(req.body);
//   }

//   // Sanitize query
//   if (req.query) {
//     const sanitizedQuery = sanitizeObject(req.query);
//     Object.assign(req.query, sanitizedQuery);
//   }

//   // Sanitize params
//   if (req.params) {
//     const sanitizedParams = sanitizeObject(req.params);
//     Object.assign(req.params, sanitizedParams);
//   }

//   next();
// };

// const sanitizeObject = (obj: any): any => {
//   // Not an object → sanitize value only
//   if (obj === null || obj === undefined || typeof obj !== "object") {
//     return sanitizeValue(obj);
//   }

//   // Array → sanitize each item
//   if (Array.isArray(obj)) {
//     return obj.map((item) => sanitizeObject(item));
//   }

//   // Plain object → recursively sanitize
//   const sanitized: any = {};
//   for (const key in obj) {
//     if (Object.prototype.hasOwnProperty.call(obj, key)) {
//       sanitized[key] = sanitizeObject(obj[key]);
//     }
//   }
//   return sanitized;
// };

// const sanitizeValue = (value: any): any => {
//   if (typeof value === "string") {
//     value = value.trim();
//     value = value.replace(/\0/g, ""); // removes null bytes
//   }
//   return value;
// };
