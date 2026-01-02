'use server';

/**
 * @fileOverview An AI tool to automatically generate a batch of relevant test questions.
 *
 * - generateRelevantTestQuestions - A function that handles the question generation process.
 * - GenerateRelevantTestQuestionsInput - The input type for the generateRelevantTestQuestions function.
 * - GenerateRelevantTestQuestionsOutput - The return type for the generateRelevantTestQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestionSchema = z.object({
    questionText: z.string().describe('The generated question text.'),
    options: z.array(z.string()).min(4).describe('An array of at least 4 possible options for the question.'),
    correctAnswerIndex: z.number().int().min(0).describe('The index of the correct answer in the options array.'),
    explanation: z.string().describe('A concise explanation for the correct answer.'),
    topic: z.string().describe('The specific topic of the question, which should match the input topic.'),
    difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the question.'),
});

export const GenerateRelevantTestQuestionsInputSchema = z.object({
  topic: z.string().describe('The overarching topic for all generated questions.'),
  examName: z.string().describe('The name of the exam the questions are for.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level for the questions.'),
  count: z.number().int().min(1).max(10).describe('The number of questions to generate.'),
});

export type GenerateRelevantTestQuestionsInput = z.infer<typeof GenerateRelevantTestQuestionsInputSchema>;

export const GenerateRelevantTestQuestionsOutputSchema = z.object({
    questions: z.array(QuestionSchema).describe('An array of generated questions.')
});

export type GenerateRelevantTestQuestionsOutput = z.infer<typeof GenerateRelevantTestQuestionsOutputSchema>;

export async function generateRelevantTestQuestions(input: GenerateRelevantTestQuestionsInput): Promise<GenerateRelevantTestQuestionsOutput> {
  return generateRelevantTestQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRelevantTestQuestionsPrompt',
  input: {schema: GenerateRelevantTestQuestionsInputSchema},
  output: {schema: GenerateRelevantTestQuestionsOutputSchema},
  prompt: `You are an expert in generating test questions for various exams.

  Based on the provided topic, exam name, difficulty level, and count, generate a batch of relevant test questions with multiple-choice options.
  Ensure that all questions are appropriate for the specified difficulty level and align with the exam's content.

  Topic: {{{topic}}}
  Exam Name: {{{examName}}}
  Difficulty: {{{difficulty}}}
  Number of Questions: {{{count}}}

  Each question must have at least 4 options, and the correctAnswerIndex must be a valid index within the options array.
  Provide a concise explanation for each correct answer.
  Ensure the output is a valid JSON object that conforms to the following schema:
  {{outputSchema}}`,
});

const generateRelevantTestQuestionsFlow = ai.defineFlow(
  {
    name: 'generateRelevantTestQuestionsFlow',
    inputSchema: GenerateRelevantTestQuestionsInputSchema,
    outputSchema: GenerateRelevantTestQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
