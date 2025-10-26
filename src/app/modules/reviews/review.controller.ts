import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ReviewService } from "./review.service";

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

export const ReviewController = {
  createReview,
};
