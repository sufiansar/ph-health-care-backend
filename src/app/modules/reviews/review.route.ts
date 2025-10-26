import { Router } from "express";

import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { ReviewController } from "./review.controller";

const router = Router();

// router.get("/my-reviews", ReviewController.getMyReviews);
router.post("/", auth(UserRole.PATIENT), ReviewController.createReview);

export const ReviewRoutes = router;
