import express from "express";
import { activateUser, userRegistration } from "../controller/user.controller";
const userRoute = express.Router();

userRoute.post("/registration", userRegistration);
userRoute.post("/activate-user", activateUser);

export default userRoute;
