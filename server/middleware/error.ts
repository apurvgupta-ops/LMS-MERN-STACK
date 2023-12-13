import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";

export const ErrorMiddleWare = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.messgae = err.message || "Internal Server Error";

  // * WRONG MONGOD ID ERROR
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // *DUPLICATE KEY ERROR
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }

  // *WRONG JWT TOKEN
  if (err.name === "JsonWebTokenError") {
    const message = `Invalid Json Token , Try Again`;
    err = new ErrorHandler(message, 400);
  }

  // *TOKEN EXPIRED
  if (err.name === "TokenExpiredError") {
    const message = `Token Expired, Try Again`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
