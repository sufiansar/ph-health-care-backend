import { NextFunction, Request, Response } from "express";
import { jwtHelpers } from "../helper/jwtHelper";
import config from "../../config";

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.accessToken;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access. Token missing.",
        });
      }

      const decoded = jwtHelpers.verifyToken(
        token,
        config.jwt.accessToken_secret!
      );
      console.log(decoded);
      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient role permissions.",
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }
  };
};

export default auth;
