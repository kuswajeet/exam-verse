"use server";

import { 
  generateRelevantTestQuestions, 
  GenerateRelevantTestQuestionsInput, 
  GenerateRelevantTestQuestionsOutput 
} from "@/ai/flows/generate-relevant-test-questions";
import type { Question } from "@/lib/types";

export type FormState = {
  status: 'success' | 'error' | 'idle';
  data: GenerateRelevantTestQuestionsOutput | null;
  message: string;
}

const createMockQuestion = (topic: string, index: number): Question => ({
  id: `mock-${Date.now()}-${index}`,
  questionText: `This is mock question ${index + 1} about ${topic}. What is the primary color of the sky on a clear day?`,
  options: ["Blue", "Green", "Red", "Yellow"],
  correctAnswerIndex: 0,
  explanation: "The sky appears blue due to Rayleigh scattering of sunlight.",
  topic: topic,
  difficulty: "easy",
  category: "Mock",
  examName: "Mock Exam",
  subject: "Mock Subject",
  questionType: 'single_choice'
});

export async function generateQuestionsAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  
  const rawCount = formData.get("count");
  const count = rawCount ? parseInt(rawCount as string, 10) : 5;

  const input: GenerateRelevantTestQuestionsInput = {
    topic: formData.get("topic") as string,
    examName: formData.get("examName") as string,
    difficulty: formData.get("difficulty") as 'easy' | 'medium' | 'hard',
    count: count,
  };

  try {
    // This is where you would call your AI generation logic
    const result = await generateRelevantTestQuestions(input);
    return {
      status: 'success',
      data: result,
      message: 'Questions generated successfully!',
    };
  } catch (error) {
    console.error("AI Generation Error:", error);
    // Fallback to mock data if AI fails
    const mockQuestions = Array.from({ length: input.count }, (_, i) => 
        createMockQuestion(input.topic, i)
    );
    return {
      status: 'success', // Still success from a UI perspective
      data: { questions: mockQuestions },
      message: 'AI generation failed. Displaying mock questions as a fallback.',
    };
  }
}
