import { CatchAsyncError } from "../middleware/catchAsyncError";
import { Response, Request, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import CourseModel from "../models/course.model";
import cloudinary from "cloudinary";
import { createCourse, getAllCourseServices } from "../services/course.service";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import path from "path";
import ejs from "ejs";
import sendMails from "../utils/sendMails";
import NotificationModel from "../models/notification.model";

interface IAddQuestions {
  question: string;
  courseId: string;
  contentId: string;
}

interface IAddAnswer {
  answer: string;
  courseId: string;
  contentId: string;
  questionId: string;
}

interface IAddReview {
  rating: number;
  userId: string;
  review: string;
}

interface IAddReviewReply {
  comment: string;
  courseId: string;
  reviewId: string;
}

export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;

      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      createCourse(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const editCourseById = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      const courseId = req.params.id;

      if (thumbnail) {
        await cloudinary.v2.uploader.destroy(thumbnail);

        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const course = await CourseModel.findByIdAndUpdate(
        courseId,
        {
          $set: data,
        },
        {
          new: true,
        }
      );

      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// *SINGLE COURSE WITHOUT PURCHASE
export const getSingleCourseById = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;

      const isCacheDataExist = await redis.get(courseId);

      if (isCacheDataExist) {
        const course = JSON.parse(isCacheDataExist);
        res.status(200).json({
          success: true,
          course,
        });
      } else {
        const course = await CourseModel.findById(courseId).select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );

        await redis.set(courseId, JSON.stringify(course));

        res.status(200).json({
          success: true,
          course,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// *ALL COURSES WITHOUT PURCHASE
export const getAllCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isCacheDataExist = await redis.get("allCourses");

      if (isCacheDataExist) {
        const courses = JSON.parse(isCacheDataExist);
        res.status(200).json({
          success: true,
          courses,
        });
      } else {
        const courses = await CourseModel.find().select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );

        await redis.set("allCourses", JSON.stringify(courses));

        res.status(200).json({
          success: true,
          courses,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// *GET COURSES FOR THE USER
export const getUserCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;
      const courseId = req.params.id;

      const courseExist = userCourseList?.find(
        (course: any) => course._id.toString() === courseId
      );

      if (!courseExist) {
        return next(
          new ErrorHandler("You are not eligible to access this cousrse", 400)
        );
      }
      const course = await CourseModel.findById(courseId);

      const courseContent = course?.courseData;

      res.status(200).json({
        success: true,
        courseContent,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// *ADD QUESTIONS IN THE COURSES
export const addQuestions = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, contentId, courseId } = req.body as IAddQuestions;
      const course = await CourseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler(" Invalid Content id", 400));
      }

      const courseContent = course?.courseData?.find((item: any) =>
        item._id.equals(contentId)
      );
      if (!courseContent) {
        return next(new ErrorHandler(" Invalid Content id", 400));
      }

      const newQuestions: any = {
        user: req.user,
        question,
        questionsReplies: [],
      };

      await NotificationModel.create({
        user: req.user?._id,
        title: "New Question Added",
        message: `You have a new question in ${courseContent?.title}`,
      });

      courseContent.question.push(newQuestions);
      await course?.save();

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// *ADD ANSWERS TO PERTICULAR QUESTIONS
export const addAnswers = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, courseId, contentId, questionId } =
        req.body as IAddAnswer;

      const course = await CourseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler(" Invalid Content id", 400));
      }

      const courseContent = course?.courseData?.find((item: any) =>
        item._id.equals(contentId)
      );
      if (!courseContent) {
        return next(new ErrorHandler(" Invalid Content id", 400));
      }

      const question = courseContent?.question?.find((item: any) =>
        item._id.equals(questionId)
      );

      if (!question) {
        return next(new ErrorHandler(" Invalid Question id", 400));
      }

      const newAnswer: any = {
        user: req.user,
        answer,
      };

      question.questionReplies.push(newAnswer);
      await course?.save();

      // * CREATE NOTIFICATION
      if (req.user?._id === question.user._id) {
        await NotificationModel.create({
          user: req.user?._id,
          title: "New Answer Added",
          message: `You have a new answer in ${courseContent?.title}`,
        });
      } else {
        const data = {
          name: question.user.name,
          title: courseContent.title,
        };

        const html = await ejs.renderFile(
          path.join(__dirname, "../mails/answer.ejs"),
          data
        );

        try {
          await sendMails({
            email: question.user.email,
            subject: "Question Reply",
            template: "answer.ejs",
            data,
          });
        } catch (error: any) {
          return next(new ErrorHandler(error.message, 500));
        }
      }

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// *ADD REVIEW TO PERTICULAR COURSE
export const addReviews = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;
      const courseId = req.params.id;

      const courseExist = userCourseList?.some(
        (course: any) => course._id.toString() === courseId.toString()
      );

      if (!courseExist) {
        return next(
          new ErrorHandler("You are not eligible for this course", 404)
        );
      }

      const course = await CourseModel.findById(courseId);

      const { rating, review } = req.body as IAddReview;

      const reviewData: any = {
        user: req.user,
        rating,
        comment: review,
      };

      course?.reviews?.push(reviewData);

      let avgRating = 0;
      course?.reviews.forEach((rev: any) => {
        avgRating += rev.rating;
      });

      if (course) {
        course.ratings = avgRating / course.reviews.length;
      }

      await course?.save();

      const notification = {
        title: "New Review Added",
        message: `${req.user?.name} has given a review in ${course?.name}`,
      };

      // TODO: CREATE NOTIFICATION

      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// *ADD REVIEW REPLY TO PERTICULAR COURSE
export const addReviewReply = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, courseId, reviewId } = req.body as IAddReviewReply;

      const course = await CourseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Course not found", 400));
      }

      const review = await course?.reviews?.find((rev: any) => {
        rev._id.toString() === reviewId;
      });

      if (!review) {
        return next(new ErrorHandler("Review not found", 400));
      }

      const replyData: any = {
        user: req.user,
        comment,
      };

      if (!review?.commentReplies) {
        review.commentReplies = [];
      }
      review?.commentReplies?.push(replyData);

      await course?.save();

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// *GET ALL COURSES ---FOR ADMIN
export const getAllCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllCourseServices(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// *DELETE COURSE BY ID
export const deleteCourseById = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.body;
      const course = await CourseModel.findById(id);

      if (!course) {
        return next(new ErrorHandler("Course Not found", 400));
      }

      await course.deleteOne({ id });
      await redis.del(id);

      res.status(200).json({
        success: true,
        message: "Course deleted sucessfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
