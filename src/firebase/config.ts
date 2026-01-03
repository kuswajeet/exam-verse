import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// DIRECT KEY INJECTION (Bypassing Vercel Env Vars)
const firebaseConfig = {
  apiKey: "AIzaSyAa9Q9ugfETMSFnVX99sBcs1i25KEurzIk",
  authDomain: "studio-8465754929-f1e1f.firebaseapp.com",
  projectId: "studio-8465754929-f1e1f",
  storageBucket: "studio-8465754929-f1e1f.firebasestorage.app",
  messagingSenderId: "738536341108",
  appId: "1:738536341108:web:b4f668c1c34dad9c5d9b21"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export everything including the config
export { auth, db, app, firebaseConfig };