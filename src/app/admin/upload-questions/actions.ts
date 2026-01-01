"use server";

import type { Question } from "@/lib/types";
import Papa from "papaparse";

export type FormState = {
  status: "success" | "error" | "idle";
  data: Question[] | null;
  message: string;
};

function getCorrectAnswerIndex(letter: string): number {
    const upperLetter = letter.toUpperCase();
    if (upperLetter === 'A') return 0;
    if (upperLetter === 'B') return 1;
    if (upperLetter === 'C') return 2;
    if (upperLetter === 'D') return 3;
    return -1;
}

export async function uploadQuestionsAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const file = formData.get("csvFile") as File;

  if (!file || file.size === 0) {
    return { status: "error", data: null, message: "No file selected." };
  }

  if (file.type !== "text/csv") {
    return { status: "error", data: null, message: "Invalid file type. Please upload a CSV." };
  }

  const csvText = await file.text();

  try {
    const result = Papa.parse<any>(csvText, { header: true, skipEmptyLines: true });
    
    if (result.errors.length > 0) {
        console.error("CSV Parsing errors:", result.errors);
        return { status: "error", data: null, message: `Error parsing CSV: ${result.errors[0].message}` };
    }
    
    const requiredHeaders = ["Question", "OptionA", "OptionB", "OptionC", "OptionD", "CorrectAnswer", "Explanation", "Topic", "Difficulty"];
    const actualHeaders = result.meta.fields || [];
    const missingHeaders = requiredHeaders.filter(h => !actualHeaders.includes(h));

    if (missingHeaders.length > 0) {
        return { status: "error", data: null, message: `CSV is missing required headers: ${missingHeaders.join(", ")}` };
    }

    const questions: Question[] = result.data.map((row, index) => {
        const difficulty = row.Difficulty?.toLowerCase();
        if (!['easy', 'medium', 'hard'].includes(difficulty)) {
            throw new Error(`Invalid difficulty value at row ${index + 2}: ${row.Difficulty}`);
        }

        const correctAnswerIndex = getCorrectAnswerIndex(row.CorrectAnswer);
        if (correctAnswerIndex === -1) {
            throw new Error(`Invalid CorrectAnswer value at row ${index + 2}: ${row.CorrectAnswer}. Must be A, B, C, or D.`);
        }

        return {
            id: `csv-${Date.now()}-${index}`,
            questionText: row.Question,
            options: [row.OptionA, row.OptionB, row.OptionC, row.OptionD],
            correctAnswerIndex: correctAnswerIndex,
            explanation: row.Explanation,
            topic: row.Topic,
            difficulty: difficulty,
        };
    });

    // In a real app, you would save these questions to the database.
    console.log("Parsed Questions:", questions);

    return {
      status: "success",
      data: questions,
      message: `Successfully parsed ${questions.length} questions from the CSV.`,
    };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during parsing.";
    return {
      status: "error",
      data: null,
      message: `Failed to process CSV: ${errorMessage}`,
    };
  }
}
