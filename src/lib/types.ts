export interface User {
  uid: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: 'admin' | 'student';
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Test {
  id: string;
  title: string;
  subject: string;
  isFree: boolean;
  price: number;
  durationMinutes: number;
  totalMarks: number;
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
  completedAt: Date;
}
