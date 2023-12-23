import jwt, { JwtPayload } from "jsonwebtoken";
import { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { redis } from "../utils/redis";
import { CatchAsyncError } from "./catchAsyncError";
import { NextFunction, Request, Response } from "express";

// *AUTHENTICATE THE USER
export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.access_Token || "";

    if (!accessToken) {
      return next(
        new ErrorHandler("You are not authorized to access this resouce", 400)
      );
    }

    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN as string
    ) as JwtPayload;

    if (!decoded) {
      return next(new ErrorHandler("Access token invalid", 400));
    }

    const user = await redis.get(decoded.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 400));
    }

    req.user = JSON.parse(user);

    next();
  }
);

// *VALIDATE THE USER ROLE
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (roles.includes(req.user?.role || "")) {
      return next(new ErrorHandler("You dont have access for this role", 403));
    }
    next();
  };
};
