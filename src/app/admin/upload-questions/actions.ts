"use server";

import { collection, writeBatch, doc } from "firebase/firestore";
import { getSdks } from "@/firebase/server";
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
  const examName = formData.get("examName") as string;
  const subject = formData.get("subject") as string;
  const category = formData.get("category") as string;
  const subTopic = formData.get("subTopic") as string;

  if (!file || file.size === 0) {
    return { status: "error", data: null, message: "No file selected." };
  }

  if (file.type !== "text/csv") {
    return { status: "error", data: null, message: "Invalid file type. Please upload a CSV." };
  }

  if (!examName || !subject || !category) {
    return { status: "error", data: null, message: "Please select an exam, subject, and category." };
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
        
        const questionId = `csv-${Date.now()}-${index}`;

        return {
            id: questionId,
            questionText: row.Question,
            options: [row.OptionA, row.OptionB, row.OptionC, row.OptionD],
            correctAnswerIndex: correctAnswerIndex,
            explanation: row.Explanation,
            category: category,
            examName: examName,
            subject: subject,
            topic: row.Topic,
            subTopic: subTopic,
            difficulty: difficulty,
            questionType: 'single_choice'
        };
    });

    const { firestore } = getSdks();
    const batch = writeBatch(firestore);
    const questionsRef = collection(firestore, "questions");
    
    questions.forEach((question) => {
      const docRef = doc(questionsRef, question.id);
      batch.set(docRef, question);
    });

    await batch.commit();


    return {
      status: "success",
      data: questions,
      message: `Successfully saved ${questions.length} questions to Firestore.`,
    };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during parsing or saving.";
    return {
      status: "error",
      data: null,
      message: `Failed to process CSV: ${errorMessage}`,
    };
  }
}
