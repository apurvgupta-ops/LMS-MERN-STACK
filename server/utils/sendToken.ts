require("dotenv").config();
import { Response } from "express";
import { IUser } from "../models/user.model";
import { redis } from "./redis";

interface ITokenOptions {
  expire: Date;
  maxAge: number;
  httpOnly: boolean;
  secure?: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
}

export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  // *GET ACCESS TOKEN AND REFRESH TOKEN
  const accessToken = user.SignInAccessToken();
  const refreshToken = user.SignInRefreshToken();

  // *UPLOAD SESSION TO REDIS
  redis.set(user._id, JSON.stringify(user) as any);

  // *PARSE ENV VARIABLES TO INTEGRATE WITH THE FALLBACK VALUES
  const accessTokenExpiry = parseInt(
    process.env.ACCESS_TOKEN_EXPIRY || "300",
    10
  );
  const refreshTokenExpiry = parseInt(
    process.env.REFRESH_TOKEN_EXPIRY || "300",
    10
  );

  // *SET THE COOKIES
  const accessTokenOptions: ITokenOptions = {
    expire: new Date(Date.now() + accessTokenExpiry * 1000),
    maxAge: accessTokenExpiry * 1000,
    httpOnly: true,
    sameSite: "lax",
  };

  const refreshTokenOptions: ITokenOptions = {
    expire: new Date(Date.now() + refreshTokenExpiry * 1000),
    maxAge: refreshTokenExpiry * 1000,
    httpOnly: true,
    sameSite: "lax",
  };

  // *ONLY SET SECURE TO TURE IN PRODUCTION
  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
  }

  // *SET COOKIES
  res.cookie("access_Token", accessToken, accessTokenOptions);
  res.cookie("refresh_Token", refreshToken, refreshTokenOptions);
  console.log(accessToken);

  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
  });
};
