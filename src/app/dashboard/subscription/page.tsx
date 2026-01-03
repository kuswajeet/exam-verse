"use client";

import { useState } from "react";
import Script from "next/script";
import { useAuth } from "@/hooks/use-auth"; // Adjust import path if needed (e.g. "@/components/auth-provider")
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Loader2, Check, ShieldCheck } from "lucide-react";

// Tell TypeScript that Razorpay exists on the window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!user) return alert("Please log in to upgrade.");
    setLoading(true);

    try {
      // 1. Create Order on Backend
      const res = await fetch("/api/create-order", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to initiate payment");

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: 49900, // ₹499
        currency: "INR",
        name: "Exam Verse Pro",
        description: "Lifetime Access to Premium Features",
        order_id: data.orderId,
        handler: async function (response: any) {
           // 3. On Success: Update User Role in Firebase
           try {
             const userRef = doc(db, "users", user.uid);
             await updateDoc(userRef, {
               role: "pro",
               plan: "premium",
               subscriptionDate: new Date().toISOString()
             });
             alert("Payment Successful! Welcome to Pro.");
             window.location.reload();
           } catch (dbError) {
             console.error("Payment succeeded but DB update failed:", dbError);
             alert("Payment successful. Please contact support if Pro access isn't active.");
           }
        },
        prefill: {
          name: user.displayName || "",
          email: user.email || "",
          contact: "" // Optional
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error("Payment Error:", error);
      alert("Payment Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Load Razorpay SDK */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Choose Your Plan</h1>
          <p className="text-muted-foreground">
            Unlock your full potential with Exam Verse Pro.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-8">
          {/* Free Plan */}
          <div className="border rounded-xl p-8 shadow-sm bg-card flex flex-col">
            <h3 className="text-xl font-semibold">Free Plan</h3>
            <div className="mt-4 text-4xl font-bold">₹0</div>
            <p className="text-muted-foreground mt-2">Forever free</p>
            
            <ul className="mt-8 space-y-4 flex-1">
              <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500"/> Access to 3 Mock Tests</li>
              <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500"/> Basic Performance Analytics</li>
              <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500"/> Community Leaderboard</li>
            </ul>
            
            <button disabled className="w-full mt-8 bg-secondary text-secondary-foreground py-3 rounded-lg font-medium opacity-50 cursor-not-allowed">
              Current Plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-primary rounded-xl p-8 shadow-xl bg-card relative flex flex-col transform scale-105">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-bold rounded-bl-xl rounded-tr-lg">
              BEST VALUE
            </div>
            
            <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5"/> Pro Plan
            </h3>
            <div className="mt-4 text-4xl font-bold">₹499</div>
            <p className="text-muted-foreground mt-2">One-time payment</p>

            <ul className="mt-8 space-y-4 flex-1">
              <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary"/> Unlimited Mock Tests</li>
              <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary"/> Advanced AI Analytics</li>
              <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary"/> Detailed Solution Explanations</li>
              <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary"/> Priority Support</li>
            </ul>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full mt-8 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-bold text-lg transition-all shadow-md hover:shadow-lg flex justify-center items-center"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              {loading ? "Processing..." : "Upgrade Now"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}