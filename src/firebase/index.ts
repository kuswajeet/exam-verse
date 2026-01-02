import { getApps, initializeApp, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, onSnapshot } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { useState, useEffect, useMemo } from "react";

// 1. Config (With Fallbacks from your screenshot to prevent "Invalid API Key" errors)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAa9Q9ugfETMSFnVX99sBcs1i25KEurzIk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-8465754929-f1e1f.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-8465754929-f1e1f",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-8465754929-f1e1f.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "738536341108",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:738536341108:web:b4f668c1c34dad9c5d9b21",
};

// 2. Initialize App (Singleton Pattern)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// 3. Export Initialization
export const initializeFirebase = () => app;

// --- CUSTOM HOOKS (ALL INCLUDED) ---

// Hook 1: useFirestore
export function useFirestore() {
  return db;
}

// Hook 2: useAuth (and useUser alias)
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { 
    user, 
    loading, 
    isUserLoading: loading 
  };
}
export const useUser = useAuth;

// Hook 3: useDoc (Single Document)
export function useDoc(docRef: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docRef) {
      setLoading(false);
      return;
    }
    
    try {
        const unsubscribe = onSnapshot(docRef, (snapshot: any) => {
          if (snapshot.exists()) {
            setData({ id: snapshot.id, ...snapshot.data() });
          } else {
            setData(null);
          }
          setLoading(false);
        });
        return () => unsubscribe();
    } catch (err) {
        console.error("useDoc Error:", err);
        setLoading(false);
    }
  }, [docRef?.path]);

  return { data, loading };
}

// Hook 4: useCollection (List of Documents) -> THIS WAS MISSING
export function useCollection(queryRef: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!queryRef) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onSnapshot(queryRef, (snapshot: any) => {
        const docs = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(docs);
        setLoading(false);
      }, (err: any) => {
        console.error("useCollection Error:", err);
        setError(err);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("useCollection Setup Error:", err);
      setError(err);
      setLoading(false);
    }
  }, [queryRef]);

  return { data, loading, error };
}

// Hook 5: useMemoFirebase
export function useMemoFirebase(factory: () => any, deps: any[]) {
  return useMemo(factory, deps);
}

// 4. Default Exports
export { app, auth, db, functions };