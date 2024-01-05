import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import UserModel, { IUser } from "../models/user.model";
import { NextFunction, Request, Response } from "express";
import { createActivationToken } from "../utils/createActivationToken";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import sendMails from "../utils/sendMails";
import ejs from "ejs";
import path from "path";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/sendToken";
import { redis } from "../utils/redis";
import cloudinary from "cloudinary";
import {
  getAllUserServices,
  getUserById,
  updateUserRole,
} from "../services/user.service";

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

interface IloginUser {
  email: string;
  password: string;
}

interface ISocialAuth {
  name: string;
  email: string;
  avatar: string;
}

interface IUpdateUser {
  name?: string;
  email?: string;
}

interface IUpdatePassword {
  oldPassword: string;
  newPassword: string;
}

interface IUpdateAvatar {
  avatar: string;
}

export const userRegistration = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name } = req.body;
      const isEmailExists = await UserModel.findOne({ email });
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
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.body);
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
      const alreadyExistedMail = await UserModel.findOne({ email });
      // console.log(email);
      if (alreadyExistedMail) {
        return next(new ErrorHandler("Email already exist", 400));
      }

      const user = await UserModel.create({
        name,
        email,
        password,
      });

      res.status(201).json({
        success: true,
        // user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const loginUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as IloginUser;

      if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password", 400));
      }
      const user = await UserModel.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("Invalid email and password", 400));
      }

      const passwordMatch = await user.comparePassword(password);

      if (!passwordMatch) {
        return next(new ErrorHandler("Invalid email and password", 400));
      }

      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const logoutUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("access_Token", "", { maxAge: 1 });
      res.cookie("refresh_Token", "", { maxAge: 1 });

      // *CLEAR THE CACHE FORM REDIS
      const userId = req.user?._id || "";

      redis.del(userId);
      res.status(200).json({
        success: true,
        message: "User logged out successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const regenerateAccessToken = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const oldRefreshToken = req.cookies.refresh_Token as string;

      const decoded = jwt.verify(
        oldRefreshToken,
        process.env.REFRESH_TOKEN as string
      ) as JwtPayload;

      if (!decoded) {
        return next(new ErrorHandler("No refresh token", 400));
      }

      const session = await redis.get(decoded.id as string);

      if (!session) {
        return next(
          new ErrorHandler("Please login to access this resource", 400)
        );
      }

      const user = JSON.parse(session);

      const accessToken = jwt.sign(
        { id: user?._id },
        process.env.ACCESS_TOKEN as string,
        { expiresIn: "5m" }
      );

      const refreshToken = jwt.sign(
        { id: user?._id },
        process.env.REFRESH_TOKEN as string,
        { expiresIn: "5m" }
      );
      // *SET USER
      req.user = user;

      // *SET COOKIES
      res.cookie("access_Token", accessToken, accessTokenOptions);
      res.cookie("refresh_Token", refreshToken, refreshTokenOptions);
      await redis.set(user._id, JSON.stringify(user), "EX", 604800); // 7 DAYS
      console.log(accessToken);

      res.status(200).json({
        success: true,
        accessToken,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const socialAuth = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, avatar } = req.body as ISocialAuth;

      const user = await UserModel.findOne({ email });
      if (!user) {
        const newUser = await UserModel.create({ name, email, avatar });
        sendToken(newUser, 200, res);
      } else {
        sendToken(user, 200, res);
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const userInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      getUserById(res, userId);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const updateUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name } = req.body as IUpdateUser;
      const userId = req.user?._id;
      const user = await UserModel.findById(userId);

      if (email && user) {
        const isEmailExist = await UserModel.findOne({ email });
        if (isEmailExist) {
          return next(new ErrorHandler("Email already Exist", 400));
        }
        user.email = email;
      }

      if (name && user) {
        user.name = name;
      }

      await user?.save();

      await redis.set(userId, JSON.stringify(user));

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const updatePassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body as IUpdatePassword;
      const userId = req.user?._id;
      const user = await UserModel.findById(userId).select("+password");
      if (!oldPassword && !newPassword) {
        return next(
          new ErrorHandler("Please provide old and new password", 400)
        );
      }

      const isPasswordMatch = await user?.comparePassword(oldPassword);
      if (!isPasswordMatch) {
        return next(
          new ErrorHandler("Invalid User, Old password is not match", 400)
        );
      }

      if (user?.password === undefined) {
        return next(new ErrorHandler("Invalid User", 400));
      }

      user.password = newPassword;

      await user?.save();
      await redis.set(req.user?.id, JSON.stringify(user));

      res.status(201).json({
        success: true,
        message: "Password update successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// *IMAGE SHOULD BE BASE64
export const updateAvatar = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { avatar } = req.body as IUpdateAvatar;
      const userId = req.user?._id;

      const user = await UserModel.findById(userId);

      if (avatar && user) {
        if (user?.avatar?.public_id) {
          await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);
          const newAvatar = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatars",
            width: 150,
          });

          user.avatar = {
            public_id: newAvatar.public_id,
            url: newAvatar.secure_url,
          };
        } else {
          const newAvatar = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatar",
            width: 150,
          });

          user.avatar = {
            public_id: newAvatar.public_id,
            url: newAvatar.secure_url,
          };
        }
      }

      await user?.save();

      await redis.set(userId, JSON.stringify(user));

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// *GET ALL USER ---FOR ADMIN
export const getAllUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllUserServices(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// * UPDATE USER ROLE
export const updateUserRoleInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, role } = req.body;
      updateUserRole(res, id, role);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// * DELETE USER
export const deleteUserById = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);

      if (!user) {
        return next(new ErrorHandler("User not found", 400));
      }
      await UserModel.deleteOne({ id });
      await redis.del(id);

      res.status(201).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
