import express from "express";
import {
  activateUser,
  loginUser,
  logoutUser,
  regenerateAccessToken,
  userInfo,
  userRegistration,
} from "../controller/user.controller";
import { isAuthenticated, userRole } from "../middleware/IsAuthenticate";
const userRoute = express.Router();

userRoute.post("/registration", userRegistration);
userRoute.post("/activate-user", activateUser);
userRoute.post("/login", loginUser);
userRoute.get("/logout", isAuthenticated, userRole("admin"), logoutUser);
userRoute.get("/refresh", regenerateAccessToken);
userRoute.get("/me", userInfo);

export default userRoute;
