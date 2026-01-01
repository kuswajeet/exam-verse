'use server';

/**
 * @fileOverview An AI tool to automatically generate a relevant test question.
 *
 * - generateRelevantTestQuestion - A function that handles the question generation process.
 * - GenerateRelevantTestQuestionInput - The input type for the generateRelevantTestQuestion function.
 * - GenerateRelevantTestQuestionOutput - The return type for the generateRelevantTestQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRelevantTestQuestionInputSchema = z.object({
  topic: z.string().describe('The topic of the test question.'),
  examName: z.string().describe('The name of the exam.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the question.'),
});

export type GenerateRelevantTestQuestionInput = z.infer<typeof GenerateRelevantTestQuestionInputSchema>;

const GenerateRelevantTestQuestionOutputSchema = z.object({
  questionText: z.string().describe('The generated question text.'),
  options: z.array(z.string()).describe('The possible options for the question.'),
  correctAnswerIndex: z.number().int().min(0).describe('The index of the correct answer in the options array.'),
  explanation: z.string().describe('The explanation for the correct answer.'),
});

export type GenerateRelevantTestQuestionOutput = z.infer<typeof GenerateRelevantTestQuestionOutputSchema>;

export async function generateRelevantTestQuestion(input: GenerateRelevantTestQuestionInput): Promise<GenerateRelevantTestQuestionOutput> {
  return generateRelevantTestQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRelevantTestQuestionPrompt',
  input: {schema: GenerateRelevantTestQuestionInputSchema},
  output: {schema: GenerateRelevantTestQuestionOutputSchema},
  prompt: `You are an expert in generating test questions for various exams.

  Based on the provided topic, exam name, and difficulty level, generate a relevant test question with multiple-choice options.
  Ensure that the question is appropriate for the specified difficulty level and aligns with the exam's content.

  Topic: {{{topic}}}
  Exam Name: {{{examName}}}
  Difficulty: {{{difficulty}}}

  The question should have at least 4 options, and the correct answer index should be a valid index within the options array.
  Provide a concise explanation for the correct answer.
  Ensure the output is valid JSON.
  Here is the output schema:
  {{outputSchema}}`,
});

const generateRelevantTestQuestionFlow = ai.defineFlow(
  {
    name: 'generateRelevantTestQuestionFlow',
    inputSchema: GenerateRelevantTestQuestionInputSchema,
    outputSchema: GenerateRelevantTestQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
