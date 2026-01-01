'use server';

import { getSdks } from "@/firebase";
import { setDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { z } from "zod";

export type SignupFormState = {
  status: 'success' | 'error' | 'idle';
  message: string;
};

const signupSchema = z.object({
  fullName: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email"),
  mobileNumber: z.string().length(10, "Must be 10 digits"),
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
  const { auth, firestore: db } = getSdks();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      name: fullName,
      mobileNumber: mobileNumber,
      role: 'student',
      enrolledExams: [targetExam],
      createdAt: new Date().toISOString(),
    });

    return {
      status: 'success',
      message: 'Account created! Redirecting...',
    };

  } catch (error: any) {
    console.error('Signup Error:', error);
    let msg = 'Signup failed.';
    if (error.code === 'auth/email-already-in-use') msg = 'Email already exists.';
    return { status: 'error', message: msg };
  }
}
