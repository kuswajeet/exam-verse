import { initializeFirebase } from "./index";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Initialize the app using the shared logic
const app = initializeFirebase();

// Export the instances for use in pages
export const auth = getAuth(app);
export const db = getFirestore(app);