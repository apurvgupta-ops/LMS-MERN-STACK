import express from "express";
import {
  activateUser,
  deleteUserById,
  getAllUser,
  loginUser,
  logoutUser,
  regenerateAccessToken,
  socialAuth,
  updateAvatar,
  updatePassword,
  updateUserInfo,
  updateUserRoleInfo,
  userInfo,
  userRegistration,
} from "../controller/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/IsAuthenticate";
const userRoute = express.Router();

userRoute.post("/registration", userRegistration);
userRoute.post("/activate-user", activateUser);
userRoute.post("/login", loginUser);
userRoute.post("/social", socialAuth);

userRoute.get("/logout", isAuthenticated, logoutUser);
userRoute.get("/refresh", regenerateAccessToken);
userRoute.get("/me", isAuthenticated, userInfo);
userRoute.get(
  "/get-all-user",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllUser
);

userRoute.put("/update-user", isAuthenticated, updateUserInfo);
userRoute.put("/update-user-password", isAuthenticated, updatePassword);
userRoute.put("/update-user-avatar", isAuthenticated, updateAvatar);
userRoute.put(
  "/update-user-role",
  isAuthenticated,
  authorizeRoles("admin"),
  updateUserRoleInfo
);

userRoute.delete(
  "/delete-user/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteUserById
);

export default userRoute;
