import express from "express";
import { createOrder, getAllOrder } from "../controller/order.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/IsAuthenticate";
const orderRoute = express.Router();

orderRoute.post("/create-order", isAuthenticated, createOrder);
orderRoute.get(
  "/get-all-orders",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllOrder
);
export default orderRoute;
