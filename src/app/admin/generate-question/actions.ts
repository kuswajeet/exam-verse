"use server";

import { generateRelevantTestQuestion, GenerateRelevantTestQuestionInput, GenerateRelevantTestQuestionOutput } from "@/ai/flows/generate-relevant-test-question";

export type FormState = {
  status: 'success' | 'error' | 'idle';
  data: GenerateRelevantTestQuestionOutput | null;
  message: string;
}

export async function generateQuestionAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const input: GenerateRelevantTestQuestionInput = {
    topic: formData.get("topic") as string,
    examName: formData.get("examName") as string,
    difficulty: formData.get("difficulty") as 'easy' | 'medium' | 'hard',
  };

  try {
    const result = await generateRelevantTestQuestion(input);
    return {
      status: 'success',
      data: result,
      message: 'Question generated successfully!',
    };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      status: 'error',
      data: null,
      message: `Failed to generate question: ${errorMessage}`,
    };
  }
}
