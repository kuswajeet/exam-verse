import type { User, Test, Question, TestAttempt } from '@/lib/types';
import { PlaceHolderImages } from './placeholder-images';

export const mockUser: User = {
  uid: '1',
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  role: 'student',
  avatarUrl: PlaceHolderImages.find(p => p.id === 'user-avatar-1')?.imageUrl,
};

export const mockQuestions: Question[] = [
  {
    id: 'q1',
    questionText: 'What is the capital of France?',
    options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
    correctAnswerIndex: 2,
    explanation: 'Paris is the capital and most populous city of France.',
    topic: 'Geography',
    difficulty: 'easy',
  },
  {
    id: 'q2',
    questionText: 'Which planet is known as the Red Planet?',
    options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
    correctAnswerIndex: 1,
    explanation: 'Mars is often called the "Red Planet" because of its reddish appearance.',
    topic: 'Astronomy',
    difficulty: 'easy',
  },
  {
    id: 'q3',
    questionText: 'What is the powerhouse of the cell?',
    options: ['Nucleus', 'Ribosome', 'Mitochondrion', 'Cell Wall'],
    correctAnswerIndex: 2,
    explanation: 'Mitochondria are responsible for generating most of the cell\'s supply of adenosine triphosphate (ATP), used as a source of chemical energy.',
    topic: 'Biology',
    difficulty: 'medium',
  },
  {
    id: 'q4',
    questionText: 'Who wrote "To Kill a Mockingbird"?',
    options: ['Harper Lee', 'J.K. Rowling', 'Ernest Hemingway', 'Mark Twain'],
    correctAnswerIndex: 0,
    explanation: 'Harper Lee published "To Kill a Mockingbird" in 1960, and it was an immediate success.',
    topic: 'Literature',
    difficulty: 'medium',
  },
  {
    id: 'q5',
    questionText: 'What is the value of x in the equation 2x + 3 = 11?',
    options: ['3', '4', '5', '6'],
    correctAnswerIndex: 1,
    explanation: '2x + 3 = 11 -> 2x = 8 -> x = 4.',
    topic: 'Algebra',
    difficulty: 'easy',
  }
];

export const mockTests: Test[] = [
  {
    id: 'test1',
    title: 'General Knowledge - I',
    subject: 'General Knowledge',
    isFree: true,
    price: 0,
    durationMinutes: 5,
    totalMarks: 5,
    questions: mockQuestions,
  },
  {
    id: 'test2',
    title: 'Basic Science Quiz',
    subject: 'Science',
    isFree: false,
    price: 4.99,
    durationMinutes: 10,
    totalMarks: 10,
    questions: [mockQuestions[1], mockQuestions[2]],
  },
    {
    id: 'test3',
    title: 'Algebra Fundamentals',
    subject: 'Mathematics',
    isFree: true,
    price: 0,
    durationMinutes: 15,
    totalMarks: 15,
    questions: [mockQuestions[4], mockQuestions[0], mockQuestions[3]],
  },
];

export const mockTestAttempts: TestAttempt[] = [
  {
    id: 'attempt1',
    userId: '1',
    testId: 'test1',
    testTitle: 'General Knowledge - I',
    answers: { q1: 2, q2: 1, q3: 1, q4: 0, q5: 1 },
    score: 4,
    totalQuestions: 5,
    completedAt: new Date('2023-10-26T10:00:00Z'),
  },
  {
    id: 'attempt2',
    userId: '1',
    testId: 'test2',
    testTitle: 'Basic Science Quiz',
    answers: { q2: 1, q3: 2 },
    score: 2,
    totalQuestions: 2,
    completedAt: new Date('2023-10-27T14:30:00Z'),
  },
];
