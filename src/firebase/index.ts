'use client';

// 1. Import the initialized services from our Config file
// This prevents "Firebase App already exists" errors
import { auth, db, app } from './config';

// 2. Import your custom hooks
import { useCollection } from '@/firebase/firestore/use-collection';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useUser } from '@/firebase/provider';

// 3. Helper function (Kept for compatibility with your existing code)
// Instead of creating a NEW app, it just returns the one we already created.
const initializeFirebase = () => {
  return { firebaseApp: app, auth, firestore: db };
};

// 4. Export everything
export {
  auth,
  db,
  useCollection,
  useDoc,
  useUser,
  initializeFirebase,
};