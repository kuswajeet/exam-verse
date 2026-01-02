'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// This function was previously in a file that could not be resolved.
// Moving it here fixes the "Module not found" error.
function initializeFirebase() {
    const firebaseConfig = {
        apiKey: "AIzaSy...", 
        authDomain: "verse-exam-prep.firebaseapp.com",
        projectId: "verse-exam-prep",
        storageBucket: "verse-exam-prep.appspot.com",
        messagingSenderId: "SENDER_ID",
        appId: "APP_ID"
    };

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    
    return { firebaseApp: app, auth, firestore };
}


interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
