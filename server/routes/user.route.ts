import express from "express";
import {
  activateUser,
  loginUser,
  logoutUser,
  userRegistration,
} from "../controller/user.controller";
import { isAuthenticated } from "../middleware/IsAuthenticate";
const userRoute = express.Router();

userRoute.post("/registration", userRegistration);
userRoute.post("/activate-user", activateUser);
userRoute.post("/login", loginUser);
userRoute.get("/logout", isAuthenticated, logoutUser);

export default userRoute;
