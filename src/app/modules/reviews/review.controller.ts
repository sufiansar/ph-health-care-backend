import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ReviewService } from "./review.service";
import pick from "../../helper/pick";
import { paginationableFields } from "../user/user.constent";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  console.log(user);
  const reviewData = req.body;
  const result = await ReviewService.createReview(user, reviewData);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review created Successfully!!!",
    data: result,
  });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["rating"]);
  const options = pick(req.query, paginationableFields);
  const user = req.user;
  const result = await ReviewService.getAllReviews(user, filters, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reviews retrieved Successfully!!!",
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getAllReviews,
};
