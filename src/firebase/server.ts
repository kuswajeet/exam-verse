import { initializeApp, getApp, getApps, type FirebaseOptions } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const firebaseConfig: FirebaseOptions = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

function initializeFirebaseAdmin() {
  if (!getApps().length) {
    return initializeApp({
        credential: {
            projectId: firebaseConfig.projectId,
            clientEmail: firebaseConfig.clientEmail,
            privateKey: firebaseConfig.privateKey
        }
    });
  }
  return getApp();
}

export function getSdks() {
    const app = initializeFirebaseAdmin();
    return {
        auth: getAuth(app),
        firestore: getFirestore(app),
    }
}
