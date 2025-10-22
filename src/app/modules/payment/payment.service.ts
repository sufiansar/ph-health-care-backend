import Stripe from "stripe";
import { stripe } from "../../helper/stripe";
import config from "../../../config";
import { prisma } from "../../shared/prisma";
import { PaymentStatus, Prisma } from "@prisma/client";

const handleWebhook = async (signature: string, body: Buffer) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      config.stripe.stripe_webhook_secret as string
    );
  } catch (err: any) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  // Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const appointmentId = session.metadata?.appointmentId;
    const transactionId = session.metadata?.transactionId;
    const paymentId = session.metadata?.paymentId;

    if (!appointmentId || !transactionId) {
      throw new Error("Missing metadata in Stripe session");
    }

    console.log("✅ Payment success for Appointment:", appointmentId);

    await prisma.$transaction(async (tx) => {
      await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          paymentStatus:
            session.payment_status === "paid"
              ? PaymentStatus.PAID
              : PaymentStatus.UNPAID,
        },
      });
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status:
            session.payment_status === "paid"
              ? PaymentStatus.PAID
              : PaymentStatus.UNPAID,
          paymentGatewayData: JSON.parse(
            JSON.stringify(session)
          ) as Prisma.InputJsonValue,
        },
      });
    });

    return { message: "Payment confirmed", appointmentId };
  }

  return { message: `Unhandled event type: ${event.type}` };
};

export const PaymentService = {
  handleWebhook,
};
