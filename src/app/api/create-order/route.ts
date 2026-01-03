import { NextResponse } from "next/server";
import Razorpay from "razorpay";

// 1. Force Dynamic Mode
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // 2. USE PLACEHOLDER KEYS TO PREVENT BUILD CRASH
    // This ensures Vercel can build the app even without the real keys.
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_PLACEHOLDER",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "secret_PLACEHOLDER",
    });

    // 3. Runtime Check: Stop if real keys are missing during actual payment
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      console.error("Razorpay Error: Real keys are missing!");
      return NextResponse.json({ error: "Payment configuration missing" }, { status: 500 });
    }

    const order = await razorpay.orders.create({
      amount: 49900, 
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7),
    });

    return NextResponse.json({ orderId: order.id }, { status: 200 });

  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}