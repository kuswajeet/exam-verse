'use client';

import { getApp, getApps, initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

import { useCollection } from '@/firebase/firestore/use-collection';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useUser } from '@/firebase/provider';
import { firebaseConfig } from './config';

// This function initializes Firebase and returns the services.
// It uses a singleton pattern to ensure it's only initialized once.
function initializeFirebaseServices(): { firebaseApp: FirebaseApp; auth: Auth; firestore: Firestore } {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  return { firebaseApp: app, auth, firestore };
}

// Immediately initialize and get the services
const { auth, firestore: db } = initializeFirebaseServices();

// The initializeFirebase function for use in the client provider
const initializeFirebase = initializeFirebaseServices;


// Export the initialized instances and hooks
export {
  auth,
  db,
  useCollection,
  useDoc,
  useUser,
  initializeFirebase,
};
