

import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: 'admin' | 'student';
  mobileNumber?: string;
  enrolledExams?: string[];
  purchasedTests?: string[];
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  category: string;
  examName: string;
  subject: string;
  topic: string;
  subTopic?: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: 'single_choice' | 'one_liner';
  previousYear?: string | null;
  sourceExamName?: string | null;
}

export interface Test {
  id: string;
  title: string;
  category: string;
  examName: string;
  subject: string;
  isFree: boolean;
  price: number;
  durationMinutes: number;
  totalMarks: number;
  questionCount?: number;
  questionIds?: string[];
  isPublished?: boolean;
  createdAt?: Timestamp;
}

export interface TestWithQuestions extends Test {
  questions: Question[];
}

export interface TestAttempt {
  id: string;
  userId: string;
  testId: string;
  testTitle: string;
  answers: { [questionId: string]: number };
  score: number;
  totalQuestions: number;
  completedAt: Timestamp;
}

    