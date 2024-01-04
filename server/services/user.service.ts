import { Response } from "express";
import UserModel from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { redis } from "../utils/redis";

export const getUserById = async (res: Response, id: string) => {
  const userJson = await redis.get(id);
  if (userJson) {
    const user = JSON.parse(userJson);
    res.status(200).json({
      succes: true,
      user,
    });
  }
};

export const getAllUserServices = async (res: Response) => {
  const users = await UserModel.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    users,
  });
};

// * UPDATE USER ROLE

export const updateUserRole = async (
  res: Response,
  id: String,
  role: String
) => {
  const user = await UserModel.findByIdAndUpdate(id, { role }, { new: true });

  res.status(201).json({
    success: true,
    user,
  });
};
