import express from "express";
import {
  activateUser,
  loginUser,
  userRegistration,
} from "../controller/user.controller";
const userRoute = express.Router();

userRoute.post("/registration", userRegistration);
userRoute.post("/activate-user", activateUser);
userRoute.post("/login", loginUser);

export default userRoute;
