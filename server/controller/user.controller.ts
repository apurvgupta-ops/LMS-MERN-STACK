import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import userModel from "../models/user.model";
import { NextFunction, Request, Response } from "express";
import { createActivationToken } from "../utils/createActivationToken";
import sendMails from "../utils/sendMails";
import ejs from "ejs";
import path from "path";

interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export const userRegistration = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name } = req.body;
      const isEmailExists = await userModel.findOne({ email });
      if (isEmailExists) {
        return next(new ErrorHandler("Email already exist", 400));
      }

      const user: IRegisterUser = {
        name,
        email,
        password,
      };

      const activationToken = createActivationToken(user);
      const activationCode = activationToken.activationCode;
      const data = {
        user: { name: user.name, email: user.email },
        activationCode,
      };
      const sendEmailTemplate = await ejs.renderFile(
        path.join(__dirname, "../mails/template.ejs"),
        data
      );

      try {
        await sendMails({
          email: user.email,
          subject: "Account Activation",
          template: sendEmailTemplate,
          data,
        });

        res.status(201).json({
          success: true,
          message: `Please check your mail ${user.email} to activate your account`,
          activationCode: activationToken.token,
        });
      } catch (error: any) {
        return next(new ErrorHandler("Error in sending the mail", 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
