import express from "express";
import {
  activateUser,
  loginUser,
  logoutUser,
  regenerateAccessToken,
  socialAuth,
  updateAvatar,
  updatePassword,
  updateUserInfo,
  userInfo,
  userRegistration,
} from "../controller/user.controller";
import { isAuthenticated } from "../middleware/IsAuthenticate";
const userRoute = express.Router();

userRoute.post("/registration", userRegistration);
userRoute.post("/activate-user", activateUser);
userRoute.post("/login", loginUser);
userRoute.post("/social", socialAuth);

userRoute.get("/logout", isAuthenticated, logoutUser);
userRoute.get("/refresh", regenerateAccessToken);
userRoute.get("/me", isAuthenticated, userInfo);

userRoute.put("/update-user", isAuthenticated, updateUserInfo);
userRoute.put("/update-user-password", isAuthenticated, updatePassword);
userRoute.put("/update-user-avatar", isAuthenticated, updateAvatar);

export default userRoute;
