import { NextResponse } from "next/server";
import Razorpay from "razorpay";

// 1. TELL NEXT.JS TO NEVER BUILD THIS STATICALLY
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // 2. SAFETY CHECK: Do not run if keys are missing (Prevents Build Crash)
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn("Razorpay keys missing - Skipping payment init");
      return NextResponse.json({ error: "Payment system unavailable" }, { status: 500 });
    }

    // 3. Initialize Razorpay only when requested
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

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