import express from "express";
import { userRegistration } from "../controller/user.controller";
const userRoute = express.Router();

userRoute.post("/registration", userRegistration);

export default userRoute;
