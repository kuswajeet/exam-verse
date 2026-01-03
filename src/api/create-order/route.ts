import { NextResponse } from "next/server";
import Razorpay from "razorpay";

// 1. Force this route to be dynamic (never static)
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // 2. SAFETY TRICK:
    // If the real keys are missing (like during the Vercel build),
    // we use fake "placeholder" text. This prevents the "key_id mandatory" crash.
    // When the app runs live, it will use the real process.env keys.
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder_123",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "secret_placeholder_123",
    });

    // 3. REAL CHECK:
    // If we are actually trying to pay (Runtime) and keys are still missing, THEN we stop.
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      console.error("Razorpay Error: Real keys are missing in Vercel Settings!");
      return NextResponse.json({ error: "Payment configuration missing" }, { status: 500 });
    }

    const order = await razorpay.orders.create({
      amount: 49900, // Amount in paise (49900 = ₹499.00)
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7),
    });

    return NextResponse.json({ orderId: order.id }, { status: 200 });

  } catch (error: any) {
    console.error("Error creating order:", error);
    // Handle the specific error if the placeholder keys are used to try a real payment
    return NextResponse.json(
      { error: error.message || "Error creating order" },
      { status: 500 }
    );
  }
}