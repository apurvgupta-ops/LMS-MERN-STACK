import express from "express";
import {
  createLayout,
  editLayout,
  getLayout,
} from "../controller/layout.controller";
import { isAuthenticated, authorizeRoles } from "../middleware/IsAuthenticate";
const layoutRoute = express.Router();

layoutRoute.get("/get-layout", getLayout);

layoutRoute.post(
  "/create-layout",
  isAuthenticated,
  authorizeRoles("admin"),
  createLayout
);

layoutRoute.put(
  "/edit-layout",
  isAuthenticated,
  authorizeRoles("admin"),
  editLayout
);

export default layoutRoute;
