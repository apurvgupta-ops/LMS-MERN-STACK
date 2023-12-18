import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import userModel, { IUser } from "../models/user.model";
import { NextFunction, Request, Response } from "express";
import { createActivationToken } from "../utils/createActivationToken";
import jwt, { Secret } from "jsonwebtoken";
import sendMails from "../utils/sendMails";
import ejs from "ejs";
import path from "path";

interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

interface IActivateUser {
  activation_token: string;
  activation_code: string;
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

export const activateUser = CatchAsyncError(
  async (res: Response, req: Request, next: NextFunction) => {
    try {
      const { activation_token, activation_code } = req.body as IActivateUser;

      const newUser: { user: IUser; activationCode: string } = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as string
      ) as { user: IUser; activationCode: string };

      if (newUser.activationCode !== activation_code) {
        return next(new ErrorHandler("Invalid Activation Code", 400));
      }

      const { name, email, password } = newUser.user;
      const alreadyExistedMail = await userModel.find({ email });
      if (alreadyExistedMail) {
        return next(new ErrorHandler("Email already exist", 400));
      }

      const user = await userModel.create({
        name,
        email,
        password,
      });

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
