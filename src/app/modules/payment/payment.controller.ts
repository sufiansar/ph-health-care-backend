import { Request, Response } from "express";
import { PaymentService } from "./payment.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;

  if (!signature) {
    return res
      .status(400)
      .json({ success: false, message: "Missing Stripe signature" });
  }

  const result = await PaymentService.handleWebhook(signature, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Webhook processed successfully",
    data: result,
  });
});

export const PaymentController = {
  handleWebhook,
};
