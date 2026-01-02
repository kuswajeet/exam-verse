"use server";

import { 
  GenerateRelevantTestQuestionsOutput 
} from "@/ai/flows/generate-relevant-test-questions";
import type { Question } from "@/lib/types";

export type FormState = {
  status: 'success' | 'error' | 'idle';
  data: GenerateRelevantTestQuestionsOutput | null;
  message: string;
}

const createMockQuestion = (topic: string, difficulty: 'easy' | 'medium' | 'hard', index: number): Question => ({
  id: `mock-${Date.now()}-${index}`,
  questionText: `(Mock) What is the core concept of ${topic}? (Question ${index + 1})`,
  options: [`${topic} concept A`, `${topic} concept B`, `${topic} concept C`, `${topic} concept D`],
  correctAnswerIndex: 0,
  explanation: `This is a sample explanation for ${topic} generated in mock mode.`,
  topic: topic,
  difficulty: difficulty,
  category: "Mock Category",
  examName: "Mock Exam",
  subject: "Mock Subject",
  questionType: 'single_choice',
});

export async function generateQuestionsAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  
  const rawCount = formData.get("count");
  const count = rawCount ? parseInt(rawCount as string, 10) : 5;
  const topic = formData.get("topic") as string;
  const difficulty = (formData.get("difficulty") || 'easy') as 'easy' | 'medium' | 'hard';

  // --- SIMULATED AI RESPONSE (MOCK DATA) ---
  // We are returning this directly to bypass the 401 Error
  const mockQuestions: Question[] = Array.from({ length: count }, (_, i) => 
    createMockQuestion(topic, difficulty, i)
  );
  
  return {
    status: 'success',
    data: { questions: mockQuestions },
    message: 'Displaying mock questions because AI generation is bypassed.',
  };
}
