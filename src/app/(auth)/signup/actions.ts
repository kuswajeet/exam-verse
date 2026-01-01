'use server';

import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { z } from "zod";

export type SignupFormState = {
  status: 'success' | 'error' | 'idle';
  message: string;
};

// Use initializeApp from firebase-admin/app
const app = !getApps().length ? initializeApp() : getApp();
const auth = getAuth(app);
const db = getFirestore(app);


const signupSchema = z.object({
  fullName: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email"),
  mobileNumber: z.string().regex(/^\d{10}$/, "Must be 10 digits"),
  password: z.string().min(6, "Password too short"),
  targetExam: z.string().min(1, "Select an exam"),
});

export async function signupAction(
  prevState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  
  const rawData = {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    mobileNumber: formData.get('mobileNumber'),
    password: formData.get('password'),
    targetExam: formData.get('targetExam'),
  };

  const validatedFields = signupSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: validatedFields.error.errors[0].message,
    };
  }

  const { email, password, fullName, mobileNumber, targetExam } = validatedFields.data;
  
  try {
    const userRecord = await auth.createUser({
        email,
        password,
        displayName: fullName,
    });

    await auth.setCustomUserClaims(userRecord.uid, { role: 'student' });
    
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      name: fullName,
      mobileNumber: mobileNumber,
      role: 'student',
      enrolledExams: [targetExam],
      createdAt: new Date().toISOString(),
    });

    return {
      status: 'success',
      message: 'Account created! Please log in.',
    };

  } catch (error: any) {
    console.error('Signup Error:', error);
    let msg = 'Signup failed.';
    if (error.code === 'auth/email-already-exists') msg = 'Email already exists.';
    return { status: 'error', message: msg };
  }
}
