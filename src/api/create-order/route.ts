import { NextResponse } from "next/server";
import Razorpay from "razorpay";

// 1. Force Dynamic Mode
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // 2. Initialize Razorpay with a FALLBACK for build time
    // If keys are missing (during build), use "dummy_key" so it doesn't crash.
    // When running live, it will use the real process.env keys.
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_12345678901234",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret_for_build",
    });

    // 3. Runtime Check: If we are actually trying to pay but keys are dummy, stop.
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
       return NextResponse.json({ error: "Payment config missing" }, { status: 500 });
    }

    const order = await razorpay.orders.create({
      amount: 49900, // Amount in paise (49900 = ₹499.00)
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7),
    });

    return NextResponse.json({ orderId: order.id }, { status: 200 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Error creating order" },
      { status: 500 }
    );
  }
}