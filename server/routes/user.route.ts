import express from "express";
import {
  activateUser,
  loginUser,
  logoutUser,
  regenerateAccessToken,
  socialAuth,
  userInfo,
  userRegistration,
} from "../controller/user.controller";
import { isAuthenticated, userRole } from "../middleware/IsAuthenticate";
const userRoute = express.Router();

userRoute.post("/registration", userRegistration);
userRoute.post("/activate-user", activateUser);
userRoute.post("/login", loginUser);
userRoute.post("/social", socialAuth);

userRoute.get("/logout", isAuthenticated, logoutUser);
userRoute.get("/refresh", regenerateAccessToken);
userRoute.get("/me", isAuthenticated, userInfo);

export default userRoute;
