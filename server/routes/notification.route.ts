import express from "express";
import {
  getNotification,
  updateNotification,
} from "../controller/notification.controller";
import { isAuthenticated, authorizeRoles } from "../middleware/IsAuthenticate";
const notificationRoute = express.Router();

notificationRoute.get(
  "/get-all-notification",
  isAuthenticated,
  authorizeRoles("admin"),
  getNotification
);

notificationRoute.put(
  "/update-notification",
  isAuthenticated,
  authorizeRoles("admin"),
  updateNotification
);

export default notificationRoute;
