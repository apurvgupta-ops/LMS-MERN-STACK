import express from "express";
import {
  addAnswers,
  addQuestions,
  addReviewReply,
  addReviews,
  editCourseById,
  getAllCourses,
  getSingleCourseById,
  getUserCourses,
  uploadCourse,
} from "../controller/course.controller";
import { isAuthenticated, authorizeRoles } from "../middleware/IsAuthenticate";
const courseRoute = express.Router();

courseRoute.post(
  "/create-course",
  isAuthenticated,
  authorizeRoles("admin"),
  uploadCourse
);

courseRoute.put(
  "/edit-course/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  editCourseById
);
courseRoute.get("/get-course/:id", getSingleCourseById);
courseRoute.get("/get-all-courses", getAllCourses);
courseRoute.get("/get-course-content/:id", isAuthenticated, getUserCourses);
courseRoute.get("/add-questions", isAuthenticated, addQuestions);

courseRoute.put("/add-answers", isAuthenticated, addAnswers);
courseRoute.put("/add-review", isAuthenticated, addReviews);
courseRoute.put(
  "/add-review-reply",
  isAuthenticated,
  authorizeRoles("admin"),
  addReviewReply
);

export default courseRoute;
