import express from "express";
import {
  coursesAnalyticsData,
  orderAnalyticsData,
  userAnalyticsData,
} from "../controller/analytics.controller";
import { isAuthenticated, authorizeRoles } from "../middleware/IsAuthenticate";
const analyticsRoute = express.Router();

analyticsRoute.get(
  "/get-user-analytic-data",
  isAuthenticated,
  authorizeRoles("admin"),
  userAnalyticsData
);

analyticsRoute.get(
  "/get-courses-analytic-data",
  isAuthenticated,
  authorizeRoles("admin"),
  coursesAnalyticsData
);

analyticsRoute.get(
  "/get-order-analytic-data",
  isAuthenticated,
  authorizeRoles("admin"),
  orderAnalyticsData
);

export default analyticsRoute;
