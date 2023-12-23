require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoute from "./routes/user.route";
import courseRoute from "./routes/course.route";

export const app = express();

// *BODY PARSER
app.use(express.json({ limit: "50mb" }));

// *COOKIE PARSER
app.use(cookieParser());

// *CORS
app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);

// * MAIN ROUTES
app.use("/api/v1", userRoute);
app.use("/api/v1", courseRoute);

// *TESTING API
app.use("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "Api is working",
  });
});

// *OTHER ROUTES (this is for routes not available )
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});
