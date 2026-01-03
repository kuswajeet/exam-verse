import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';

const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (!razorpayKeyId || !razorpayKeySecret) {
  console.warn('Razorpay keys are missing. Set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
}

const razorpay = new Razorpay({
  key_id: razorpayKeyId ?? '',
  key_secret: razorpayKeySecret ?? '',
});

export async function POST() {
  try {
    const order = await razorpay.orders.create({
      amount: 49900,
      currency: 'INR',
      receipt: `examverse-${Date.now()}`,
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error('Failed to create Razorpay order', error);
    return NextResponse.json({ error: 'Unable to create payment order' }, { status: 500 });
  }
}
