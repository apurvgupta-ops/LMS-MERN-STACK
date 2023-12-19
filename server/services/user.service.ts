import { Response } from "express";
import userModel from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";

export const getUserById = async (res: Response, id: string) => {
  const user = await userModel.findById(id);
  res.status(200).json({
    succes: true,
    user,
  });
};
