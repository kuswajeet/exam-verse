'use server';

import { getSdks } from "@/firebase";
import { setDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from 'firebase/auth';

export type SignupFormState = {
  status: 'success' | 'error' | 'idle';
  message: string;
};

export async function signupAction(
  prevState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const { auth, firestore } = getSdks();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const mobileNumber = formData.get('mobileNumber') as string;
  const targetExam = formData.get('targetExam') as string;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(firestore, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      name: fullName,
      mobileNumber: mobileNumber,
      role: 'student',
      enrolledExams: [targetExam],
      purchasedTests: [],
    });

    // Check if user is admin and add to roles_admin collection if so
    // For now, we assume all signups are students. Admin creation can be a separate process.

    return {
      status: 'success',
      message: 'Account created successfully! Redirecting to login...',
    };
  } catch (error: any) {
    let errorMessage = 'An unexpected error occurred.';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already in use. Please try another one.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'The password is too weak. Please choose a stronger password.';
    }
    console.error('Signup Error:', error);
    return {
      status: 'error',
      message: errorMessage,
    };
  }
}
