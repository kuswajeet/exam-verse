import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// This file uses the main config from firebase/index.ts
// to avoid conflicts. It re-exports the initialized services.

// HARDCODED CONFIGURATION (To fix invalid-api-key error)
const firebaseConfig = {
    apiKey: "AIzaSyAa9Q9ugfETMSFnVX99sBcs1i25KEurzIk",
    authDomain: "verse-exam-prep.firebaseapp.com",
    projectId: "verse-exam-prep",
    storageBucket: "verse-exam-prep.appspot.com",
    messagingSenderId: "738536341108",
    appId: "1:738536341108:web:b4f668c1c34dad9c5d9b21"
};

// Initialize App (Singleton)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
