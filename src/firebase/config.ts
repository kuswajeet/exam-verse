import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock_key_for_build",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock_domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock_project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock_bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "mock_sender",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "mock_app_id",
};

// --- TRUTH SERUM: DEBUG LOGS ---
// This will print to your browser console so we can see the real values.
if (typeof window !== "undefined") {
  console.log("🔥 FIREBASE DEBUG:");
  console.log("1. API Key Status:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "EXISTS ✅" : "MISSING ❌");
  console.log("2. Actual Value Used:", firebaseConfig.apiKey); 
}
// -------------------------------

// Initialize Firebase (Singleton Pattern)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, app };