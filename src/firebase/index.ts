import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- PASTE YOUR REAL FIREBASE KEYS HERE ---
const firebaseConfig = {
  apiKey: "AIzaSyAa9Q9ugfETMSFnVX99sBcs1i25KEurzIk", // <--- YOUR REAL KEY
  authDomain: "verse-exam-prep.firebaseapp.com",
  projectId: "verse-exam-prep",
  storageBucket: "verse-exam-prep.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Initialize App (Singleton)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// EXPORT THE SERVICES (This fixes the error)
export const auth = getAuth(app);
export const db = getFirestore(app);