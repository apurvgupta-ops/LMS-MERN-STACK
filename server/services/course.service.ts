import { CatchAsyncError } from "../middleware/catchAsyncError";
import { Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import CourseModel from "../models/course.model";

// *CREATE COURSE
export const createCourse = CatchAsyncError(
  async (data: any, res: Response) => {
    const course = await CourseModel.create(data);

    res.status(201).json({
      success: true,
      course,
    });
  }
);
